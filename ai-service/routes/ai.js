const express = require('express');
const GeminiService = require('../services/geminiService');

const router = express.Router();
const geminiService = new GeminiService();

/**
 * POST /generate-questions
 * Generate dynamic follow-up questions based on product data
 */
router.post('/generate-questions', async (req, res) => {
  try {
    const { productData, existingQuestions = [] } = req.body;

    // Validate required fields
    if (!productData || !productData.productName) {
      return res.status(400).json({
        error: 'Product data with productName is required',
        details: 'Please provide productData object with at least productName field'
      });
    }

    console.log('Generating questions for product:', productData.productName);
    
    const questions = await geminiService.generateDynamicQuestions(productData, existingQuestions);

    res.json({
      success: true,
      questions,
      productName: productData.productName,
      category: productData.category,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in /generate-questions:', error);
    res.status(500).json({
      error: 'Failed to generate questions',
      details: error.message
    });
  }
});

/**
 * POST /transparency-score
 * Calculate transparency score based on product data and answers
 */
router.post('/transparency-score', async (req, res) => {
  try {
    const { productData, answers = [] } = req.body;

    // Validate required fields
    if (!productData || !productData.productName) {
      return res.status(400).json({
        error: 'Product data with productName is required',
        details: 'Please provide productData object with at least productName field'
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        error: 'Answers must be an array',
        details: 'Please provide answers as an array of question-answer objects'
      });
    }

    console.log('Calculating transparency score for:', productData.productName);
    console.log('Number of answers provided:', answers.length);

    const scoreData = await geminiService.calculateTransparencyScore(productData, answers);

    res.json({
      success: true,
      productName: productData.productName,
      category: productData.category,
      ...scoreData,
      calculatedAt: new Date().toISOString(),
      answersAnalyzed: answers.length
    });

  } catch (error) {
    console.error('Error in /transparency-score:', error);
    res.status(500).json({
      error: 'Failed to calculate transparency score',
      details: error.message
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const isGeminiWorking = await geminiService.testConnection();
    
    res.json({
      status: 'OK',
      service: 'AI/ML Microservice',
      timestamp: new Date().toISOString(),
      geminiConnection: isGeminiWorking ? 'Connected' : 'Disconnected',
      endpoints: [
        'POST /api/ai/generate-questions',
        'POST /api/ai/transparency-score',
        'GET /api/ai/health'
      ]
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /test
 * Test endpoint to verify Gemini integration
 */
router.get('/test', async (req, res) => {
  try {
    const testProductData = {
      productName: "Organic Green Tea",
      category: "Food",
      description: "Premium organic green tea sourced from sustainable farms",
      price: 24.99
    };

    // Test question generation
    const questions = await geminiService.generateDynamicQuestions(testProductData);
    
    // Test transparency scoring with sample answers
    const sampleAnswers = [
      {
        question: "What are the main ingredients?",
        answer: "100% organic green tea leaves from certified organic farms"
      },
      {
        question: "Is the product sustainably sourced?",
        answer: "Yes, sourced from Fair Trade certified organic farms"
      }
    ];
    
    const score = await geminiService.calculateTransparencyScore(testProductData, sampleAnswers);

    res.json({
      success: true,
      message: 'AI service test completed successfully',
      testResults: {
        questionsGenerated: questions.length,
        sampleQuestions: questions.slice(0, 2), // Show first 2 questions
        transparencyScore: score.percentage,
        scoreBreakdown: score.breakdown
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

