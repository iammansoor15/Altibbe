const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Generate dynamic follow-up questions based on product information
   * @param {Object} productData - The product data to analyze
   * @param {Array} existingQuestions - Questions already asked
   * @returns {Promise<Array>} Array of generated questions
   */
  async generateDynamicQuestions(productData, existingQuestions = []) {
    try {
      const existingQuestionsText = existingQuestions.length > 0 
        ? `\n\nExisting questions already asked:\n${existingQuestions.map(q => `- ${q.question}`).join('\n')}`
        : '';

      const prompt = `
You are an expert AI assistant specializing in product transparency assessment. Generate EXACTLY 3 UNIQUE questions for the product below.

CRITICAL REQUIREMENTS:
1. Each question MUST focus on a COMPLETELY DIFFERENT aspect of transparency
2. Questions must be UNIQUE - no similar wording or concepts
3. Use different question types: text, select, boolean, textarea
4. Make questions specific and actionable

Product Details:
- Name: ${productData.productName || 'Unknown Product'}
- Category: ${productData.category || 'General'}
- Description: ${productData.description || 'No description available'}
${existingQuestionsText}

QUESTION ASSIGNMENTS:
1. FIRST QUESTION: Focus on SUPPLY CHAIN TRANSPARENCY (ingredients, sourcing, manufacturing locations)
2. SECOND QUESTION: Focus on ENVIRONMENTAL IMPACT (sustainability, carbon footprint, recycling)
3. THIRD QUESTION: Focus on QUALITY ASSURANCE (testing, certifications, standards compliance)

IMPORTANT: Make each question completely different from the others. For example:
- If one asks about "ingredients", another should NOT ask about "materials"
- If one asks about "sustainability", another should NOT ask about "environmental impact"
- Use completely different vocabulary and concepts

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Specific question about supply chain transparency?",
    "type": "text",
    "required": true,
    "category": "transparency",
    "helpText": "This assesses supply chain transparency"
  },
  {
    "question": "Specific question about environmental impact?",
    "type": "select",
    "required": true,
    "options": ["Yes", "No", "Partially", "Not applicable"],
    "category": "sustainability",
    "helpText": "This evaluates environmental responsibility"
  },
  {
    "question": "Specific question about quality assurance?",
    "type": "boolean",
    "required": true,
    "category": "quality",
    "helpText": "This ensures product quality standards"
  }
]

REMEMBER: All 3 questions must be COMPLETELY DIFFERENT from each other!
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions;
      } else {
        throw new Error('Could not parse questions from AI response');
      }
    } catch (error) {
      console.error('Error generating dynamic questions:', error);
      // Return fallback questions
      return this.getFallbackQuestions(productData.category);
    }
  }

  /**
   * Calculate transparency score based on product data and answers
   * @param {Object} productData - The product data
   * @param {Array} answers - Array of question-answer pairs
   * @returns {Promise<Object>} Transparency score and analysis
   */
  async calculateTransparencyScore(productData, answers) {
    try {
      const answersText = answers.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n');

      const prompt = `
You are an AI expert in product transparency assessment. Analyze the following product information and answers to calculate a comprehensive transparency score.

Product Information:
- Product Name: ${productData.productName || 'Not specified'}
- Category: ${productData.category || 'Not specified'}
- Description: ${productData.description || 'Not specified'}
- Price: ${productData.price ? `$${productData.price}` : 'Not specified'}

Question & Answer Analysis:
${answersText}

Please analyze and return a JSON response with this exact structure:
{
  "overallScore": 85,
  "maxScore": 100,
  "percentage": 85,
  "breakdown": {
    "transparency": {"score": 20, "maxScore": 25, "percentage": 80},
    "sustainability": {"score": 18, "maxScore": 25, "percentage": 72},
    "compliance": {"score": 22, "maxScore": 25, "percentage": 88},
    "quality": {"score": 25, "maxScore": 25, "percentage": 100}
  },
  "strengths": [
    "Clear ingredient disclosure",
    "Strong quality control measures"
  ],
  "improvements": [
    "Could provide more sustainability information",
    "Missing some compliance certifications"
  ],
  "recommendations": [
    "Consider obtaining organic certification",
    "Implement supply chain traceability"
  ],
  "riskLevel": "low|medium|high",
  "complianceGrade": "A|B|C|D|F"
}

Base your scoring on:
1. Completeness of information provided
2. Quality and detail of answers
3. Evidence of transparency practices
4. Sustainability considerations
5. Compliance with industry standards
6. Quality assurance measures

Provide realistic scores based on the actual content and quality of the responses.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const scoreData = JSON.parse(jsonMatch[0]);
        return scoreData;
      } else {
        throw new Error('Could not parse transparency score from AI response');
      }
    } catch (error) {
      console.error('Error calculating transparency score:', error);
      // Return fallback score
      return this.getFallbackScore();
    }
  }

  /**
   * Get fallback questions when AI generation fails
   * @param {string} category - Product category
   * @returns {Array} Array of fallback questions
   */
  getFallbackQuestions(category) {
    const baseQuestions = [
      {
        question: "What are the main ingredients or materials used in this product?",
        type: "textarea",
        required: true,
        category: "transparency",
        helpText: "Provide a detailed list of all ingredients or materials"
      },
      {
        question: "Does this product have any sustainability certifications?",
        type: "select",
        required: false,
        options: ["None", "Organic", "Fair Trade", "Recyclable", "Carbon Neutral", "Other"],
        category: "sustainability",
        helpText: "Select any applicable sustainability certifications"
      },
      {
        question: "Is this product manufactured in compliance with industry safety standards?",
        type: "boolean",
        required: true,
        category: "compliance",
        helpText: "Confirm compliance with relevant safety standards"
      }
    ];

    // Add category-specific questions
    const categoryQuestions = {
      'Technology': [
        {
          question: "What is the expected lifespan of this product?",
          type: "text",
          required: false,
          category: "quality",
          helpText: "Estimated product lifespan in years"
        }
      ],
      'Healthcare': [
        {
          question: "Are there any known side effects or contraindications?",
          type: "textarea",
          required: true,
          category: "safety",
          helpText: "List any potential side effects or usage restrictions"
        }
      ],
      'Food': [
        {
          question: "What is the shelf life of this product?",
          type: "text",
          required: true,
          category: "quality",
          helpText: "Product expiration or best-by timeframe"
        }
      ]
    };

    return [...baseQuestions, ...(categoryQuestions[category] || [])];
  }

  /**
   * Get fallback transparency score when AI calculation fails
   * @returns {Object} Fallback score object
   */
  getFallbackScore() {
    return {
      overallScore: 75,
      maxScore: 100,
      percentage: 75,
      breakdown: {
        transparency: { score: 18, maxScore: 25, percentage: 72 },
        sustainability: { score: 16, maxScore: 25, percentage: 64 },
        compliance: { score: 20, maxScore: 25, percentage: 80 },
        quality: { score: 21, maxScore: 25, percentage: 84 }
      },
      strengths: ["Basic information provided", "Compliance awareness shown"],
      improvements: ["More detailed transparency information needed", "Sustainability data could be enhanced"],
      recommendations: ["Provide more detailed product information", "Consider sustainability certifications"],
      riskLevel: "medium",
      complianceGrade: "B"
    };
  }

  /**
   * Generate additional unique questions when we don't have enough unique ones
   * @param {Object} productData - The product data
   * @param {Array} existingQuestions - Already generated unique questions
   * @returns {Promise<Array>} Array of additional questions
   */
  async generateAdditionalQuestions(productData, existingQuestions = []) {
    try {
      const existingTexts = existingQuestions.map(q => q.question).join('\n- ');

      const prompt = `Based on the following product, generate 2-3 COMPLETELY DIFFERENT questions from these existing ones:

Product: ${productData.productName || 'Not specified'}
Category: ${productData.category || 'Not specified'}
Description: ${productData.description || 'Not specified'}

EXISTING QUESTIONS (DO NOT REPEAT):
- ${existingTexts}

Generate NEW questions that focus on completely different aspects. For example:
- If existing questions are about retail channels, ask about environmental impact
- If existing questions are about demographics, ask about manufacturing processes
- If existing questions are about distribution, ask about quality control

Return exactly 2-3 questions in this JSON format:
[
  {
    "question": "Completely different question here",
    "type": "text|select|boolean|textarea",
    "required": true,
    "category": "transparency|sustainability|compliance|quality|safety",
    "helpText": "Helpful explanation"
  }
]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        return questions.slice(0, 3); // Return max 3 questions
      } else {
        console.log('Could not parse additional questions from AI response');
        return [];
      }
    } catch (error) {
      console.error('Error generating additional questions:', error);
      return [];
    }
  }

  /**
   * Test the Gemini API connection
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      const result = await this.model.generateContent("Hello, please respond with 'AI service is working correctly'");
      const response = await result.response;
      const text = response.text();
      return text.includes('working correctly');
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

module.exports = GeminiService;
