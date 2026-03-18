const axios = require('axios');

const testComplaint = async () => {
  try {
    const res = await axios.post('http://localhost:5002/api/complaints', {
      reporter_name: 'Test Citizen Node',
      reporter_email: 'node@test.com',
      pollution_type: 'Air Pollution',
      location: 'Node Landmark',
      district: 'RAIPUR',
      description: 'Test description from node script'
    });
    console.log('Submission Success:', res.data);
  } catch (err) {
    console.error('Submission Failed:', err.response?.data || err.message);
  }
};

testComplaint();
