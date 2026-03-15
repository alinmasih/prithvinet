const MonitoringStation = require('../models/MonitoringStation');

// @desc    Get all monitoring teams
// @route   GET /api/stations
// @access  Private
const getStations = async (req, res) => {
  try {
    const stations = await MonitoringStation.find({});
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single monitoring team
// @route   GET /api/stations/:id
// @access  Private
const getStationById = async (req, res) => {
  try {
    const station = await MonitoringStation.findById(req.params.id);
    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new monitoring team
// @route   POST /api/stations
// @access  Private/Admin
const createStation = async (req, res) => {
  try {
    const station = await MonitoringStation.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Station deployed successfully',
      data: station
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid station data', error: error.message });
  }
};

// @desc    Update monitoring team
// @route   PUT /api/stations/:id
// @access  Private/Admin
const updateStation = async (req, res) => {
  try {
    const station = await MonitoringStation.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (station) {
      res.json({
        success: true,
        message: 'Station updated successfully',
        data: station
      });
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid station data', error: error.message });
  }
};

// @desc    Delete monitoring team
// @route   DELETE /api/stations/:id
// @access  Private/Admin
const deleteStation = async (req, res) => {
  try {
    const station = await MonitoringStation.findByIdAndDelete(req.params.id);
    if (station) {
      res.json({ success: true, message: 'Station deleted successfully' });
    } else {
      res.status(404).json({ message: 'Station not found' });
    }
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
