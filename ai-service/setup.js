const fs = require('fs');
const path = require('path');

console.log('🤖 AI/ML Microservice Setup');
console.log('================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  const envTemplate = `# AI Service Configuration
PORT=5001
NODE_ENV=development

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Main Server URL (for potential communication)
MAIN_SERVER_URL=http://localhost:5000`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

console.log('');
console.log('🔑 Next Steps:');
console.log('1. Get your Google Gemini API key:');
console.log('   - Go to: https://makersuite.google.com/app/apikey');
console.log('   - Create a new API key');
console.log('   - Copy the API key');
console.log('');
console.log('2. Update your .env file:');
console.log(`   - Open: ${envPath}`);
console.log('   - Replace "your_gemini_api_key_here" with your actual API key');
console.log('');
console.log('3. Start the AI service:');
console.log('   npm run dev');
console.log('');
console.log('4. Test the service:');
console.log('   curl http://localhost:5001/api/ai/health');
console.log('');
console.log('📚 Full documentation available in README.md');

// Check if package.json has the right scripts
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.scripts.dev) {
  packageJson.scripts.dev = 'nodemon index.js';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Added dev script to package.json');
}

