import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MultiStepForm from '@/components/form/MultiStepForm';
import Button from '@/components/ui/Button';

const FormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleFormComplete = (productId: string, productData?: any) => {
    // Navigate to AI Questions page with product data
    navigate('/ai-questions', { 
      state: { 
        productData: productData || {
          id: productId,
          productName: 'Product', // Will be filled from actual data
          category: 'General'
        }
      }
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent-500/5 dark:bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
          </div>

          {/* Theme Debug Info */}
          <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400">
            Theme: {document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between animate-slide-down">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="p-3 group"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-glow">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                      {id ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      Create transparent product documentation with AI-powered guidance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 animate-slide-up" style={{animationDelay: '300ms'}}>
            {[
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Smart Questions",
                description: "AI generates relevant follow-up questions"
              },
              {
                icon: <CheckCircle className="w-5 h-5" />,
                title: "Real-time Validation",
                description: "Instant feedback on your responses"
              },
              {
                icon: <Sparkles className="w-5 h-5" />,
                title: "Transparency Score",
                description: "Get scored on product transparency"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200/50 dark:border-primary-700/50 animate-slide-up"
                style={{animationDelay: `${400 + index * 100}ms`}}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white shadow-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative animate-slide-up" style={{animationDelay: '600ms'}}>
          {/* Decorative Elements */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-r from-accent-500/10 to-primary-500/10 rounded-full blur-2xl" />
          
          {/* Main Form */}
          <div className="relative glass-card p-8 shadow-xl-soft">
            {/* Progress Indicator Background */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-secondary-700 rounded-t-2xl overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-t-2xl transition-all duration-500 ease-out" style={{width: '0%'}} />
            </div>

            <MultiStepForm 
              productId={id} 
              onComplete={handleFormComplete}
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="animate-slide-up" style={{animationDelay: '800ms'}}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-success-500 to-emerald-600 p-6 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-hero-pattern opacity-10" />
            
            <div className="relative">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Our AI-powered form adapts to your product category and guides you through the documentation process. 
                    Each question is designed to improve your product's transparency score.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      Smart Questions
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      Auto-Save
                    </span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      Progress Tracking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormPage;