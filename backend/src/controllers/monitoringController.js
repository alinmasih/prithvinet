const supabase = require('../config/supabaseClient');
const { checkAndTriggerAlerts } = require('../services/alertService');

// @desc    Submit monitoring log (Air/Water/Noise)
// @route   POST /api/monitoring/:type
// @access  Private/Monitoring Team
const submitMonitoringLog = async (req, res) => {
  const { type } = req.params;
  const { location, value, remarks } = req.body;

  try {
    const { data: log, error } = await supabase
      .from('monitoring_logs')
      .insert([{
        monitoring_type: type.charAt(0).toUpperCase() + type.slice(1),
        location,
        value,
        submitted_by: req.user.id || req.user._id,
        region_id: req.user.assigned_region,
        remarks
      }])
      .select()
      .single();

    if (error) throw error;

    // Trigger alert engine (non-blocking)
    checkAndTriggerAlerts(log).catch(err => console.error('Alert engine error:', err));

    res.status(201).json({ ...log, _id: log.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get logs submitted by my team or for my region
// @route   GET /api/monitoring/logs
// @query   type=Air|Water|Noise
const getRecentLogs = async (req, res) => {
  const { type } = req.query;
  
  try {
    let query = supabase
      .from('monitoring_logs')
      .select('*, submitted_by:users(name)')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (type) {
      query = query.eq('monitoring_type', type);
    }

    // Filter by officeId if provided (Admin viewing specific office)
    if (req.query.officeId) {
      query = query.eq('region_id', req.query.officeId);
    } else if (req.user && req.user.role === 'Regional Officer') {
      query = query.eq('region_id', req.user.assigned_region);
    }

    const { data: logs, error } = await query;
    if (error) throw error;

    // Map _id and populate submitted_by for frontend
    const mappedLogs = (logs || []).map(l => ({
      ...l,
      _id: l.id,
      submitted_by: l.submitted_by ? { name: l.submitted_by.name, _id: l.submitted_by_id } : null
    }));

    res.json(mappedLogs);
  } catch (error) {
    console.error('getRecentLogs error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitMonitoringLog,
  getRecentLogs
};
