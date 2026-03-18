const supabase = require('../config/supabaseClient');

// @desc    Get all pollution readings
// @route   GET /api/pollution
// @access  Public
const getReadings = async (req, res) => {
  try {
    const { data: readings, error } = await supabase
      .from('monitoring_logs')
      .select('*, submitted_by:users(name)')
      .order('timestamp', { ascending: false });

    if (error) throw error;
    
    // Map for frontend compatibility if needed
    res.json((readings || []).map(r => ({
      ...r,
      _id: r.id,
      reading_type: r.monitoring_type,
      createdAt: r.timestamp
    })));
  } catch (error) {
    console.error("Supabase error in getReadings:", error.message);
    res.json([]);
  }
};

// @desc    Create new pollution reading
// @route   POST /api/pollution
// @access  Private
const createReading = async (req, res) => {
  try {
    const { stationId, reading_type, data } = req.body;
    
    const { data: reading, error: logError } = await supabase
      .from('monitoring_logs')
      .insert([{
        monitoring_type: reading_type,
        value: data,
        submitted_by: req.user.id || req.user._id,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();

    if (logError) throw logError;

    // Update status on station (MonitoringStation equivalent in Supabase)
    // In our schema, we don't have 'last_reading' yet, but we can add it if needed.
    // Let's check monitoring_stations table columns again (schema line 91)
    
    res.status(201).json({ ...reading, _id: reading.id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid reading data: ' + error.message });
  }
};

module.exports = {
  getReadings,
  createReading
};
