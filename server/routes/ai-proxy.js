const express = require('express');
const axios = require('axios');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /generate-questions
 * Proxy endpoint to AI service for generating dynamic questions
 */
router.post('/generate-questions', authenticateUser, async (req, res) => {
  try {
    const { productData, existingQuestions } = req.body;

    // Validate required fields
    if (!productData || !productData.productName) {
      return res.status(400).json({
        error: 'Product data with productName is required'
      });
    }

    console.log('Proxying question generation request to AI service');
    
    // Forward request to AI service
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-questions`, {
      productData,
      existingQuestions
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('AI service proxy error (generate-questions):', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'AI service unavailable',
        details: 'The AI service is currently not responding. Please try again later.',
        fallback: true
      });
    }

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      error: 'Failed to generate questions',
      details: 'An unexpected error occurred while communicating with the AI service'
    });
  }
});

/**
 * POST /transparency-score
 * Proxy endpoint to AI service for calculating transparency scores
 */
router.post('/transparency-score', authenticateUser, async (req, res) => {
  try {
    const { productData, answers } = req.body;

    // Validate required fields
    if (!productData || !productData.productName) {
      return res.status(400).json({
        error: 'Product data with productName is required'
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        error: 'Answers must be an array'
      });
    }

    console.log('Proxying transparency score calculation to AI service');
    
    // Forward request to AI service
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/transparency-score`, {
      productData,
      answers
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);

  } catch (error) {
    console.error('AI service proxy error (transparency-score):', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'AI service unavailable',
        details: 'The AI service is currently not responding. Please try again later.',
        fallback: true
      });
    }

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    res.status(500).json({
      error: 'Failed to calculate transparency score',
      details: 'An unexpected error occurred while communicating with the AI service'
    });
  }
});

/**
 * GET /health
 * Check AI service health status
 */
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/ai/health`, {
      timeout: 5000
    });

    res.json({
      aiService: 'available',
      status: response.data,
      proxyWorking: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI service health check failed:', error.message);
    
    res.status(503).json({
      aiService: 'unavailable',
      error: error.message,
      proxyWorking: true,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /test
 * Test AI service integration
 */
router.get('/test', authenticateUser, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/api/ai/test`, {
      timeout: 30000
    });

    res.json({
      message: 'AI service integration test successful',
      proxyStatus: 'working',
      aiServiceResponse: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI service test failed:', error.message);
    
    res.status(503).json({
      message: 'AI service integration test failed',
      proxyStatus: 'working',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

