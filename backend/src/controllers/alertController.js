const db = require('../config/localDb');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  try {
    let queryStr = `
      SELECT alerts.*, 
             users.name as officer_name,
             industries.industry_name
      FROM alerts
      LEFT JOIN users ON alerts.assigned_officer = users.id
      LEFT JOIN industries ON alerts.industry_id = industries.id
      WHERE 1=1
    `;
    
    let params = [];
    if (req.user.role === 'Regional Officer') {
      queryStr += ` AND alerts.region_id = ? `;
      params.push(req.user.assigned_region);
    }

    if (req.query.type === 'citizen') {
      queryStr += ` AND alerts.type = 'Citizen Complaint' `;
    }
    
    queryStr += ` ORDER BY alerts.timestamp DESC `;
    
    const alerts = db.prepare(queryStr).all(...params);
    console.log(`Alerts fetched: ${alerts.length} for role: ${req.user.role}`);

    // Map for frontend compatibility
    const mappedAlerts = alerts.map(a => ({
      ...a,
      _id: a.id,
      alert_type: a.type,
      assigned_officer: a.officer_name ? { name: a.officer_name, _id: a.assigned_officer } : null,
      industry: a.industry_name ? { industry_name: a.industry_name, _id: a.industry_id } : null,
      // Reconstruct complaint context if needed (similar to previous logic)
      complaint: a.type === 'Citizen Complaint' ? {
        pollution_type: a.message.split(': ')[1]?.split(' at ')[0] || 'Violation',
        location: a.message.split(' at ')[1] || 'Unknown',
        description: a.message
      } : null
    }));

    res.json(mappedAlerts);
  } catch (error) {
    console.error('getAlerts CRITICAL ERROR:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Update alert status
// @route   PATCH /api/alerts/:id/status
// @access  Private/Officer
const updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE alerts SET status = ? WHERE id = ?').run(status, req.params.id);
    
    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    
    res.json({ ...alert, _id: alert.id });
  } catch (error) {
    console.error('updateAlertStatus error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create an alert (System generated usually)
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
  try {
    const { id, type, message, severity, status, station_id, industry_id, complaint_id, assigned_officer, region_id } = req.body;
    const alertId = id || require('uuid').v4();
    
    db.prepare(`
      INSERT INTO alerts (id, type, message, severity, status, complaint_id, assigned_officer, region_id, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      alertId, 
      type, 
      message, 
      severity || 'Low', 
      status || 'Open', 
      complaint_id || null, 
      assigned_officer || null, 
      region_id || null, 
      new Date().toISOString()
    );

    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId);
    res.status(201).json({ ...alert, _id: alert.id });
  } catch (error) {
    console.error('createAlert error:', error.message);
    res.status(400).json({ message: 'Invalid alert data' });
  }
};

module.exports = {
  getAlerts,
  updateAlertStatus,
  createAlert
};
