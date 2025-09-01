import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Question, FormStep, Product, QuestionAnswer } from '@/types';
import { questionsApi, productsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface MultiStepFormProps {
  productId?: string;
  onComplete?: (productId: string) => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ productId, onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<FormStep[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Basic product information schema
  const basicInfoSchema = yup.object({
    productName: yup.string().required('Product name is required').min(2, 'Product name must be at least 2 characters'),
    category: yup.string().required('Category is required'),
    description: yup.string().max(1000, 'Description must be less than 1000 characters'),
    price: yup.number().positive('Price must be positive').nullable(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm({
    resolver: yupResolver(basicInfoSchema),
    mode: 'onChange',
  });

  const watchedCategory = watch('category');

  useEffect(() => {
    initializeForm();
  }, []);

  useEffect(() => {
    if (watchedCategory && watchedCategory !== selectedCategory) {
      setSelectedCategory(watchedCategory);
      loadQuestionsForCategory(watchedCategory);
    }
  }, [watchedCategory]);

  const initializeForm = async () => {
    try {
      setLoading(true);
      
      // Load categories
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const categoriesResponse = await questionsApi.getCategories();
        const loadedCategories = categoriesResponse.data.categories;

        if (Array.isArray(loadedCategories) && loadedCategories.length > 0) {
          setCategories(loadedCategories);
        } else {
          console.warn('No categories received from API, using fallback');
          setCategories(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Other']);
        }
      } catch (error: any) {
        console.error('Error loading categories:', error.response?.data?.error || error.message);
        // Set fallback categories
        setCategories(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Other']);
        setCategoriesError(error.response?.data?.error || 'Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
      
      // If editing existing product, load its data
      if (productId) {
        const productResponse = await productsApi.getProduct(productId);
        const product = productResponse.data;
        
        // Populate form with existing data
        setValue('productName', product.productName);
        setValue('category', product.category);
        setValue('description', product.description || '');
        setValue('price', product.price ? product.price.toString() : '');
        
        setSelectedCategory(product.category);
        setFormData(product);
        
        // Load questions for the category
        await loadQuestionsForCategory(product.category);
      } else {
        // Initialize with basic info step
        setSteps([{
          id: 'basic-info',
          title: 'Basic Information',
          description: 'Enter basic product details',
          questions: [],
          isCompleted: false,
          isActive: true,
        }]);
      }
    } catch (error) {
      console.error('Error initializing form:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionsForCategory = async (category: string) => {
    try {
      const response = await questionsApi.getQuestionsByCategory(category);
      const categoryQuestions = response.data.questions;
      setQuestions(categoryQuestions);
      
      // Group questions into steps based on their order and logical grouping
      const groupedSteps = createStepsFromQuestions(categoryQuestions);
      
      // Add basic info step at the beginning
      const allSteps: FormStep[] = [
        {
          id: 'basic-info',
          title: 'Basic Information',
          description: 'Enter basic product details',
          questions: [],
          isCompleted: false,
          isActive: true,
        },
        ...groupedSteps,
      ];
      
      setSteps(allSteps);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions for category');
    }
  };

  const createStepsFromQuestions = (questions: Question[]): FormStep[] => {
    // Group questions into logical steps (max 5 questions per step)
    const questionsPerStep = 5;
    const stepGroups: Question[][] = [];
    
    for (let i = 0; i < questions.length; i += questionsPerStep) {
      stepGroups.push(questions.slice(i, i + questionsPerStep));
    }
    
    return stepGroups.map((questionGroup, index) => ({
      id: `step-${index + 1}`,
      title: `Step ${index + 2}`,
      description: `Answer questions ${index * questionsPerStep + 1}-${Math.min((index + 1) * questionsPerStep, questions.length)}`,
      questions: questionGroup,
      isCompleted: false,
      isActive: false,
    }));
  };

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic) {
      return true;
    }
    
    const { dependsOn, condition, value, showWhen } = question.conditionalLogic;
    const dependentAnswer = formData[dependsOn];
    
    if (dependentAnswer === undefined) {
      return !showWhen;
    }
    
    let conditionMet = false;
    
    switch (condition) {
      case 'equals':
        conditionMet = dependentAnswer === value;
        break;
      case 'not_equals':
        conditionMet = dependentAnswer !== value;
        break;
      case 'contains':
        conditionMet = Array.isArray(dependentAnswer) 
          ? dependentAnswer.includes(value)
          : String(dependentAnswer).includes(value);
        break;
      case 'greater_than':
        conditionMet = Number(dependentAnswer) > Number(value);
        break;
      case 'less_than':
        conditionMet = Number(dependentAnswer) < Number(value);
        break;
      default:
        conditionMet = false;
    }
    
    return showWhen ? conditionMet : !conditionMet;
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 0) {
      // Validate basic info
      return await trigger(['productName', 'category']);
    } else {
      // Validate current step questions
      const currentStepQuestions = steps[currentStep]?.questions || [];
      const visibleQuestions = currentStepQuestions.filter(shouldShowQuestion);
      
      let isValid = true;
      
      for (const question of visibleQuestions) {
        if (question.required && !formData[question.id]) {
          toast.error(`${question.question} is required`);
          isValid = false;
        }
        
        // Apply validation rules
        const answer = formData[question.id];
        if (answer && question.validationRules) {
          const { min, max, pattern } = question.validationRules;
          
          if (min && String(answer).length < min) {
            toast.error(`${question.question} must be at least ${min} characters`);
            isValid = false;
          }
          
          if (max && String(answer).length > max) {
            toast.error(`${question.question} must be no more than ${max} characters`);
            isValid = false;
          }
          
          if (pattern && !new RegExp(pattern).test(String(answer))) {
            toast.error(`${question.question} format is invalid`);
            isValid = false;
          }
        }
      }
      
      return isValid;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    
    // Mark current step as completed
    setSteps(prev => prev.map((step, index) => 
      index === currentStep 
        ? { ...step, isCompleted: true, isActive: false }
        : index === currentStep + 1
        ? { ...step, isActive: true }
        : step
    ));
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    
    // Update step states
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      isActive: index === Math.max(currentStep - 1, 0),
    })));
  };

  const handleQuestionChange = (questionId: string, value: any, questionType: string) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const onFormSubmit = async (basicData: any) => {
    try {
      setSaving(true);
      
      // Prepare questions and answers
      const questionAnswers: QuestionAnswer[] = questions
        .filter(shouldShowQuestion)
        .map(question => ({
          questionId: question.id,
          question: question.question,
          answer: formData[question.id],
          type: question.type,
        }));

      const productData: Partial<Product> = {
        userId: user!.id,
        productName: basicData.productName,
        category: basicData.category,
        description: basicData.description,
        price: basicData.price ? Number(basicData.price) : undefined,
        questions: questionAnswers,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };

      let response;
      if (productId) {
        response = await productsApi.updateProduct(productId, productData);
        toast.success('Product updated successfully!');
      } else {
        response = await productsApi.createProduct(productData);
        toast.success('Product submitted successfully!');
      }

      if (onComplete) {
        onComplete(productId || response.data.productId, productData);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Failed to submit product');
    } finally {
      setSaving(false);
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <Input
        label="Product Name"
        {...register('productName')}
        error={errors.productName?.message}
        placeholder="Enter product name"
        required
      />
      
      <div className="relative">
        <Select
          label="Category"
          {...register('category')}
          options={categories.map(cat => ({ value: cat, label: cat }))}
          placeholder={
            categoriesLoading
              ? "Loading categories..."
              : categories.length > 0
                ? "Select a category"
                : "No categories available"
          }
          error={errors.category?.message || categoriesError}
          required
          disabled={categoriesLoading || categories.length === 0}
        />
        {categoriesLoading && (
          <div className="absolute right-3 top-12 z-10">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>


      
      <Textarea
        label="Description"
        {...register('description')}
        error={errors.description?.message}
        placeholder="Enter product description (optional)"
        rows={4}
      />
      
      <Input
        label="Price"
        type="number"
        step="0.01"
        {...register('price')}
        error={errors.price?.message}
        placeholder="Enter price (optional)"
      />
    </div>
  );

  const renderQuestion = (question: Question) => {
    if (!shouldShowQuestion(question)) {
      return null;
    }

    const commonProps = {
      label: question.question,
      required: question.required,
      helpText: question.helpText,
    };

    switch (question.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            key={question.id}
            type={question.type}
            value={formData[question.id] || ''}
            onChange={(e) => handleQuestionChange(question.id, e.target.value, question.type)}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            key={question.id}
            type="number"
            value={formData[question.id] || ''}
            onChange={(e) => handleQuestionChange(question.id, e.target.value, question.type)}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleQuestionChange(question.id, e.target.value, question.type)}
            rows={4}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <Select
            key={question.id}
            value={formData[question.id] || ''}
            onChange={(e) => handleQuestionChange(question.id, e.target.value, question.type)}
            options={question.options.map(opt => ({ value: opt, label: opt }))}
            placeholder="Select an option"
            {...commonProps}
          />
        );

      case 'boolean':
        return (
          <div key={question.id} className="form-group">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData[question.id] || false}
                onChange={(e) => handleQuestionChange(question.id, e.target.checked, question.type)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {question.question}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {question.helpText && (
              <p className="text-sm text-gray-500 mt-1 ml-7">{question.helpText}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            key={question.id}
            type="date"
            value={formData[question.id] || ''}
            onChange={(e) => handleQuestionChange(question.id, e.target.value, question.type)}
            {...commonProps}
          />
        );

      case 'multiselect':
        return (
          <div key={question.id} className="form-group">
            <label className="label">
              {question.question}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={(formData[question.id] || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = formData[question.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleQuestionChange(question.id, newValues, question.type);
                    }}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {question.helpText && (
              <p className="text-sm text-gray-500 mt-1">{question.helpText}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === 0) {
      return renderBasicInfoStep();
    }

    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    return (
      <div className="space-y-6">
        {currentStepData.questions.map(renderQuestion)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading form...</span>
      </div>
    );
  }

  const isLastStep = currentStep === steps.length - 1;
  const canProceed = currentStep === 0 ? watchedCategory : true;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                  {
                    'bg-primary-600 text-white': step.isActive,
                    'bg-green-600 text-white': step.isCompleted,
                    'bg-gray-200 text-gray-600': !step.isActive && !step.isCompleted,
                  }
                )}
              >
                {step.isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              
              <div className="ml-3">
                <p className={clsx(
                  'text-sm font-medium',
                  step.isActive ? 'text-primary-600' : 'text-gray-900'
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="card">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep]?.title || 'Loading...'}
            </h2>
            {steps[currentStep]?.description && (
              <p className="text-gray-600 mt-1">{steps[currentStep].description}</p>
            )}
          </div>

          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex space-x-3">
              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={saving}
                  disabled={!canProceed}
                >
                  {productId ? 'Update Product' : 'Submit Product'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiStepForm;
