import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { Product } from '@/types';
import { AIQuestion, AIAnswer } from '@/services/aiApi';
import { useTheme } from '@/contexts/ThemeContext';

interface AIResultsState {
  productData: Partial<Product>;
  questions: AIQuestion[];
  answers: AIAnswer[];
  transparencyScore: {
    overallScore: number;
    grade: string;
    analysis: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    complianceRating: {
      environmental: string;
      ethical: string;
      quality: string;
      transparency: string;
    };
    detailedFeedback: string;
    aiAnalysis?: string;
  };
}

const AIResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const state = location.state as AIResultsState;

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">No Results Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please complete the AI questions first.</p>
          <Button onClick={() => navigate('/form')}>
            Start New Assessment
          </Button>
        </div>
      </div>
    );
  }

  const { productData, questions, answers, transparencyScore } = state;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };



  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'B': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'C': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'D': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
      case 'F': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                📈 AI Transparency Assessment Results
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Comprehensive analysis of your product transparency
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Product</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{productData.productName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{productData.category}</div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className={`rounded-lg border-2 p-8 mb-8 ${getScoreBackground(transparencyScore.overallScore)}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(transparencyScore.overallScore)}`}>
              {transparencyScore.overallScore}%
            </div>
            <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Overall Transparency Score
            </div>
            <div className="flex justify-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getGradeColor(transparencyScore.grade)}`}>
                Grade: {transparencyScore.grade}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                {transparencyScore.detailedFeedback}
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">📊 Score Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(transparencyScore.complianceRating).map(([category, grade]) => (
              <div key={category} className="text-center">
                <div className={`text-3xl font-bold mb-2 ${getGradeColor(grade)}`}>
                  {grade}
                </div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                  {category}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Compliance Grade
                </div>
                <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      grade === 'A' ? 'bg-green-500' :
                      grade === 'B' ? 'bg-green-400' :
                      grade === 'C' ? 'bg-yellow-500' :
                      grade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${grade === 'A' ? 100 : grade === 'B' ? 80 : grade === 'C' ? 60 : grade === 'D' ? 40 : 20}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Strengths */}
          <div className="card">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center">
              <span className="mr-2">✅</span>
              Strengths
            </h3>
            <ul className="space-y-2">
              {transparencyScore.analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-green-500 dark:text-green-400 mr-2 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="card">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {transparencyScore.analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-yellow-500 dark:text-yellow-400 mr-2 mt-1">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="card">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Recommendations
            </h3>
            <ul className="space-y-2">
              {transparencyScore.analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                  <span className="text-blue-500 dark:text-blue-400 mr-2 mt-1">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Questions & Answers Summary */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">📝 Your Answers</h2>
          <div className="space-y-4">
            {answers.map((answer, index) => {
              const question = questions.find(q => q.question === answer.question);
              return (
                <div key={index} className="border-l-4 border-blue-200 dark:border-blue-700 pl-4 py-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {answer.question}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    {typeof answer.answer === 'boolean' 
                      ? (answer.answer ? 'Yes' : 'No')
                      : Array.isArray(answer.answer)
                      ? answer.answer.join(', ')
                      : answer.answer
                    }
                  </div>
                  {question && (
                    <div className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      question.category === 'transparency' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                      question.category === 'sustainability' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      question.category === 'compliance' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                      question.category === 'quality' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}>
                      {question.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment Details */}
        <div className="bg-gray-100 dark:bg-secondary-800 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assessment Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Questions Answered:</span> {answers.length}
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Questions:</span> {questions.length}
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Assessment Date:</span> {new Date().toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Powered by:</span> AI Analysis Engine
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {transparencyScore.aiAnalysis && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🤖 AI Analysis</h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {transparencyScore.aiAnalysis}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/ai-questions', { state: { productData } })}
          >
            ← Retake Assessment
          </Button>
          
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
            >
              View All Products
            </Button>
            <Button
              onClick={() => navigate('/form')}
            >
              Create New Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResultsPage;

