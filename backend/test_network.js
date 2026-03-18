require('dotenv').config();

async function testNetwork() {
  const key = process.env.GEMINI_API_KEY;
  console.log('Testing Gemini Key:', key ? `${key.substring(0, 5)}...` : 'MISSING');
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data).substring(0, 100));
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

testNetwork();
