const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Gemini API Key Setup');
console.log('======================');
console.log('');
console.log('To get your Gemini API key:');
console.log('1. Go to: https://makersuite.google.com/app/apikey');
console.log('2. Sign in with your Google account');
console.log('3. Click "Create API Key"');
console.log('4. Copy the generated key (starts with AIza...)');
console.log('');

rl.question('Enter your Gemini API key (or press Enter to skip): ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('⚠️  Skipped API key setup. The AI will use fallback mode.');
    console.log('You can set it later in ai-service/.env file');
    rl.close();
    return;
  }

  if (!apiKey.startsWith('AIza')) {
    console.log('⚠️  Warning: API key should start with "AIza". Please verify your key.');
  }

  // Update the .env file
  const envPath = path.join(__dirname, 'ai-service', '.env');
  
  try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else {
      // Create default .env content
      envContent = `# AI Service Configuration
PORT=5001
NODE_ENV=development

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Main Server URL (for potential communication)
MAIN_SERVER_URL=http://localhost:5000`;
    }

    // Replace or add the API key
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${apiKey.trim()}`);
    } else {
      envContent += `\nGEMINI_API_KEY=${apiKey.trim()}`;
    }

    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Gemini API key saved successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart the AI service: cd ai-service && npm run dev');
    console.log('2. Test your setup at: http://localhost:3000/ai-demo');
    console.log('3. Fill out a product form to see AI questions in action!');
    
  } catch (error) {
    console.error('❌ Error saving API key:', error.message);
  }
  
  rl.close();
});

