const db = require('../config/localDb');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new complaint/report
const createComplaint = async (req, res) => {
  try {
    const { 
        reporter_name, 
        reporter_email, 
        reporter_phone, 
        issue_type, 
        pollution_type, 
        description, 
        location,
        district,
        anonymous 
    } = req.body;

    const finalIssueType = issue_type || pollution_type || 'Other';
    const finalLocation = district ? `${location} (${district})` : location;
    const reportId = uuidv4();
    const alertId = uuidv4();

    const valueJson = JSON.stringify({
      reporter_name: anonymous ? 'Anonymous' : (reporter_name || 'Guest Citizen'),
      reporter_email,
      reporter_phone,
      issue_type: finalIssueType,
      district: district,
      anonymous: anonymous
    });

    // Insert into monitoring_logs
    db.prepare(`
      INSERT INTO monitoring_logs (id, monitoring_type, location, remarks, value, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reportId, 'Complaint', finalLocation, description, valueJson, new Date().toISOString());

    // Create Alert
    db.prepare(`
      INSERT INTO alerts (id, type, message, severity, complaint_id, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(alertId, 'Citizen Complaint', `New Complaint: ${finalIssueType} at ${finalLocation}`, 'Medium', reportId, 'Open', new Date().toISOString());

    res.status(201).json({ id: reportId, _id: reportId });
  } catch (error) {
    console.error('Complaint Error:', error);
    res.status(400).json({ message: 'Invalid report data: ' + error.message });
  }
};

// @desc    Get all complaints
const getComplaints = async (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT * FROM monitoring_logs 
      WHERE monitoring_type = 'Complaint'
      ORDER BY timestamp DESC
    `).all();

    res.json(reports.map(r => {
      const val = JSON.parse(r.value || '{}');
      return { 
        ...r, 
        _id: r.id,
        reporter_name: val.reporter_name,
        issue_type: val.issue_type,
        description: r.remarks,
        created_at: r.timestamp
      };
    }));
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints
};
