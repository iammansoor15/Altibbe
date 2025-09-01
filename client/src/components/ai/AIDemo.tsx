import React, { useState } from 'react';
import { aiService, AIQuestion, AIAnswer, TransparencyScore } from '@/services/aiApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Product } from '@/types';

const AIDemo: React.FC = () => {
  const [productData, setProductData] = useState<Partial<Product>>({
    productName: 'Smart Fitness Tracker',
    category: 'Technology',
    description: 'Advanced fitness tracking device with heart rate monitoring',
    price: 199.99
  });
  
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [answers, setAnswers] = useState<AIAnswer[]>([]);
  const [score, setScore] = useState<TransparencyScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await aiService.generateQuestions(productData);
      setQuestions(response.data.questions);
      
      // Initialize answers array
      setAnswers(response.data.questions.map(q => ({
        question: q.question,
        answer: ''
      })));
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate questions');
      console.error('Question generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await aiService.calculateTransparencyScore(productData, answers);
      setScore(response.data);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to calculate score');
      console.error('Score calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (index: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[index].answer = answer;
    setAnswers(newAnswers);
  };

  const testAIHealth = async () => {
    try {
      setLoading(true);
      const response = await aiService.checkHealth();
      alert(`AI Service Status: ${response.data.aiService}\nProxy: ${response.data.proxyWorking ? 'Working' : 'Failed'}`);
    } catch (err: any) {
      alert(`AI Service Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🤖 AI-Powered Product Analysis Demo
        </h2>
        
        {/* AI Health Check */}
        <div className="mb-6">
          <Button 
            onClick={testAIHealth} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            🔍 Test AI Service
          </Button>
        </div>

        {/* Product Data Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Product Name"
            value={productData.productName || ''}
            onChange={(e) => setProductData({ ...productData, productName: e.target.value })}
            placeholder="Enter product name"
          />
          <Input
            label="Category"
            value={productData.category || ''}
            onChange={(e) => setProductData({ ...productData, category: e.target.value })}
            placeholder="e.g., Technology, Food, Healthcare"
          />
          <Input
            label="Description"
            value={productData.description || ''}
            onChange={(e) => setProductData({ ...productData, description: e.target.value })}
            placeholder="Product description"
          />
          <Input
            label="Price"
            type="number"
            value={productData.price || ''}
            onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) })}
            placeholder="0.00"
          />
        </div>

        {/* Generate Questions */}
        <div className="mb-6">
          <Button 
            onClick={generateQuestions} 
            disabled={loading || !productData.productName}
            className="w-full md:w-auto"
          >
            {loading ? '🔄 Generating...' : '❓ Generate AI Questions'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Questions & Answers */}
        {questions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📝 AI-Generated Questions ({questions.length})
            </h3>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-start justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 flex-1">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      question.category === 'transparency' ? 'bg-blue-100 text-blue-800' :
                      question.category === 'sustainability' ? 'bg-green-100 text-green-800' :
                      question.category === 'compliance' ? 'bg-yellow-100 text-yellow-800' :
                      question.category === 'quality' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {question.category}
                    </span>
                  </div>
                  
                  {question.helpText && (
                    <p className="text-sm text-gray-500 mb-2">{question.helpText}</p>
                  )}

                  {question.type === 'select' && question.options ? (
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={answers[index]?.answer?.toString() || ''}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {question.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : question.type === 'textarea' ? (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={answers[index]?.answer?.toString() || ''}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      placeholder="Enter your answer..."
                    />
                  ) : question.type === 'boolean' ? (
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="true"
                          checked={answers[index]?.answer === 'true'}
                          onChange={(e) => updateAnswer(index, e.target.value)}
                          className="mr-2"
                        />
                        Yes
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value="false"
                          checked={answers[index]?.answer === 'false'}
                          onChange={(e) => updateAnswer(index, e.target.value)}
                          className="mr-2"
                        />
                        No
                      </label>
                    </div>
                  ) : (
                    <input
                      type={question.type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={answers[index]?.answer?.toString() || ''}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      placeholder="Enter your answer..."
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Calculate Score Button */}
            <div className="mt-6">
              <Button 
                onClick={calculateScore} 
                disabled={loading || answers.some(a => !a.answer)}
                className="w-full md:w-auto"
              >
                {loading ? '🔄 Calculating...' : '📊 Calculate Transparency Score'}
              </Button>
            </div>
          </div>
        )}

        {/* Transparency Score Results */}
        {score && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              📈 AI Transparency Score Results
            </h3>
            
            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {score.percentage}%
              </div>
              <div className="text-lg text-gray-700">
                Overall Transparency Score
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                score.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                score.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Risk Level: {score.riskLevel.toUpperCase()}
              </div>
              <div className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Grade: {score.complianceGrade}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(score.breakdown).map(([category, data]) => (
                <div key={category} className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {data.percentage}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {category}
                  </div>
                </div>
              ))}
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">✅ Strengths</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {score.strengths.map((strength, index) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Areas for Improvement</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {score.improvements.map((improvement, index) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {score.recommendations.map((recommendation, index) => (
                    <li key={index}>• {recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDemo;
