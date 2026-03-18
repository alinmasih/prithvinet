const axios = require('axios');

async function testEntities() {
  const API_URL = 'http://localhost:5002/api';
  try {
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@prithvinet.gov.in',
      password: 'admin123'
    });
    const config = { headers: { Authorization: `Bearer ${loginRes.data.accessToken}` } };

    const offices = await axios.get(`${API_URL}/admin/regional-offices`, config);
    console.log('Offices:', offices.data.length);

    const teams = await axios.get(`${API_URL}/admin/monitoring-teams`, config);
    console.log('Teams:', teams.data.length);

    const industries = await axios.get(`${API_URL}/admin/all-industries`, config);
    console.log('Industries:', industries.data.length);

    console.log('\n✅ Entity visibility verified.');
  } catch (error) {
    console.error('❌ Entity Test Failed:', error.response ? error.response.data : error.message);
  }
}

testEntities();
