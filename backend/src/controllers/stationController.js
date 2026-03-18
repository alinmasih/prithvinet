const supabase = require('../config/supabaseClient');

// Helper to map station for frontend
const mapStation = (s) => ({
  ...s,
  _id: s.id,
  stationName: s.station_name, // Map back to CamelCase if frontend expects it
  location: {
    type: 'Point',
    coordinates: [s.location_lng, s.location_lat]
  }
});

// @desc    Get all monitoring stations
// @route   GET /api/stations
// @access  Private
const getStations = async (req, res) => {
  try {
    const { data: stations, error } = await supabase
      .from('monitoring_stations')
      .select('*');
    if (error) throw error;
    res.json(stations.map(mapStation));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single monitoring station
// @route   GET /api/stations/:id
// @access  Private
const getStationById = async (req, res) => {
  try {
    const { data: station, error } = await supabase
      .from('monitoring_stations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ message: 'Station not found' });
      throw error;
    }
    res.json(mapStation(station));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new monitoring station
// @route   POST /api/stations
// @access  Private/Admin
const createStation = async (req, res) => {
  try {
    const sData = { ...req.body };
    if (sData.location && sData.location.coordinates) {
      sData.location_lng = sData.location.coordinates[0];
      sData.location_lat = sData.location.coordinates[1];
      delete sData.location;
    }
    if (sData.stationName) {
      sData.station_name = sData.stationName;
      delete sData.stationName;
    }

    const { data: station, error } = await supabase
      .from('monitoring_stations')
      .insert([sData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({
      success: true,
      message: 'Station deployed successfully',
      data: mapStation(station)
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid station data', error: error.message });
  }
};

// @desc    Update monitoring station
// @route   PUT /api/stations/:id
// @access  Private/Admin
const updateStation = async (req, res) => {
  try {
    const sData = { ...req.body };
    if (sData.location && sData.location.coordinates) {
      sData.location_lng = sData.location.coordinates[0];
      sData.location_lat = sData.location.coordinates[1];
      delete sData.location;
    }
    if (sData.stationName) {
      sData.station_name = sData.stationName;
      delete sData.stationName;
    }

    const { data: station, error } = await supabase
      .from('monitoring_stations')
      .update(sData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({
      success: true,
      message: 'Station updated successfully',
      data: mapStation(station)
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid station data', error: error.message });
  }
};

// @desc    Delete monitoring station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
const deleteStation = async (req, res) => {
  try {
    const { error } = await supabase
      .from('monitoring_stations')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Station deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation
};
