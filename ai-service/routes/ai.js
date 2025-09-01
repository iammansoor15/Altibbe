const express = require('express');
const GeminiService = require('../services/geminiService');

const router = express.Router();
const geminiService = new GeminiService();

// Simple in-memory cache to prevent duplicate requests
const questionCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (reduced for testing)

// Clear cache on startup to ensure fresh questions
setTimeout(() => {
  console.log('Clearing question cache for fresh generation...');
  questionCache.clear();
}, 1000);

function getCacheKey(productData) {
  return `${productData.productName}_${productData.category}_${productData.description}`.toLowerCase();
}

function getCachedQuestions(cacheKey) {
  const cached = questionCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.questions;
  }
  return null;
}

function setCachedQuestions(cacheKey, questions) {
  questionCache.set(cacheKey, {
    questions,
    timestamp: Date.now()
  });
}

// Calculate text similarity using Jaccard similarity
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.split(' ').filter(word => word.length > 2));
  const words2 = new Set(text2.split(' ').filter(word => word.length > 2));

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

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

        // Check cache first
    const cacheKey = getCacheKey(productData);
    const cachedQuestions = getCachedQuestions(cacheKey);

    if (cachedQuestions) {
      console.log(`[CACHE] Returning cached questions for: ${productData.productName}`);
      return res.json({
        success: true,
        questions: cachedQuestions,
        productName: productData.productName,
        category: productData.category,
        generatedAt: new Date().toISOString(),
        cached: true
      });
    }

    // Generate a unique request ID to prevent duplicate processing
    const requestId = `${productData.productName}_${productData.category}_${Date.now()}`;

    console.log(`[${requestId}] Generating questions for product: ${productData.productName}`);

    const questions = await geminiService.generateDynamicQuestions(productData, existingQuestions);

    // Advanced deduplication: check both exact text and semantic similarity
    const uniqueQuestions = [];
    const questionTexts = new Set();

    for (const question of questions) {
      const normalizedText = question.question.toLowerCase().trim();

      // Skip if exact match already exists
      if (questionTexts.has(normalizedText)) {
        continue;
      }

      // Check for semantic similarity (simple keyword-based)
      let isTooSimilar = false;
      for (const existingText of questionTexts) {
        const similarity = calculateSimilarity(normalizedText, existingText);
        if (similarity > 0.7) { // 70% similarity threshold
          isTooSimilar = true;
          break;
        }
      }

      if (!isTooSimilar) {
        uniqueQuestions.push(question);
        questionTexts.add(normalizedText);
      }
    }

    // Ensure we have at least 3 questions
    if (uniqueQuestions.length < 3) {
      console.log(`[${requestId}] Only ${uniqueQuestions.length} unique questions, generating more...`);
      // Generate additional questions if we don't have enough unique ones
      const additionalQuestions = await geminiService.generateAdditionalQuestions(productData, uniqueQuestions);
      for (const question of additionalQuestions) {
        const normalizedText = question.question.toLowerCase().trim();
        if (!questionTexts.has(normalizedText)) {
          uniqueQuestions.push(question);
          questionTexts.add(normalizedText);
          if (uniqueQuestions.length >= 3) break;
        }
      }
    }

    // Cache the unique questions
    setCachedQuestions(cacheKey, uniqueQuestions);

    console.log(`[${requestId}] Generated ${uniqueQuestions.length} unique questions from ${questions.length} total`);

    res.json({
      success: true,
      questions: uniqueQuestions,
      productName: productData.productName,
      category: productData.category,
      generatedAt: new Date().toISOString(),
      totalGenerated: questions.length,
      uniqueCount: uniqueQuestions.length
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

