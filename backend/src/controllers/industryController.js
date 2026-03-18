const db = require('../config/localDb');
const { generateWhiteCategoryPDF } = require('../services/pdfService');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Helper to map industry for frontend
const mapIndustry = (ind) => {
  if (!ind) return null;
  return {
    ...ind,
    _id: ind.id,
    industryName: ind.industry_name,
    industryType: ind.industry_type,
    ownerName: ind.owner_name,
    approvalStatus: ind.approval_status,
    location: {
      type: 'Point',
      coordinates: [ind.location_lng || 81.63, ind.location_lat || 21.25]
    }
  };
};

// @desc    Get all industries
const getIndustries = async (req, res) => {
  try {
    const industries = db.prepare('SELECT * FROM industries').all();
    res.json(industries.map(mapIndustry));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single industry
const getIndustryById = async (req, res) => {
  try {
    const industry = db.prepare('SELECT * FROM industries WHERE id = ?').get(req.params.id);
    if (!industry) return res.status(404).json({ message: 'Industry not found' });
    res.json(mapIndustry(industry));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new industry
const createIndustry = async (req, res) => {
  try {
    const id = uuidv4();
    const { industry_name, address, product_name, product_activity, district, location_lat, location_lng, industry_type } = req.body;
    
    db.prepare(`
      INSERT INTO industries (id, industry_name, address, product_name, product_activity, district, location_lat, location_lng, industry_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, industry_name, address, product_name, product_activity, district, location_lat, location_lng, industry_type || 'Other');

    const industry = db.prepare('SELECT * FROM industries WHERE id = ?').get(id);
    res.status(201).json(mapIndustry(industry));
  } catch (error) {
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
};

// @desc    Update industry
const updateIndustry = async (req, res) => {
  try {
    const fields = Object.keys(req.body).map(k => `${k} = ?`).join(', ');
    const values = Object.values(req.body);
    values.push(req.params.id);

    db.prepare(`UPDATE industries SET ${fields} WHERE id = ?`).run(...values);
    const industry = db.prepare('SELECT * FROM industries WHERE id = ?').get(req.params.id);
    res.json(mapIndustry(industry));
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
};

// @desc    Delete industry
const deleteIndustry = async (req, res) => {
  try {
    db.prepare('DELETE FROM industries WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Industry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create Industry Intimation Form & Generate PDF
const createIntimationForm = async (req, res) => {
  const formData = req.body;
  try {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const referenceNumber = `WC-${date}-${random}`;
    const industryId = uuidv4();
    const formId = uuidv4();

    const pdfBytes = await generateWhiteCategoryPDF(formData, referenceNumber);

    const lat = formData.location?.coordinates?.[1] || 21.25;
    const lng = formData.location?.coordinates?.[0] || 81.63;

    db.prepare(`
      INSERT INTO industries (id, industry_name, address, product_name, product_activity, district, location_lat, location_lng, industry_category, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(industryId, formData.industry_name, formData.address, formData.product_name, formData.product_activity, formData.district, lat, lng, 'White', 'Pending');

    db.prepare(`
      INSERT INTO industry_forms (id, form_reference, industry_id, form_data, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(formId, referenceNumber, industryId, JSON.stringify(formData), 'Submitted');

    res.status(201).json({
      success: true,
      referenceNumber,
      industryId,
      pdfBase64: Buffer.from(pdfBytes).toString('base64')
    });
  } catch (error) {
    res.status(400).json({ message: 'Form generation failed', error: error.message });
  }
};

const submitSignedForm = async (req, res) => {
  const { formReference } = req.body;
  try {
    const form = db.prepare('SELECT * FROM industry_forms WHERE form_reference = ?').get(formReference);
    if (!form) return res.status(404).json({ message: 'Invalid Reference Number' });

    const pdfUrl = req.files?.signedForm?.[0]?.path || null;
    db.prepare('UPDATE industry_forms SET status = ?, pdf_url = ? WHERE id = ?').run('Signed', pdfUrl, form.id);

    res.json({ success: true, message: 'Official form submitted for CECB verification' });
  } catch (error) {
    res.status(500).json({ message: 'Submission failed', error: error.message });
  }
};

const getMyIndustryProfile = async (req, res) => {
  try {
    const industry = db.prepare('SELECT * FROM industries WHERE id = ?').get(req.user.industry_id);
    if (!industry) return res.status(404).json({ message: 'Industry profile not found' });
    res.json(mapIndustry(industry));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  createIntimationForm,
  submitSignedForm,
  getMyIndustryProfile
};
