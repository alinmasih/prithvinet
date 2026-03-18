const db = require('../config/localDb');

// @desc    Get real-time monitoring data for public maps
// @route   GET /api/public/pollution-data
const getPublicPollutionData = async (req, res) => {
  try {
    const airLogs = db.prepare(`
      SELECT l.*, u.name as user_name 
      FROM monitoring_logs l
      LEFT JOIN users u ON l.submitted_by = u.id
      WHERE l.monitoring_type = 'Air'
      ORDER BY l.timestamp DESC LIMIT 20
    `).all();

    const waterLogs = db.prepare(`
      SELECT l.*, u.name as user_name 
      FROM monitoring_logs l
      LEFT JOIN users u ON l.submitted_by = u.id
      WHERE l.monitoring_type = 'Water'
      ORDER BY l.timestamp DESC LIMIT 20
    `).all();

    const noiseLogs = db.prepare(`
      SELECT l.*, u.name as user_name 
      FROM monitoring_logs l
      LEFT JOIN users u ON l.submitted_by = u.id
      WHERE l.monitoring_type = 'Noise'
      ORDER BY l.timestamp DESC LIMIT 20
    `).all();

    // Map JSON values back to objects
    const parseLogs = (logs) => logs.map(l => ({
      ...l,
      value: JSON.parse(l.value || '{}'),
      submitted_by: { name: l.user_name || 'System' }
    }));

    res.json({
      air: parseLogs(airLogs),
      water: parseLogs(waterLogs),
      noise: parseLogs(noiseLogs),
      stations: [] // For now empty or static
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get compliance snapshots of industries
const getPublicIndustryStatus = async (req, res) => {
  try {
    const industries = db.prepare(`
      SELECT id, industry_name, industry_type, district, approval_status 
      FROM industries 
      WHERE approval_status = 'Approved'
    `).all();

    const mappedIndustries = industries.map(ind => ({
      industryName: ind.industry_name,
      industryType: ind.industry_type,
      district: ind.district,
      approvalStatus: ind.approval_status,
      _id: ind.id
    }));

    res.json({ 
       stats: [], 
       sampleIndustries: mappedIndustries 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get all regional offices for sidebar/navigation
const getAllRegionalOffices = async (req, res) => {
  try {
    const offices = db.prepare('SELECT id, office_name, district FROM regional_offices').all();
    res.json(offices.map(o => ({ ...o, _id: o.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getPublicPollutionData,
  getPublicIndustryStatus,
  getAllRegionalOffices
};
