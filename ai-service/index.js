const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');

// Import routes
const aiRoutes = require('./routes/ai');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - Allow ALL origins (no localhost restrictions)
app.use(cors({
  origin: true, // Allow ALL origins without any restrictions
  credentials: true, // allow cookies / auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Custom-Header'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI/ML Microservice for Product Transparency',
    version: '1.0.0',
    description: 'Intelligent product form generation using Google Gemini 2.0 Flash',
    endpoints: {
      health: 'GET /api/ai/health',
      generateQuestions: 'POST /api/ai/generate-questions',
      transparencyScore: 'POST /api/ai/transparency-score',
      test: 'GET /api/ai/test'
    },
    documentation: {
      generateQuestions: {
        method: 'POST',
        url: '/api/ai/generate-questions',
        body: {
          productData: {
            productName: 'string (required)',
            category: 'string',
            description: 'string',
            price: 'number'
          },
          existingQuestions: 'array (optional)'
        }
      },
      transparencyScore: {
        method: 'POST',
        url: '/api/ai/transparency-score',
        body: {
          productData: {
            productName: 'string (required)',
            category: 'string',
            description: 'string',
            price: 'number'
          },
          answers: [
            {
              question: 'string',
              answer: 'string'
            }
          ]
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: err.message 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(config.nodeEnv === 'development' && { details: err.message })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    availableEndpoints: [
      'GET /',
      'GET /api/ai/health',
      'POST /api/ai/generate-questions',
      'POST /api/ai/transparency-score',
      'GET /api/ai/test'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 AI/ML Microservice running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS origin: ALL ORIGINS ALLOWED (no localhost restrictions)`);
  console.log(`🤖 Google Gemini 2.0 Flash integration ready`);
  console.log(`📚 API Documentation: http://localhost:${config.port}/`);
  
  if (config.geminiApiKey === 'your_gemini_api_key_here') {
    console.log('⚠️  WARNING: Please set your GEMINI_API_KEY in the environment variables');
  }
});

