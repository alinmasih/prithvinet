const ComplianceStatus = require('../models/ComplianceStatus');
const Industry = require('../models/Industry');

// @desc    Submit or update compliance status
// @route   POST /api/reports/compliance
// @access  Private (Industry, Admin, RO)
const submitComplianceStatus = async (req, res) => {
  try {
    const { industryId, aaqms, cems, eqms } = req.body;
    
    // Validate industry exists
    const industry = await Industry.findById(industryId);
    if (!industry) {
      return res.status(404).json({ message: 'Industry not found' });
    }

    const report = await ComplianceStatus.create({
      industry: industryId,
      aaqms,
      cems,
      eqms,
      submitted_by: req.user._id
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all compliance reports with role filtering
// @route   GET /api/reports/compliance
// @access  Private
const getComplianceReports = async (req, res) => {
  try {
    const query = {};

    // Role-based filtering
    if (req.user.role === 'Industry User') {
      query.industry = req.user.industry_id;
    } else if (req.user.role === 'Monitoring Team') {
      query.submitted_by = req.user._id;
    } else if (req.user.role === 'Regional Officer') {
      // Find industries in this region first
      const industries = await Industry.find({ regional_officer_id: req.user._id });
      const industryIds = industries.map(ind => ind._id);
      query.industry = { $in: industryIds };
    }

    const reports = await ComplianceStatus.find(query)
      .populate('industry', 'industryName district place')
      .populate('submitted_by', 'name')
      .sort({ timestamp: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// @desc    Export compliance report to PDF
// @route   GET /api/reports/compliance/export
// @access  Private (Admin, RO)
const exportCompliancePDF = async (req, res) => {
  try {
    const reports = await ComplianceStatus.find({})
      .populate('industry', 'industryName district place')
      .sort({ timestamp: -1 });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawText('CECB ENVIRONMENTAL COMPLIANCE REGISTRY', {
      x: 50,
      y: height - 50,
      size: 18,
      font: font,
      color: rgb(0, 0.4, 0.2),
    });

    page.drawText(`Report Generated: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 75,
      size: 10,
      font: regularFont,
    });

    // Table Header
    const tableTop = height - 110;
    const columns = [
      { header: 'SI No', x: 40, width: 30 },
      { header: 'Industry Name', x: 80, width: 200 },
      { header: 'RO/District', x: 290, width: 100 },
      { header: 'AAQMS (On)', x: 400, width: 60 },
      { header: 'AAQMS (Off)', x: 470, width: 60 },
      { header: 'CEMS (On)', x: 540, width: 60 },
      { header: 'CEMS (Off)', x: 610, width: 60 },
      { header: 'EQMS (On)', x: 680, width: 60 },
      { header: 'EQMS (Off)', x: 750, width: 60 },
    ];

    page.drawRectangle({
      x: 35,
      y: tableTop - 20,
      width: 770,
      height: 25,
      color: rgb(0.9, 0.9, 0.9),
    });

    columns.forEach(col => {
      page.drawText(col.header, {
        x: col.x,
        y: tableTop - 5,
        size: 9,
        font: font,
      });
    });

    // Table Data
    let currentY = tableTop - 35;
    reports.forEach((report, index) => {
      if (currentY < 50) return; // Basic paging check for demo

      const rowData = [
        { text: (index + 1).toString(), x: 40 },
        { text: report.industry?.industryName || 'N/A', x: 80 },
        { text: report.industry?.district || 'N/A', x: 290 },
        { text: (report.aaqms?.online || 0).toString(), x: 400 },
        { text: (report.aaqms?.offline || 0).toString(), x: 470 },
        { text: (report.cems?.online || 0).toString(), x: 540 },
        { text: (report.cems?.offline || 0).toString(), x: 610 },
        { text: (report.eqms?.online || 0).toString(), x: 680 },
        { text: (report.eqms?.offline || 0).toString(), x: 750 },
      ];

      rowData.forEach(item => {
        page.drawText(item.text, {
          x: item.x,
          y: currentY,
          size: 8,
          font: regularFont,
        });
      });

      currentY -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Error generating PDF report' });
  }
};

module.exports = {
  submitComplianceStatus,
  getComplianceReports,
  exportCompliancePDF
};
