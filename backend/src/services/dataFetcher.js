const axios = require('axios');
const db = require('../config/localDb');
const { v4: uuidv4 } = require('uuid');

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;

/**
 * Fetch Air Quality data from data.gov.in
 */
async function fetchAirQuality() {
  try {
    console.log('Fetching live Air Quality data from data.gov.in...');
    
    if (!DATA_GOV_API_KEY || DATA_GOV_API_KEY === 'YOUR_MOCK_KEY') {
      return fetchSimulatedAirQuality();
    }

    const resourceId = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
    const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${DATA_GOV_API_KEY}&format=json&filters[state]=Chhattisgarh&limit=100`;
    
    const https = require('https');
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    
    const response = await axios.get(url, { httpsAgent });
    const records = response.data.records;

    if (!records || records.length === 0) {
      return fetchSimulatedAirQuality();
    }

    const insertLog = db.prepare(`
      INSERT INTO monitoring_logs (id, monitoring_type, location, value, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    records.forEach(r => {
      const id = uuidv4();
      const value = JSON.stringify({
        station_id: r.station_id || `${r.city}_${r.station}`,
        aqi: parseInt(r.pollutant_avg) || 0,
        pm25: parseInt(r.pm25_avg) || 0,
        pm10: parseInt(r.pm10_avg) || 0,
        city: r.city,
        state: r.state,
        lat: parseFloat(r.latitude) || 21.2514,
        lng: parseFloat(r.longitude) || 81.6296
      });
      insertLog.run(id, 'Air', r.station || r.city, value, new Date().toISOString());
    });

    console.log(`Live Air Quality data updated with ${records.length} records.`);
  } catch (error) {
    console.error('Error fetching live Air Quality data:', error.message);
    fetchSimulatedAirQuality(); 
  }
}

async function fetchSimulatedAirQuality() {
  const mockStations = [
    { id: 'ST01', name: 'Raipur Central', city: 'Raipur', lat: 21.2514, lon: 81.6296, aqi: 156, pm25: 65, pm10: 110 },
    { id: 'ST02', name: 'Bhilai Industrial Area', city: 'Bhilai', lat: 21.1938, lon: 81.3509, aqi: 185, pm25: 80, pm10: 140 },
    { id: 'ST03', name: 'Korba Power Plant Area', city: 'Korba', lat: 22.3595, lon: 82.7501, aqi: 210, pm25: 95, pm10: 180 },
    { id: 'ST04', name: 'Bilaspur Junction', city: 'Bilaspur', lat: 22.0760, lon: 82.1391, aqi: 92, pm25: 35, pm10: 75 },
    { id: 'ST05', name: 'Raigarh Industrial Zone', city: 'Raigarh', lat: 21.8974, lon: 83.3950, aqi: 178, pm25: 75, pm10: 135 }
  ];

  const insertLog = db.prepare(`
    INSERT INTO monitoring_logs (id, monitoring_type, location, value, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  mockStations.forEach(s => {
    insertLog.run(uuidv4(), 'Air', s.name, JSON.stringify({
      station_id: s.id,
      aqi: s.aqi,
      pm25: s.pm25,
      pm10: s.pm10,
      city: s.city,
      lat: s.lat,
      lng: s.lon
    }), new Date().toISOString());
  });
}

async function fetchWaterQuality() {
  try {
    const mockWater = [
      { id: 'W01', name: 'Mahanadi River - Raipur', lat: 21.2650, lon: 81.7500, ph: 7.2, do: 6.5, turbidity: 45, ci: 22, status: 'Safe' },
      { id: 'W02', name: 'Hasdeo River - Korba', lat: 22.3500, lon: 82.7400, ph: 6.8, do: 4.2, turbidity: 85, ci: 58, status: 'Moderate' },
      { id: 'W03', name: 'Shivnath River - Bhilai', lat: 21.1800, lon: 81.2800, ph: 6.5, do: 3.5, turbidity: 120, ci: 75, status: 'Unsafe' }
    ];

    const insertLog = db.prepare(`
      INSERT INTO monitoring_logs (id, monitoring_type, location, value, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    mockWater.forEach(w => {
      insertLog.run(uuidv4(), 'Water', w.name, JSON.stringify({
        station_id: w.id,
        ph_level: w.ph,
        dissolved_oxygen: w.do,
        turbidity: w.turbidity,
        contamination_index: w.ci,
        status: w.status,
        lat: w.lat,
        lng: w.lon
      }), new Date().toISOString());
    });
  } catch (error) {
    console.error('Error fetching Water Quality data:', error.message);
  }
}

async function fetchNoisePollution() {
  try {
    const mockNoise = [
      { id: 'N01', name: 'Raipur Civil Lines', lat: 21.2420, lon: 81.6420, db: 65, category: 'Moderate' },
      { id: 'N02', name: 'Bhilai Steel Plant Gate', lat: 21.1900, lon: 81.3600, db: 85, category: 'High' },
      { id: 'N03', name: 'Korba Bus Stand', lat: 22.3550, lon: 82.7480, db: 78, category: 'High' }
    ];

    const insertLog = db.prepare(`
      INSERT INTO monitoring_logs (id, monitoring_type, location, value, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    mockNoise.forEach(n => {
      insertLog.run(uuidv4(), 'Noise', n.name, JSON.stringify({
        station_id: n.id,
        noise_db: n.db,
        category: n.category,
        lat: n.lat,
        lng: n.lon
      }), new Date().toISOString());
    });
  } catch (error) {
    console.error('Error fetching Noise Pollution data:', error.message);
  }
}

async function updateAllEnvironmentalData() {
  console.log('🔄 Starting periodic environmental data refresh (Local SQLite)...');
  await fetchAirQuality();
  await fetchWaterQuality();
  await fetchNoisePollution();
  console.log('✅ Periodic refresh complete.');
}

module.exports = {
  updateAllEnvironmentalData
};
