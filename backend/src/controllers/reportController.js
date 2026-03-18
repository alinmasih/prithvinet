const db = require('../config/localDb');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// @desc    Submit or update compliance status
// @route   POST /api/reports/compliance
// @access  Private (Industry, Admin, RO)
const submitComplianceStatus = async (req, res) => {
  try {
    const { industryId, aaqms, cems, eqms } = req.body;
    
    // Validate industry exists
    const industry = db.prepare('SELECT * FROM industries WHERE id = ?').get(industryId);

    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }

    const reportId = require('uuid').v4();
    const valueJson = JSON.stringify({ aaqms, cems, eqms, industry_id: industryId });
    const userId = req.user.id || req.user._id;

    db.prepare(`
      INSERT INTO monitoring_logs (id, monitoring_type, value, submitted_by, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(reportId, 'Compliance', valueJson, userId, new Date().toISOString());

    const report = db.prepare('SELECT * FROM monitoring_logs WHERE id = ?').get(reportId);
    res.status(201).json({ ...report, _id: report.id });
  } catch (error) {
    console.error('submitComplianceStatus error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all compliance reports with role filtering
// @route   GET /api/reports/compliance
// @access  Private
const getComplianceReports = async (req, res) => {
  try {
    let queryStr = `
      SELECT l.*, u.name as user_name 
      FROM monitoring_logs l
      LEFT JOIN users u ON l.submitted_by = u.id
      WHERE l.monitoring_type = 'Compliance'
    `;
    let params = [];

    // Role-based filtering (simplified for SQLite)
    if (req.user.role === 'Industry User') {
      queryStr += ` AND json_extract(l.value, '$.industry_id') = ? `;
      params.push(req.user.industry_id);
    } else if (req.user.role === 'Monitoring Team') {
      queryStr += ` AND l.submitted_by = ? `;
      params.push(req.user.id || req.user._id);
    }

    queryStr += ` ORDER BY l.timestamp DESC `;
    
    const reports = db.prepare(queryStr).all(...params);

    // Fetch Industries for mapping
    const industries = db.prepare('SELECT id, industry_name, district, owner_name, owner_mobile FROM industries').all();
    const industryMap = industries.reduce((acc, ind) => ({ ...acc, [ind.id]: ind }), {});

    const mappedReports = reports.map(r => {
      const val = JSON.parse(r.value || '{}');
      const ind = industryMap[val.industry_id];
      return {
        ...r,
        _id: r.id,
        industry: ind ? {
             _id: ind.id,
             industryName: ind.industry_name,
             district: ind.district,
             owner_name: ind.owner_name,
             owner_mobile: ind.owner_mobile
        } : null,
        aaqms: val.aaqms,
        cems: val.cems,
        eqms: val.eqms,
        submitted_by: { name: r.user_name || 'System' }
      };
    });

    res.json(mappedReports);
  } catch (error) {
    console.error('getComplianceReports error:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Export compliance report to PDF
// @route   GET /api/reports/compliance/export
// @access  Private (Admin, RO)
const exportCompliancePDF = async (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT l.*, u.name as user_name 
      FROM monitoring_logs l
      LEFT JOIN users u ON l.submitted_by = u.id
      WHERE l.monitoring_type = 'Compliance'
      ORDER BY l.timestamp DESC
    `).all();

    const industries = db.prepare('SELECT id, industry_name, district FROM industries').all();
    const industryMap = industries.reduce((acc, ind) => ({ ...acc, [ind.id]: ind }), {});

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); 
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('CECB ENVIRONMENTAL COMPLIANCE REGISTRY', {
      x: 50,
      y: height - 50,
      size: 18,
      font: font,
      color: rgb(0, 0.4, 0.2),
    });

    const tableTop = height - 110;
    const columns = [
      { header: 'SI No', x: 40 },
      { header: 'Industry Name', x: 80 },
      { header: 'RO/District', x: 290 },
      { header: 'AAQMS', x: 400 },
      { header: 'CEMS', x: 540 },
      { header: 'EQMS', x: 680 },
    ];

    page.drawRectangle({ x: 35, y: tableTop - 20, width: 770, height: 25, color: rgb(0.9, 0.9, 0.9) });
    columns.forEach(col => { page.drawText(col.header, { x: col.x, y: tableTop - 5, size: 9, font: font }); });

    let currentY = tableTop - 35;
    logs.forEach((log, index) => {
      if (currentY < 50) return; 
      const val = JSON.parse(log.value || '{}');
      const ind = industryMap[val.industry_id];
      
      page.drawText((index + 1).toString(), { x: 40, y: currentY, size: 8, font: regularFont });
      page.drawText(ind?.industry_name || 'N/A', { x: 80, y: currentY, size: 8, font: regularFont });
      page.drawText(ind?.district || 'N/A', { x: 290, y: currentY, size: 8, font: regularFont });
      page.drawText(`On:${val.aaqms?.online || 0}`, { x: 400, y: currentY, size: 8, font: regularFont });
      page.drawText(`On:${val.cems?.online || 0}`, { x: 540, y: currentY, size: 8, font: regularFont });
      page.drawText(`On:${val.eqms?.online || 0}`, { x: 680, y: currentY, size: 8, font: regularFont });

      currentY -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF Generation Error:', error.message);
    res.status(500).json({ message: 'Error generating PDF report: ' + error.message });
  }
};

module.exports = {
  submitComplianceStatus,
  getComplianceReports,
  exportCompliancePDF
};
