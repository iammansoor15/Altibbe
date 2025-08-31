import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Building, Mail, Lock, User, Phone, MapPin, Shield, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterData } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ThemeToggle from '@/components/ui/ThemeToggle';

const schema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
  department: yup.string().optional(),
  phone: yup.string().optional(),
});

type FormData = yup.InferType<typeof schema>;

const departments = [
  'Engineering',
  'Product Management',
  'Quality Assurance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Support',
  'Finance',
  'Human Resources',
  'Legal',
  'Other',
];


const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
      phone: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');

      // Validate all required fields before submission
      const allRequiredFields: (keyof FormData)[] = [
        'firstName', 'lastName', 'email', 'password', 'confirmPassword'
      ];
      const isValid = await trigger(allRequiredFields);

      if (!isValid) {
        setError('Please fill in all required fields');
        return;
      }

      const { confirmPassword, ...registerData } = data;

      // Make sure all required fields are present
      const completeData = {
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        department: registerData.department || '',
        phone: registerData.phone || '',
      };

      console.log('Submitting registration data:', completeData);
      await registerUser(completeData as RegisterData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || err.response?.data?.details?.join(', ') || 'Registration failed');
    }
  };

  const getFieldsForStep = (step: number): (keyof FormData)[] => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email'];
      case 2:
        return ['password', 'confirmPassword'];
      default:
        return [];
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="flex justify-center animate-slide-down">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">Altibbe</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Product Transparency</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 animate-slide-up" style={{animationDelay: '200ms'}}>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Join Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Create your account to access our product transparency platform
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mt-8 animate-slide-up" style={{animationDelay: '400ms'}}>
            <div className="flex items-center justify-center space-x-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow'
                        : 'bg-gray-200 dark:bg-secondary-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                        step < currentStep
                          ? 'bg-gradient-to-r from-primary-500 to-accent-500'
                          : 'bg-gray-200 dark:bg-secondary-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 space-x-20">
              <span className="text-xs text-gray-500 dark:text-gray-400">Personal Info</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Account Security</span>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl animate-slide-up" style={{animationDelay: '600ms'}}>
          <div className="glass-card p-8 shadow-xl-soft">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {error && (
                <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl p-4 animate-slide-down">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-danger-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-danger-800 dark:text-danger-200">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-slide-up">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                    <p className="text-gray-600 dark:text-gray-400">Tell us about yourself</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      leftIcon={<User className="w-5 h-5" />}
                      {...register('firstName')}
                      error={errors.firstName?.message}
                      placeholder="Enter your first name"
                      required
                    />
                    <Input
                      label="Last Name"
                      leftIcon={<User className="w-5 h-5" />}
                      {...register('lastName')}
                      error={errors.lastName?.message}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="w-5 h-5" />}
                    {...register('email')}
                    error={errors.email?.message}
                    placeholder="Enter your email address"
                    required
                  />

                  <div className="space-y-2">
                    <Select
                      label="Department (Optional)"
                      options={departments.map(dept => ({ value: dept, label: dept }))}
                      placeholder="Select your department"
                      {...register('department')}
                      error={errors.department?.message}
                    />
                  </div>

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    leftIcon={<Phone className="w-5 h-5" />}
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder="Enter your phone number"
                  />

                  {/* Debug info for step 1 */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Step 1/2: Personal Information
                  </div>
                </div>
              )}

              {/* Step 2: Account Security */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-slide-up">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account Security</h3>
                    <p className="text-gray-600 dark:text-gray-400">Set up your login credentials</p>
                  </div>

                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    {...register('password')}
                    error={errors.password?.message}
                    placeholder="Create a strong password"
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    leftIcon={<Lock className="w-5 h-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    }
                    {...register('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    placeholder="Confirm your password"
                    required
                  />

                  {/* Debug info for step 2 */}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Step 2/2: Account Security
                  </div>
                </div>
              )}



              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-secondary-600">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="px-6 py-3"
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div>
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={async () => {
                        console.log('Next Step clicked for step:', currentStep);
                        // Validate current step fields before proceeding
                        const fieldsToValidate = getFieldsForStep(currentStep);
                        console.log('Fields to validate:', fieldsToValidate);
                        console.log('Current form values:', getValues());
                        const isValid = await trigger(fieldsToValidate);
                        console.log('Validation result:', isValid);
                        console.log('Current errors:', errors);
                        if (isValid) {
                          console.log('Moving to next step');
                          nextStep();
                        } else {
                          console.log('Validation failed');
                          // Show specific field errors
                          fieldsToValidate.forEach(field => {
                            if (errors[field]) {
                              console.log(`Error in ${field}:`, errors[field]?.message);
                            }
                          });
                        }
                      }}
                      className="btn-primary px-6 py-3 group"
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      loading={isLoading}
                      className="btn-primary px-8 py-3 group"
                      onClick={() => {
                        const formData = getValues();
                        onSubmit(formData);
                      }}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                      {!isLoading && <CheckCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />}
                    </Button>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-secondary-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-secondary-900 text-gray-500 dark:text-gray-400 font-medium">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-secondary-600 rounded-xl shadow-sm bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105 group"
                >
                  Sign in instead
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Back to Landing */}
          <div className="text-center mt-6">
            <Link
              to="/landing"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200/30 dark:bg-primary-800/20 rounded-full animate-float" />
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-accent-200/30 dark:bg-accent-800/20 rounded-2xl animate-float delay-1000" />
      <div className="absolute top-1/3 right-20 w-12 h-12 bg-success-200/30 dark:bg-success-800/20 rounded-full animate-float delay-2000" />
    </div>
  );
};

export default RegisterPage;
