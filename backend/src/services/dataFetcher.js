const axios = require('axios');
const AirQuality = require('../models/AirQuality');
const WaterQuality = require('../models/WaterQuality');
const NoisePollution = require('../models/NoisePollution');
const SensorData = require('../models/SensorData');

// Configuration - Use environment variables for API keys
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

/**
 * Fetch Air Quality data from data.gov.in
 * Dataset: Real-time Air Quality Index from various monitoring teams
 */
async function fetchAirQuality() {
  try {
    console.log('Fetching live Air Quality data from data.gov.in...');
    
    if (!DATA_GOV_API_KEY || DATA_GOV_API_KEY === 'YOUR_MOCK_KEY') {
      console.warn('DATA_GOV_API_KEY missing. Falling back to simulated data.');
      return fetchSimulatedAirQuality();
    }

    // Resource ID for Real-time AQI
    const resourceId = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
    // We filter for Chhattisgarh to optimize the request
    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${DATA_GOV_API_KEY}&format=json&filters[state]=Chhattisgarh&limit=100`;
    
    const response = await axios.get(url);
    const records = response.data.records;

    if (!records || records.length === 0) {
      console.log('No live records found for Chhattisgarh. Falling back to simulation.');
      return fetchSimulatedAirQuality();
    }

    for (const r of records) {
      // Data mapping from data.gov.in format
      // Note: Coordinates might not be in every record, fallback to city centers if needed
      // Most records include latitude/longitude
      const lat = parseFloat(r.latitude) || 21.2514; // Default to Raipur if missing
      const lon = parseFloat(r.longitude) || 81.6296;
      const avgAqi = parseInt(r.pollutant_avg) || 0;

      await AirQuality.findOneAndUpdate(
        { station_id: r.station_id || `${r.city}_${r.station}` },
        {
          station_name: r.station || r.city,
          city: r.city,
          state: r.state,
          location: { type: 'Point', coordinates: [lon, lat] },
          aqi: avgAqi,
          pm25: parseInt(r.pm25_avg) || 0,
          pm10: parseInt(r.pm10_avg) || 0,
          status: avgAqi > 200 ? 'Poor' : avgAqi > 100 ? 'Moderate' : 'Good',
          last_update: new Date()
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    console.log(`Live Air Quality data updated with ${records.length} records.`);
  } catch (error) {
    console.error('Error fetching live Air Quality data:', error.message);
    fetchSimulatedAirQuality(); // Robust fallback
  }
}

/**
 * Robust fallback with simulated data
 */
async function fetchSimulatedAirQuality() {
  const mockStations = [
    { id: 'ST01', name: 'Raipur Central', city: 'Raipur', lat: 21.2514, lon: 81.6296, aqi: 156, pm25: 65, pm10: 110 },
    { id: 'ST02', name: 'Bhilai Industrial Area', city: 'Bhilai', lat: 21.1938, lon: 81.3509, aqi: 185, pm25: 80, pm10: 140 },
    { id: 'ST03', name: 'Korba Power Plant Area', city: 'Korba', lat: 22.3595, lon: 82.7501, aqi: 210, pm25: 95, pm10: 180 },
    { id: 'ST04', name: 'Bilaspur Junction', city: 'Bilaspur', lat: 22.0760, lon: 82.1391, aqi: 92, pm25: 35, pm10: 75 },
    { id: 'ST05', name: 'Raigarh Industrial Zone', city: 'Raigarh', lat: 21.8974, lon: 83.3950, aqi: 178, pm25: 75, pm10: 135 }
  ];

  for (const s of mockStations) {
    await AirQuality.findOneAndUpdate(
      { station_id: s.id },
      {
        station_name: s.name,
        city: s.city,
        state: 'Chhattisgarh',
        location: { type: 'Point', coordinates: [s.lon, s.lat] },
        aqi: s.aqi,
        pm25: s.pm25,
        pm10: s.pm10,
        status: s.aqi > 200 ? 'Poor' : s.aqi > 100 ? 'Moderate' : 'Good',
        last_update: new Date()
      },
      { upsert: true }
    );
  }
}

/**
 * Fetch Water Quality data - Currently simulated as per requirements
 */
async function fetchWaterQuality() {
  try {
    const mockWater = [
      { id: 'W01', name: 'Mahanadi River - Raipur', lat: 21.2650, lon: 81.7500, ph: 7.2, do: 6.5, turbidity: 45, ci: 22, status: 'Safe' },
      { id: 'W02', name: 'Hasdeo River - Korba', lat: 22.3500, lon: 82.7400, ph: 6.8, do: 4.2, turbidity: 85, ci: 58, status: 'Moderate' },
      { id: 'W03', name: 'Shivnath River - Bhilai', lat: 21.1800, lon: 81.2800, ph: 6.5, do: 3.5, turbidity: 120, ci: 75, status: 'Unsafe' }
    ];

    for (const w of mockWater) {
      await WaterQuality.findOneAndUpdate(
        { station_id: w.id },
        {
          station_name: w.name,
          location: { type: 'Point', coordinates: [w.lon, w.lat] },
          ph_level: w.ph,
          dissolved_oxygen: w.do,
          turbidity: w.turbidity,
          contamination_index: w.ci,
          status: w.status,
          last_update: new Date()
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error fetching Water Quality data:', error.message);
  }
}

/**
 * Fetch Noise Pollution data - Currently simulated
 */
async function fetchNoisePollution() {
  try {
    const mockNoise = [
      { id: 'N01', name: 'Raipur Civil Lines', lat: 21.2420, lon: 81.6420, db: 65, category: 'Moderate' },
      { id: 'N02', name: 'Bhilai Steel Plant Gate', lat: 21.1900, lon: 81.3600, db: 85, category: 'High' },
      { id: 'N03', name: 'Korba Bus Stand', lat: 22.3550, lon: 82.7480, db: 78, category: 'High' }
    ];

    for (const n of mockNoise) {
      await NoisePollution.findOneAndUpdate(
        { station_id: n.id },
        {
          station_name: n.name,
          location: { type: 'Point', coordinates: [n.lon, n.lat] },
          noise_db: n.db,
          category: n.category,
          last_update: new Date()
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error fetching Noise Pollution data:', error.message);
  }
}


async function updateAllEnvironmentalData() {
  await fetchAirQuality();
  await fetchWaterQuality();
  await fetchNoisePollution();
}

module.exports = {
  updateAllEnvironmentalData
};
