const Alert = require('../models/Alert');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Private
const getAlerts = async (req, res) => {
  const query = {};
  
  if (req.user.role === 'Regional Officer') {
    query.region = req.user.assigned_region;
  }

  try {
    const alerts = await Alert.find(query)
      .populate('station', 'stationName location')
      .populate('industry', 'industryName')
      .populate('complaint')
      .populate('assigned_officer', 'name')
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update alert status
// @route   PATCH /api/alerts/:id/status
// @access  Private/Officer
const updateAlertStatus = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (alert) {
      alert.status = req.body.status || alert.status;
      const updatedAlert = await alert.save();
      res.json(updatedAlert);
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create an alert (System generated usually)
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ message: 'Invalid alert data' });
  }
};

module.exports = {
  getAlerts,
  updateAlertStatus,
  createAlert
};
