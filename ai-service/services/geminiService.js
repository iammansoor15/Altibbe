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
You are an AI assistant specialized in product transparency and compliance. Based on the following product information, generate 3-5 intelligent follow-up questions that would help assess the product's transparency, sustainability, compliance, and quality.

Product Information:
- Product Name: ${productData.productName || 'Not specified'}
- Category: ${productData.category || 'Not specified'}
- Description: ${productData.description || 'Not specified'}
- Price: ${productData.price ? `$${productData.price}` : 'Not specified'}
${existingQuestionsText}

Requirements:
1. Generate questions that are specific to this product category and type
2. Focus on transparency, sustainability, compliance, and quality aspects
3. Avoid duplicating existing questions
4. Make questions actionable and answerable
5. Include different question types: text, select, boolean, number

Return the response as a JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "type": "text|select|boolean|number|textarea|date|email|phone",
    "required": true|false,
    "options": ["option1", "option2"] (only for select type),
    "category": "transparency|sustainability|compliance|quality|safety",
    "helpText": "Optional help text explaining why this question is important"
  }
]

Focus on generating questions that would be most valuable for assessing product transparency in the ${productData.category || 'general'} category.
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
