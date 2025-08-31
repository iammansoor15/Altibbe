import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Plus, 
  FileText, 
  Package, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Shield,
  Award,
  Eye,
  ArrowRight,
  Activity
} from 'lucide-react';
import { productsApi } from '@/services/api';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { data: productsData, isLoading } = useQuery(
    'dashboard-products',
    () => productsApi.getProducts({ limit: 10 }),
    {
      select: (response) => response.data,
    }
  );

  const products = productsData?.products || [];
  const stats = {
    totalProducts: products.length,
    submitted: products.filter(p => p.status === 'submitted').length,
    approved: products.filter(p => p.status === 'approved').length,
    draft: products.filter(p => p.status === 'draft').length,
  };

  const recentProducts = products.slice(0, 5);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <Package className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Submitted',
      value: stats.submitted,
      icon: <Clock className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20',
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Transparency Score',
      value: '94%',
      icon: <Shield className="w-8 h-8" />,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-800/20',
      change: '+3%',
      changeType: 'positive' as const
    }
  ];

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Start documenting a new product',
      icon: <Plus className="w-6 h-6" />,
      href: '/form',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20'
    },
    {
      title: 'View All Products',
      description: 'Browse your product catalog',
      icon: <Package className="w-6 h-6" />,
      href: '/products',
      color: 'from-accent-500 to-accent-600',
      bgColor: 'from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20'
    },
    {
      title: 'Generate Reports',
      description: 'Create transparency reports',
      icon: <FileText className="w-6 h-6" />,
      href: '/reports',
      color: 'from-success-500 to-success-600',
      bgColor: 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300';
      case 'submitted':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
      case 'rejected':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Welcome back! Here's what's happening with your products.
            </p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Link to="/form">
              <Button className="btn-primary group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div 
              key={stat.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up group`}
              style={{animationDelay: `${index * 100}ms`}}
            >
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <div className={`w-full h-full bg-gradient-to-br ${stat.color} rounded-full transform translate-x-8 -translate-y-8`} />
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-semibold ${
                    stat.changeType === 'positive' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-up" style={{animationDelay: '500ms'}}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${action.bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up`}
                style={{animationDelay: `${600 + index * 100}ms`}}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${action.color} rounded-full transform translate-x-6 -translate-y-6`} />
                </div>
                
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    {action.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    <span className="text-sm">Get started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Products */}
        <div className="animate-slide-up" style={{animationDelay: '800ms'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Products</h2>
            <Link 
              to="/products" 
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm flex items-center group transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="card">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by adding your first product.</p>
                <Link to="/form">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="space-y-4">
                  {recentProducts.map((product, index) => (
                    <div 
                      key={product.id}
                      className={`flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-secondary-800/50 hover:bg-gray-100 dark:hover:bg-secondary-800 transition-all duration-300 animate-slide-up group`}
                      style={{animationDelay: `${900 + index * 50}ms`}}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.productName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          <span className="ml-1 capitalize">{product.status}</span>
                        </span>
                        
                        <button className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-700 p-8 text-white animate-slide-up" style={{animationDelay: '1000ms'}}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />
          
          <div className="relative text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Award className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Ready to Build More Trust?</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join thousands of companies using Altibbe to create transparent, trustworthy product documentation that builds consumer confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/form">
                <Button className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 group">
                  Add Another Product
                  <Plus className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/reports">
                <Button className="btn bg-white/20 text-white hover:bg-white/30 border border-white/30 px-8 py-3 group">
                  View Reports
                  <BarChart3 className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;