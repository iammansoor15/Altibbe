import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, Lock, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ThemeToggle from '@/components/ui/ThemeToggle';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-hero-pattern opacity-5" />
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
              Welcome Back
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Sign in to your account to access the product transparency platform
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-up" style={{animationDelay: '400ms'}}>
          <div className="glass-card p-8 shadow-xl-soft">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

              <div className="space-y-5">
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    leftIcon={<Mail className="w-5 h-5" />}
                    {...register('email')}
                    error={errors.email?.message}
                    className="input"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                    className="input"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-secondary-600 rounded bg-white dark:bg-secondary-800"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full btn-primary text-lg py-4 group"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-secondary-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-secondary-900 text-gray-500 dark:text-gray-400 font-medium">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-secondary-600 rounded-xl shadow-sm bg-white dark:bg-secondary-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105 group"
                >
                  Create company account
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

export default LoginPage;