const axios = require('axios');

async function testComplaint() {
  try {
    const res = await axios.post('http://localhost:5002/api/complaints', {
      reporter_name: "Test Citizen",
      reporter_email: "test@example.com",
      reporter_phone: "1234567890",
      pollution_type: "Air",
      location: "Near Vidhan Sabha",
      district: "RAIPUR",
      description: "Excessive smoke from nearby factory.",
      anonymous: false
    });
    console.log('Complaint Response:', res.data);
  } catch (error) {
    console.error('Complaint Test Failed:', error.response ? error.response.data : error.message);
  }
}

testComplaint();
