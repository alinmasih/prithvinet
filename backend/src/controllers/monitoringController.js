const MonitoringLog = require('../models/MonitoringLog');
const { checkAndTriggerAlerts } = require('../services/alertService');

// @desc    Submit monitoring log (Air/Water/Noise)
// @route   POST /api/monitoring/:type
// @access  Private/Monitoring Team
const submitMonitoringLog = async (req, res) => {
  const { type } = req.params;
  const { location, value, remarks } = req.body;

  try {
    const log = await MonitoringLog.create({
      monitoring_type: type.charAt(0).toUpperCase() + type.slice(1),
      location,
      value,
      submitted_by: req.user._id,
      region: req.user.assigned_region,
      remarks
    });

    // Trigger alert engine (non-blocking)
    checkAndTriggerAlerts(log).catch(err => console.error('Alert engine error:', err));

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get logs submitted by my team or for my region
// @route   GET /api/monitoring/logs
// @query   type=Air|Water|Noise
const getRecentLogs = async (req, res) => {
  const { type } = req.query;
  const query = {};
  if (type) query.monitoring_type = type;

  // Filter by officeId if provided (Admin viewing specific office)
  if (req.query.officeId) {
    query.region = req.query.officeId;
  } else if (req.user.role === 'Regional Officer') {
    // Regional Officers only see logs from their own jurisdiction by default
    query.region = req.user.assigned_region;
  }

  try {
    const logs = await MonitoringLog.find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('submitted_by', 'name');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitMonitoringLog,
  getRecentLogs
};
