// Test script to verify deployed services
const axios = require('axios');

const SERVER_URL = 'https://altibbe-server.onrender.com';
const CLIENT_URL = 'https://altibbe-sjtm.onrender.com';

async function testDeployment() {
  console.log('🚀 Testing Altibbe Deployment...\n');

  try {
    // Test main server health
    console.log('📊 Testing Main Server Health...');
    const serverHealth = await axios.get(`${SERVER_URL}/api/health`);
    console.log('✅ Main Server Health:', serverHealth.data);

    // Test AI service health
    console.log('\n🤖 Testing AI Service Health...');
    const aiHealth = await axios.get(`${SERVER_URL}/api/ai/health`);
    console.log('✅ AI Service Health:', aiHealth.data);

    // Test CORS headers
    console.log('\n🌐 Testing CORS Configuration...');
    const corsTest = await axios.options(`${SERVER_URL}/api/auth/register`, {
      headers: {
        'Origin': CLIENT_URL,
        'Access-Control-Request-Method': 'POST'
      }
    });
    console.log('✅ CORS Headers:', corsTest.headers);

    console.log('\n🎉 Deployment Test Complete!');
    console.log('✅ All services are running and accessible');
    console.log(`🔗 Client: ${CLIENT_URL}`);
    console.log(`🔗 Server: ${SERVER_URL}`);

  } catch (error) {
    console.error('❌ Deployment Test Failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDeployment();
