const CitizenReport = require('../models/CitizenReport');

// @desc    Create new complaint/report
// @route   POST /api/complaints
// @access  Public
const createComplaint = async (req, res) => {
  try {
    const report = await CitizenReport.create(req.body);
    
    // Create automated alert
    await require('../models/Alert').create({
      alert_type: 'Citizen Complaint',
      location: report.location,
      complaint: report._id,
      status: 'Active'
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Complaint Error:', error);
    res.status(400).json({ message: 'Invalid report data' });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private/Admin
const getComplaints = async (req, res) => {
  try {
    const reports = await CitizenReport.find({}).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComplaint,
  getComplaints
};
