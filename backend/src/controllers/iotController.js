const axios = require('axios');
const SensorData = require('../models/SensorData');

// @desc    Get latest IoT sensor metrics (Proxy to external Render node)
// @route   GET /api/iot/latest
// @access  Public
const getLatestSensorData = async (req, res) => {
  try {
    const response = await axios.get('https://esp32-83qb.onrender.com/api/data', { timeout: 5000 });
    const externalData = response.data;
    
    // Optional: Save to local DB for history/cache
    await SensorData.create({
      ...externalData,
      station_id: 'IoT-NODE-01',
      timestamp: new Date()
    }).catch(err => console.error('Failed to cache sensor data:', err.message));

    res.json(externalData);
  } catch (error) {
    console.warn('External IoT sync failed, falling back to cached/simulated data.');
    
    // Fallback to latest cached data
    const cachedData = await SensorData.findOne().sort({ timestamp: -1 });
    if (cachedData) {
      return res.json(cachedData);
    }

    // Static fallback if even cache is empty
    res.json({
      air_quality_ppm: 45.2,
      co_ppm: 0.9,
      smoke_ppm: 14.1,
      noise_db: 58.4,
      turbidity_ntu: 18,
      timestamp: new Date()
    });
  }
};

module.exports = {
  getLatestSensorData
};
