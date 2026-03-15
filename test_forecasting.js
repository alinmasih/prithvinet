const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const API_BASE_URL = 'http://localhost:5002/api';

async function testForecasting() {
  console.log('--- Testing Forecasting API ---');
  
  try {
    // 1. Test GET /api/forecasting?type=Air
    console.log('Testing GET /api/forecasting?type=Air...');
    const airRes = await axios.get(`${API_BASE_URL}/forecasting?type=Air`);
    
    if (airRes.data.forecasts) {
      console.log('✅ Success: Received air forecasts');
      console.log(`Count: ${airRes.data.forecasts.length}`);
      console.log('Sample Step:', airRes.data.forecasts[0]);
    } else if (airRes.data.error) {
      console.warn('⚠️ AI Service reported error:', airRes.data.error);
    } else {
      console.error('❌ Failed: Unexpected response structure', airRes.data);
    }

    // 2. Test GET /api/forecasting?type=Water
    console.log('\nTesting GET /api/forecasting?type=Water...');
    const waterRes = await axios.get(`${API_BASE_URL}/forecasting?type=Water`);
    if (waterRes.data.forecasts) {
      console.log('✅ Success: Received water forecasts');
    }

  } catch (error) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

// Note: Requires backend server to be running.
testForecasting();
