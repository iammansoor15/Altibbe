const { spawn } = require('child_process');
const axios = require('axios');

async function testAIService() {
  console.log('🚀 Starting AI Service Test...\n');

  // Start the AI service
  console.log('📦 Starting AI service on port 5001...');
  const aiService = spawn('node', ['ai-service/index.js'], {
    stdio: 'pipe',
    cwd: process.cwd()
  });

  // Wait for service to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Test 1: Health Check
    console.log('🔍 Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5001/api/ai/health');
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Root endpoint documentation
    console.log('\n📚 Testing documentation endpoint...');
    const docResponse = await axios.get('http://localhost:5001/');
    console.log('✅ Documentation endpoint working');

    // Test 3: Generate Questions (with fallback since no API key)
    console.log('\n❓ Testing question generation...');
    const questionResponse = await axios.post('http://localhost:5001/api/ai/generate-questions', {
      productData: {
        productName: "Test Product",
        category: "Technology",
        description: "A test product for demonstration"
      }
    });
    console.log('✅ Question generation working');
    console.log('📝 Generated', questionResponse.data.questions.length, 'questions');

    // Test 4: Transparency Score (with fallback)
    console.log('\n📊 Testing transparency scoring...');
    const scoreResponse = await axios.post('http://localhost:5001/api/ai/transparency-score', {
      productData: {
        productName: "Test Product",
        category: "Technology"
      },
      answers: [
        { question: "Test question", answer: "Test answer" }
      ]
    });
    console.log('✅ Transparency scoring working');
    console.log('📈 Score:', scoreResponse.data.percentage + '%');

    console.log('\n🎉 All AI service tests passed!');
    console.log('\n📋 Summary:');
    console.log('- Health endpoint: ✅ Working');
    console.log('- Documentation: ✅ Working');
    console.log('- Question generation: ✅ Working (fallback mode)');
    console.log('- Transparency scoring: ✅ Working (fallback mode)');
    console.log('\n💡 To use with real AI, set GEMINI_API_KEY in ai-service/.env');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    // Clean up
    aiService.kill();
    console.log('\n🔄 AI service stopped');
  }
}

testAIService().catch(console.error);

