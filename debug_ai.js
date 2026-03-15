require('dotenv').config({ path: './backend/.env' });
const aiService = require('./backend/src/services/aiService');

async function testAI() {
  console.log("Testing AI Service directly...");
  try {
    const context = {
      parameter_type: 'Air',
      target_horizons: ['24h', '48h', '72h'],
      historical_data: {
        monitoring_logs: [],
        iot_sensors: [],
        official_readings: []
      }
    };
    const result = await aiService.generateForecastingProjections(context);
    console.log("Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Direct Test Error:", error);
  }
}

testAI();
