import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Edit, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  Grid3X3,
  List,
  SlidersHorizontal,
  TrendingUp
} from 'lucide-react';
import { productsApi } from '@/services/api';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductsPage: React.FC = () => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Show success message if redirected from form
  React.useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data: productsData, isLoading, error } = useQuery(
    ['products', statusFilter, categoryFilter],
    () => productsApi.getProducts({ 
      status: statusFilter === 'all' ? undefined : statusFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      limit: 50 
    }),
    {
      select: (response) => response.data,
    }
  );

  const products = productsData?.products || [];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Sort products
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.submittedAt || a.createdAt || 0).getTime() - new Date(b.submittedAt || b.createdAt || 0).getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, sortBy]);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = [...new Set(products.map(p => p.category))];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'category', label: 'Category' }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Products
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your product transparency documentation
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '200ms'}}>
          {[
            {
              title: 'Total Products',
              value: products.length,
              icon: <Package className="w-6 h-6" />,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
            },
            {
              title: 'Approved',
              value: products.filter(p => p.status === 'approved').length,
              icon: <CheckCircle className="w-6 h-6" />,
              color: 'from-success-500 to-success-600',
              bgColor: 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20'
            },
            {
              title: 'Pending Review',
              value: products.filter(p => p.status === 'submitted').length,
              icon: <Clock className="w-6 h-6" />,
              color: 'from-warning-500 to-warning-600',
              bgColor: 'from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20'
            },
            {
              title: 'Categories',
              value: categories.length,
              icon: <Tag className="w-6 h-6" />,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
            }
          ].map((stat, index) => (
            <div 
              key={stat.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up group`}
              style={{animationDelay: `${300 + index * 100}ms`}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="glass-card p-6 animate-slide-up" style={{animationDelay: '600ms'}}>
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                className="min-w-[150px]"
              />
              
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categoryOptions}
                className="min-w-[150px]"
              />
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                className="min-w-[150px]"
              />

              {/* View Mode Toggle */}
              <div className="flex rounded-xl border border-gray-300 dark:border-secondary-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-secondary-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-secondary-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white dark:bg-secondary-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-secondary-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="animate-slide-up" style={{animationDelay: '800ms'}}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading products</h3>
              <p className="text-gray-600 dark:text-gray-400">Please try again later.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'Get started by adding your first product.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
                <Link to="/form">
                  <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {filteredProducts.map((product, index) => (
                viewMode === 'grid' ? (
                  // Grid View
                  <div 
                    key={product.id}
                    className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up group"
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          <span className="ml-1 capitalize">{product.status}</span>
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {product.productName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Tag className="w-4 h-4 inline mr-1" />
                        {product.category}
                      </p>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(product.submittedAt || product.createdAt)}
                      </span>
                      {product.price && (
                        <span className="flex items-center font-semibold text-primary-600 dark:text-primary-400">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Link to={`/form/${product.id}`} className="flex-1">
                        <Button size="sm" className="w-full btn-primary">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div 
                    key={product.id}
                    className="card animate-slide-up group"
                    style={{animationDelay: `${index * 50}ms`}}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.productName}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                              <Tag className="w-4 h-4 mr-1" />
                              {product.category}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(product.submittedAt || product.createdAt)}
                            </span>
                            {product.price && (
                              <span className="flex items-center font-semibold text-primary-600 dark:text-primary-400">
                                <DollarSign className="w-4 h-4 mr-1" />
                                ${product.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {getStatusIcon(product.status)}
                          <span className="ml-1 capitalize">{product.status}</span>
                        </span>

                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Link to={`/form/${product.id}`}>
                            <Button size="sm" className="btn-primary">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;