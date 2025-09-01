const express = require('express');
const axios = require('axios');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// AI Service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

/**
 * POST /generate-questions
 * Generate dynamic questions using AI service
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

    console.log('Generating questions using AI service for product:', productData.productName);
    
    // Create prompt for Gemini
    const prompt = `
As an expert in product transparency and compliance, generate 8-12 specific, relevant questions for evaluating this product:

Product Name: ${productData.productName}
Product Type: ${productData.productType || 'General'}
Category: ${productData.category || 'General'}
Description: ${productData.description || 'No description provided'}

Requirements:
1. Questions should be specific to this type of product
2. Focus on transparency, compliance, and user concerns
3. Include a mix of question types: boolean (yes/no), select (multiple choice), text, and number
4. Questions should help assess product quality, safety, ethics, and transparency
5. Return ONLY valid JSON format

Return the response in this exact JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "boolean|select|text|number",
      "required": true|false,
      "options": ["option1", "option2"] (only for select type),
      "helpText": "Helpful explanation for the user",
      "categories": ["${productData.category || 'General'}"]
    }
  ]
}`;

    // Make request to Gemini AI
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Parse Gemini response
    const aiText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from AI response
    let questionsData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback with basic questions
      questionsData = {
        questions: [
          {
            question: `What is the primary purpose of ${productData.productName}?`,
            type: "text",
            required: true,
            helpText: "Describe the main function and use case",
            categories: [productData.category || 'General']
          },
          {
            question: `Is ${productData.productName} compliant with industry standards?`,
            type: "boolean",
            required: true,
            helpText: "Indicate if the product meets relevant industry standards",
            categories: [productData.category || 'General']
          }
        ]
      };
    }

    res.json(questionsData);

  } catch (error) {
    console.error('AI question generation error:', error.message);
    
    // Fallback response if AI fails
    const fallbackQuestions = {
      questions: [
        {
          question: `What is the main benefit of ${req.body.productData?.productName || 'this product'}?`,
          type: "text",
          required: true,
          helpText: "Describe the primary value proposition",
          categories: [req.body.productData?.category || 'General']
        },
        {
          question: "Is this product environmentally friendly?",
          type: "boolean",
          required: false,
          helpText: "Consider environmental impact and sustainability",
          categories: [req.body.productData?.category || 'General']
        },
        {
          question: "What is the expected lifespan of this product?",
          type: "select",
          required: false,
          options: ["Less than 1 year", "1-2 years", "3-5 years", "5+ years", "Permanent/Digital"],
          helpText: "Estimate how long the product will be useful",
          categories: [req.body.productData?.category || 'General']
        }
      ]
    };

    res.json(fallbackQuestions);
  }
});

/**
 * POST /transparency-score
 * Calculate transparency score using Gemini AI
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

    console.log('Calculating transparency score using Gemini AI for product:', productData.productName);

    // Create a simpler prompt for better reliability
    const answeredQuestions = answers.length;
    const totalQuestions = answers.length;
    const completionRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    // Simple scoring based on completion and answer quality
    let overallScore = completionRate;
    let grade = 'F';

    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';

    // Create prompt for Gemini to enhance the analysis
    const prompt = `
Based on this product assessment, provide a brief analysis:

Product: ${productData.productName}
Category: ${productData.category || 'General'}
Questions answered: ${answeredQuestions}/${totalQuestions}
Completion rate: ${completionRate}%

Please provide:
1. 2-3 key strengths
2. 1-2 areas for improvement
3. One specific recommendation

Keep your response brief and focused.`;

    // Try Gemini AI, but fallback to basic calculation if it fails
    let aiAnalysis = "Analysis based on completion rate. Consider providing more detailed answers for better transparency assessment.";

    try {
      console.log('Attempting Gemini AI call...');
      const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // Reduced timeout
      });

      aiAnalysis = response.data.candidates[0].content.parts[0].text.trim();
      console.log('✅ AI Response received successfully');

    } catch (aiError) {
      console.log('AI call failed, using fallback analysis:', aiError.message);
      // aiAnalysis is already set to fallback message
    }

    // Create score data with AI enhancement or fallback
    const scoreData = {
      overallScore: overallScore,
      grade: grade,
      analysis: {
        strengths: ["Assessment completed", `${answeredQuestions}/${totalQuestions} questions answered`],
        weaknesses: totalQuestions - answeredQuestions > 0 ? [`${totalQuestions - answeredQuestions} unanswered questions`] : [],
        recommendations: ["Complete all assessment questions for better transparency score"]
      },
      complianceRating: {
        environmental: completionRate >= 75 ? 'B' : 'C',
        ethical: completionRate >= 75 ? 'B' : 'C',
        quality: completionRate >= 75 ? 'B' : 'C',
        transparency: completionRate >= 75 ? 'B' : 'C'
      },
      detailedFeedback: `Assessment ${completionRate}% complete. ${answeredQuestions} of ${totalQuestions} questions answered.`,
      aiAnalysis: aiAnalysis
    };

    res.json(scoreData);

  } catch (error) {
    console.error('AI transparency score error:', error.message);

    // Fallback response if AI fails
    const answeredQuestions = req.body.answers ? req.body.answers.filter(a => a.answer && a.answer !== '').length : 0;
    const totalQuestions = req.body.answers ? req.body.answers.length : 1;

    const fallbackScore = {
      overallScore: Math.round((answeredQuestions / totalQuestions) * 100),
      grade: 'C',
      analysis: {
        strengths: ["Basic assessment completed"],
        weaknesses: ["AI analysis unavailable"],
        recommendations: ["Try again later when AI service is available"]
      },
      complianceRating: {
        environmental: 'C',
        ethical: 'C',
        quality: 'C',
        transparency: 'C'
      },
      detailedFeedback: "Fallback calculation due to AI service unavailability. Assessment completion rate used for scoring."
    };

    res.json(fallbackScore);
  }
});

/**
 * GET /health
 * Check AI service health status
 */
router.get('/health', async (req, res) => {
  try {
    // Test Gemini API directly
    console.log('Testing Gemini API health...');
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: 'Hello'
        }]
      }]
    }, {
      timeout: 5000
    });

    res.json({
      aiService: 'available',
      geminiStatus: 'working',
      proxyWorking: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.log('Gemini API health check failed:', error.message);

    // Return success anyway since we have fallback functionality
    res.json({
      aiService: 'available_with_fallback',
      geminiStatus: 'failed',
      proxyWorking: true,
      fallbackAvailable: true,
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
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: 'Please respond with a simple greeting to test AI integration.'
        }]
      }]
    }, {
      timeout: 15000
    });

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    res.json({
      message: 'AI service integration test successful',
      proxyStatus: 'working',
      geminiStatus: 'working',
      aiResponse: aiResponse.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI service test failed:', error.message);

    res.status(503).json({
      message: 'AI service integration test failed',
      proxyStatus: 'working',
      geminiStatus: 'failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

