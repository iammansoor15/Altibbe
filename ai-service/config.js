require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || 'your_gemini_api_key_here',
  corsOrigin: process.env.CORS_ORIGIN || 'all', // 'all' means allow all origins for deployment
  mainServerUrl: process.env.MAIN_SERVER_URL || 'http://localhost:5000'
};

