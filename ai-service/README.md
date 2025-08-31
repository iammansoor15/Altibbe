# AI/ML Microservice for Product Transparency

This microservice provides intelligent product form generation using Google Gemini 2.0 Flash for dynamic question generation and transparency scoring.

## Features

- **Dynamic Question Generation**: AI-powered follow-up questions based on product data
- **Transparency Scoring**: Comprehensive scoring system with breakdown analysis
- **Category-Specific Intelligence**: Tailored questions for different product categories
- **RESTful API**: Easy integration with main application
- **Fallback Mechanisms**: Robust error handling with fallback responses

## Setup

### 1. Environment Variables

Create a `.env` file in the ai-service directory:

```env
PORT=5001
NODE_ENV=development
GEMINI_API_KEY=your_actual_gemini_api_key_here
CORS_ORIGIN=http://localhost:3000
MAIN_SERVER_URL=http://localhost:5000
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Service

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### 1. Generate Dynamic Questions

**POST** `/api/ai/generate-questions`

Generate intelligent follow-up questions based on product information.

```json
{
  "productData": {
    "productName": "Organic Green Tea",
    "category": "Food",
    "description": "Premium organic green tea",
    "price": 24.99
  },
  "existingQuestions": [
    {
      "question": "What are the main ingredients?",
      "type": "textarea"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "question": "What certifications does this organic tea have?",
      "type": "select",
      "required": true,
      "options": ["USDA Organic", "Fair Trade", "Rainforest Alliance", "Other"],
      "category": "sustainability",
      "helpText": "Certifications help verify organic and ethical claims"
    }
  ],
  "productName": "Organic Green Tea",
  "category": "Food",
  "generatedAt": "2025-08-31T15:30:00.000Z"
}
```

### 2. Calculate Transparency Score

**POST** `/api/ai/transparency-score`

Calculate comprehensive transparency score based on product data and answers.

```json
{
  "productData": {
    "productName": "Organic Green Tea",
    "category": "Food",
    "description": "Premium organic green tea",
    "price": 24.99
  },
  "answers": [
    {
      "question": "What are the main ingredients?",
      "answer": "100% organic green tea leaves from certified farms"
    },
    {
      "question": "What certifications do you have?",
      "answer": "USDA Organic and Fair Trade certified"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "overallScore": 88,
  "maxScore": 100,
  "percentage": 88,
  "breakdown": {
    "transparency": {"score": 22, "maxScore": 25, "percentage": 88},
    "sustainability": {"score": 24, "maxScore": 25, "percentage": 96},
    "compliance": {"score": 20, "maxScore": 25, "percentage": 80},
    "quality": {"score": 22, "maxScore": 25, "percentage": 88}
  },
  "strengths": [
    "Clear organic certification",
    "Fair trade compliance",
    "Detailed ingredient disclosure"
  ],
  "improvements": [
    "Could provide more supply chain details",
    "Missing some quality control information"
  ],
  "recommendations": [
    "Consider adding traceability information",
    "Provide more details on quality testing"
  ],
  "riskLevel": "low",
  "complianceGrade": "A",
  "calculatedAt": "2025-08-31T15:30:00.000Z",
  "answersAnalyzed": 2
}
```

### 3. Health Check

**GET** `/api/ai/health`

Check service status and Gemini API connection.

### 4. Test Endpoint

**GET** `/api/ai/test`

Test the AI service with sample data.

## Integration with Main Application

### 1. Update Main Server

Add AI service integration to your main Express server:

```javascript
// In your main server routes
const axios = require('axios');
const AI_SERVICE_URL = 'http://localhost:5001';

// Generate questions endpoint
app.post('/api/products/generate-questions', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-questions`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// Calculate transparency score
app.post('/api/products/transparency-score', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/transparency-score`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});
```

### 2. Frontend Integration

Update your React components to use the AI endpoints:

```javascript
// Generate dynamic questions
const generateQuestions = async (productData) => {
  const response = await fetch('/api/products/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productData })
  });
  return response.json();
};

// Calculate transparency score
const calculateScore = async (productData, answers) => {
  const response = await fetch('/api/products/transparency-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productData, answers })
  });
  return response.json();
};
```

## Architecture

```
Main App (Port 3000) ←→ Main Server (Port 5000) ←→ AI Service (Port 5001)
                                                        ↓
                                                 Google Gemini API
```

## Error Handling

The service includes comprehensive error handling:
- Fallback questions when AI generation fails
- Fallback scoring when AI calculation fails
- Graceful degradation for API failures
- Detailed error messages for debugging

## Development

```bash
# Start in development mode
npm run dev

# Test the service
curl http://localhost:5001/api/ai/health
curl http://localhost:5001/api/ai/test
```

## Production Deployment

1. Set production environment variables
2. Use PM2 or similar process manager
3. Set up reverse proxy with nginx
4. Configure proper logging and monitoring

