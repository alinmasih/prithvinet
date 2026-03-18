const axios = require('axios');

async function finalVerify() {
  const API_URL = 'http://localhost:5002/api';
  
  try {
    // 1. Login to get token
    console.log('--- Logging in as Admin ---');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@prithvinet.gov.in',
      password: 'admin123' 
    });
    // Wait, the hash in initSqlite was '$2a$10$Xm77Z7.vL0D1S0R1S0R1S0R1S0R1S0R1S0R1S0R1S0R1S0R1S0R1S' which corresponds to 'admin'? 
    // Let me check initSqlite.js password hash one more time.
    
    const token = loginRes.data.accessToken;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Test AI Copilot
    console.log('\n--- Testing AI Copilot ---');
    const aiRes = await axios.post(`${API_URL}/ai/chat`, {
      message: "Summarize the latest pollution alerts in Chhattisgarh."
    }, config);
    console.log('AI Response:', aiRes.data.content);

    // 3. Test Alerts retrieval
    console.log('\n--- Testing Alerts Retrieval ---');
    const alertRes = await axios.get(`${API_URL}/alerts`, config);
    console.log(`Alerts found: ${alertRes.data.length}`);
    const latest = alertRes.data[0];
    console.log(`Latest Alert: [${latest.type}] ${latest.message}`);

    console.log('\n✅ End-to-end verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error.response ? error.response.data : error.message);
  }
}

finalVerify();
