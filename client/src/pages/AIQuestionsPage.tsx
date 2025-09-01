import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { aiService, AIQuestion, AIAnswer } from '@/services/aiApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

interface AIQuestionsFormData {
  [key: string]: string | boolean | number;
}

const AIQuestionsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const productData = location.state?.productData as Partial<Product>;
  
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AIQuestionsFormData>();

  useEffect(() => {
    if (!productData) {
      toast.error('No product data found. Please fill the product form first.');
      navigate('/form');
      return;
    }

    // Reset questionsGenerated when productData changes
    if (productData && questionsGenerated) {
      const currentProductKey = `${productData.productName}_${productData.category}`;
      if (!generatedProductKey || generatedProductKey !== currentProductKey) {
        console.log('Product changed, resetting questions state');
        setQuestionsGenerated(false);
        setQuestions([]);
        setError('');
      }
    }

    // Only generate questions if they haven't been generated yet
    if (!questionsGenerated) {
      generateAIQuestions();
    }
  }, [productData, navigate, questionsGenerated]);

  // Track which product the questions were generated for
  const [generatedProductKey, setGeneratedProductKey] = useState<string>('');

  const generateAIQuestions = async () => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('AI question generation already in progress, skipping duplicate call');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Generating AI questions for product:', productData);

      const response = await aiService.generateQuestions(productData);
      console.log('AI Questions response:', response.data);

      // Handle deduplicated responses
      if (response.data.deduplicated) {
        console.log('Request was deduplicated - using cached questions');
        toast.info('Using cached AI questions for better performance');
        setQuestionsGenerated(true);
        setGeneratedProductKey(`${productData.productName}_${productData.category}`);
        return;
      }

      // Handle cached responses
      if (response.data.cached) {
        console.log('Using cached AI questions');
        toast.info('Using cached AI questions');
        setQuestionsGenerated(true);
        setGeneratedProductKey(`${productData.productName}_${productData.category}`);
        // For cached responses, we might want to load existing questions
        // For now, we'll just mark as generated to prevent further calls
      }

      // Only update questions if we have new ones
      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);

        // Initialize form values
        response.data.questions.forEach((question, index) => {
          const fieldName = `question_${index}`;
          if (question.type === 'boolean') {
            setValue(fieldName, false);
          } else {
            setValue(fieldName, '');
          }
        });

        const message = response.data.cached
          ? `Loaded ${response.data.questions.length} cached AI questions!`
          : `Generated ${response.data.questions.length} AI-powered questions!`;

        toast.success(message);

        // Mark questions as generated to prevent duplicate calls
        setQuestionsGenerated(true);
        setGeneratedProductKey(`${productData.productName}_${productData.category}`);
      } else {
        setError('No questions were generated. Please try again.');
        toast.error('No questions were generated. Please try again.');
      }

    } catch (err: any) {
      console.error('Error generating AI questions:', err);
      setError(err.response?.data?.error || 'Failed to generate AI questions');
      toast.error('Failed to generate AI questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AIQuestionsFormData) => {
    try {
      setSubmitting(true);
      
      // Convert form data to answers format
      const answers: AIAnswer[] = questions.map((question, index) => ({
        question: question.question,
        answer: data[`question_${index}`] || ''
      }));

      // Filter out empty answers
      const validAnswers = answers.filter(answer => 
        answer.answer !== '' && answer.answer !== null && answer.answer !== undefined
      );

      if (validAnswers.length === 0) {
        toast.error('Please answer at least one question');
        return;
      }

      console.log('Calculating transparency score with answers:', validAnswers);
      
      // Calculate transparency score
      const scoreResponse = await aiService.calculateTransparencyScore(productData!, validAnswers);
      console.log('Transparency score response:', scoreResponse.data);
      
      // Navigate to results page with product data, answers, and score
      navigate('/ai-results', {
        state: {
          productData,
          questions,
          answers: validAnswers,
          transparencyScore: scoreResponse.data
        }
      });

    } catch (err: any) {
      console.error('Error calculating transparency score:', err);
      toast.error(err.response?.data?.error || 'Failed to calculate transparency score');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: AIQuestion, index: number) => {
    const fieldName = `question_${index}`;
    const fieldError = errors[fieldName];

    switch (question.type) {
      case 'select':
        return (
          <Select
            key={index}
            label={question.question}
            {...register(fieldName, { required: question.required ? 'This field is required' : false })}
            error={fieldError?.message}
            options={question.options?.map(option => ({ value: option, label: option })) || []}
            placeholder="Select an option"
          />
        );

      case 'boolean':
        return (
          <div key={index} className="form-group">
            <label className="label">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="true"
                  {...register(fieldName, { required: question.required ? 'This field is required' : false })}
                  className="mr-3 w-4 h-4 text-primary-600 bg-white dark:bg-secondary-800 border-gray-300 dark:border-secondary-600 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="false"
                  {...register(fieldName, { required: question.required ? 'This field is required' : false })}
                  className="mr-3 w-4 h-4 text-primary-600 bg-white dark:bg-secondary-800 border-gray-300 dark:border-secondary-600 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-2 rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
              </label>
            </div>
            {fieldError && <p className="error-text">{fieldError.message}</p>}
            {question.helpText && <p className="help-text">{question.helpText}</p>}
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            key={index}
            label={question.question}
            {...register(fieldName, { required: question.required ? 'This field is required' : false })}
            error={fieldError?.message}
            placeholder="Enter your answer..."
            rows={3}
            helpText={question.helpText}
          />
        );

      case 'number':
        return (
          <Input
            key={index}
            type="number"
            label={question.question}
            {...register(fieldName, { 
              required: question.required ? 'This field is required' : false,
              valueAsNumber: true
            })}
            error={fieldError?.message}
            placeholder="Enter a number"
            helpText={question.helpText}
          />
        );

      default:
        return (
          <Input
            key={index}
            type={question.type}
            label={question.question}
            {...register(fieldName, { required: question.required ? 'This field is required' : false })}
            error={fieldError?.message}
            placeholder="Enter your answer..."
            helpText={question.helpText}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            🤖 Generating AI Questions...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Our AI is analyzing your product and creating personalized questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-950 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                🤖 AI-Generated Questions
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Answer these personalized questions to get your transparency score
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Product</div>
              <div className="font-medium text-gray-900 dark:text-gray-100">{productData?.productName}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{productData?.category}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={generateAIQuestions}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    📝 Questions ({questions.length})
                  </h2>
                  <Button
                    onClick={() => {
                      setQuestionsGenerated(false);
                      setQuestions([]);
                      setError('');
                      generateAIQuestions();
                    }}
                    variant="outline"
                    size="sm"
                    loading={loading}
                  >
                    🔄 Regenerate Questions
                  </Button>
                  <div className="flex space-x-2">
                    {['transparency', 'sustainability', 'compliance', 'quality', 'safety'].map(category => {
                      const count = questions.filter(q => q.category === category).length;
                      if (count === 0) return null;
                      return (
                        <span
                          key={category}
                          className={`px-2 py-1 text-xs rounded-full ${
                            category === 'transparency' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                            category === 'sustainability' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                            category === 'compliance' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                            category === 'quality' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {category}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={index} className="border-b border-gray-100 dark:border-secondary-700 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {renderQuestion(question, index)}
                      </div>
                      <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                        question.category === 'transparency' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                        question.category === 'sustainability' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        question.category === 'compliance' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                        question.category === 'quality' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                        {question.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/form')}
              >
                ← Back to Product Form
              </Button>
              
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[200px]"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Calculating Score...</span>
                  </>
                ) : (
                  '📊 Calculate Transparency Score'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AIQuestionsPage;
