import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Zap, 
  Heart, 
  Brain, 
  Award, 
  Users, 
  FileText, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Eye
} from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Product Transparency",
      description: "Complete visibility into product details, ingredients, and manufacturing processes.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Intelligence",
      description: "Smart follow-up questions that adapt based on your product category and responses.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Detailed Reports",
      description: "Generate comprehensive PDF reports with all product information and transparency scores.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Health-First Approach",
      description: "Built with health, wellness, and consumer safety as our primary focus.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Dynamic Forms",
      description: "Intelligent multi-step forms that adapt based on your product type and industry.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Trust & Virtue",
      description: "Ethical systems designed to build trust between companies and consumers.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { number: "10K+", label: "Products Analyzed" },
    { number: "500+", label: "Companies Trust Us" },
    { number: "99.9%", label: "Transparency Score" },
    { number: "24/7", label: "AI Support" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Quality Manager, HealthTech Co.",
      content: "Altibbe transformed how we document our products. The AI-powered questions caught details we never thought to include.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CEO, GreenLife Products",
      content: "The transparency reports have significantly improved customer trust. Our sales increased by 40% after implementation.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Compliance Officer, PharmaCorp",
      content: "Finally, a platform that understands the complexity of our industry. The regulatory compliance features are outstanding.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">Altibbe</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
              <ThemeToggle />
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <ThemeToggle size="sm" />
              <button className="btn-ghost">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 hero-gradient opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Product{' '}
              <span className="text-gradient">Transparency</span>
              <br />
              Redefined
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Build trust through radical transparency. Our AI-powered platform helps you document, 
              analyze, and share detailed product information that consumers can trust.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 group">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 200}ms`}}>
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">{stat.number}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-secondary-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Built for <span className="text-gradient">Transparency</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every feature is designed with health, wisdom, and virtue in mind—creating systems that build trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card hover:shadow-xl-soft transform hover:-translate-y-2 transition-all duration-300 animate-slide-up group"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Three simple steps to complete product transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Smart Product Entry",
                description: "Enter your product details through our intelligent multi-step form that adapts to your industry.",
                icon: <FileText className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "AI-Powered Analysis",
                description: "Our AI generates relevant follow-up questions and analyzes your product for transparency gaps.",
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Generate Reports",
                description: "Receive comprehensive transparency reports that build consumer trust and meet regulatory requirements.",
                icon: <Award className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center animate-slide-up" style={{animationDelay: `${index * 200}ms`}}>
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white shadow-glow">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-secondary-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by <span className="text-gradient">Industry Leaders</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card animate-slide-up" style={{animationDelay: `${index * 150}ms`}}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Build Trust?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of companies using Altibbe to create transparent, trustworthy product documentation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 group">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn bg-white/20 text-white hover:bg-white/30 border border-white/30 text-lg px-8 py-4">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 dark:bg-secondary-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Altibbe</span>
              </div>
              <p className="text-gray-400">Building transparent, trustworthy systems for a healthier world.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Features</a>
                <a href="#" className="block hover:text-white transition-colors">Pricing</a>
                <a href="#" className="block hover:text-white transition-colors">API</a>
                <a href="#" className="block hover:text-white transition-colors">Documentation</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">About</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Contact</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2 text-gray-400">
                <a href="#" className="block hover:text-white transition-colors">Privacy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms</a>
                <a href="#" className="block hover:text-white transition-colors">Security</a>
                <a href="#" className="block hover:text-white transition-colors">Compliance</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 Altibbe. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Lock className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Eye className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;



