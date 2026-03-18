const axios = require('axios');
const supabase = require('../config/supabaseClient');

// @desc    Get latest IoT sensor metrics (Proxy to external Render node)
// @route   GET /api/iot/latest
// @access  Public
const getLatestSensorData = async (req, res) => {
  try {
    const response = await axios.get('https://esp32-83qb.onrender.com/api/data', { timeout: 5000 });
    const externalData = response.data;
    
    // Optional: Save to local DB for history/cache
    const { error: insertError } = await supabase
      .from('sensor_data')
      .insert([
        {
          station_id: 'IoT-NODE-01',
          air_quality_ppm: externalData.air_quality_ppm,
          co_ppm: externalData.co_ppm,
          smoke_ppm: externalData.smoke_ppm,
          noise_db: externalData.noise_db,
          turbidity_ntu: externalData.turbidity_ntu,
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (insertError) console.error('Failed to cache sensor data:', insertError.message);

    res.json(externalData);
  } catch (error) {
    console.warn('External IoT sync failed, falling back to cached/simulated data.');
    
    // Fallback to latest cached data
    const { data: cachedData, error: fetchError } = await supabase
      .from('sensor_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (cachedData && !fetchError) {
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
