const axios = require('axios');

async function testAI() {
  try {
    const res = await axios.post('http://localhost:5002/api/ai/chat', {
      message: "What is the current air quality in Raipur?"
    });
    console.log('AI Response:', res.data.content);
  } catch (error) {
    console.error('AI Test Failed:', error.response ? error.response.data : error.message);
  }
}

testAI();
