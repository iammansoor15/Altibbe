import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  TrendingUp,
  Award,
  Shield,
  Eye,
  Plus,
  Search,
  Clock,
  CheckCircle,
  Package,
  Users,
  Activity,
  Target
} from 'lucide-react';
import { productsApi, reportsApi } from '@/services/api';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');

  const { data: productsData, isLoading: productsLoading } = useQuery(
    'products-for-reports',
    () => productsApi.getProducts({ limit: 50 }),
    {
      select: (response) => response.data,
    }
  );

  const { data: reportsData, isLoading: reportsLoading, refetch: refetchReports } = useQuery(
    'reports',
    () => reportsApi.getReports(),
    {
      select: (response) => response.data,
    }
  );

  const products = productsData?.products || [];
  const reports = reportsData?.reports || [];

  const handleGenerateReport = async (productIds: any[], reportType: string) => {
    try {
      setGeneratingReport(reportType);

      // Ensure productIds are clean strings and not objects with circular references
      const cleanProductIds = productIds && productIds.length > 0
        ? productIds.map(id => {
            // Handle cases where id might be an object or have circular references
            if (typeof id === 'string') return id;
            if (typeof id === 'object' && id !== null) {
              // If it's an object, try to extract the id property
              return id.id || id._id || String(id);
            }
            return String(id);
          }).filter(id => id && typeof id === 'string')
        : undefined;

      console.log('Clean product IDs:', cleanProductIds);

      // Generate report title based on type
      let title = '';
      if (reportType === 'all-products') {
        title = 'Complete Product Transparency Report';
      } else if (reportType === 'quarterly') {
        if (!selectedQuarter) {
          toast.error('Please select a quarter for the quarterly report');
          setGeneratingReport(null);
          return;
        }
        title = `Quarterly Transparency Report - ${selectedQuarter}`;
      } else if (reportType === 'category') {
        title = 'Category Analysis Report';
      } else {
        title = 'Product Report';
      }

      // Ensure selectedQuarter is a clean string
      const cleanQuarter = selectedQuarter && typeof selectedQuarter === 'string' ? selectedQuarter : undefined;

      console.log('API call data:', {
        productIds: cleanProductIds,
        reportType,
        title,
        quarter: cleanQuarter
      });

      // Call the real API
      await reportsApi.generateReport({
        productIds: cleanProductIds,
        reportType,
        title,
        quarter: cleanQuarter
      });

      toast.success('Report generated successfully!');
      // Refresh the reports list
      await refetchReports();
      // Reset quarter selection
      setSelectedQuarter('');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await reportsApi.downloadReport(reportId);

      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Get filename from response headers or use default with .pdf extension
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'report.pdf'; // Default to .pdf extension
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast.error(error.response?.data?.error || 'Failed to download report');
    }
  };

  const formatDate = (dateValue: any) => {
    let date: Date;

    if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
      // Firebase timestamp
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      // ISO string
      date = new Date(dateValue);
    } else {
      // Fallback to current date
      date = new Date();
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'quarterly':
        return 'from-blue-500 to-blue-600';
      case 'monthly':
        return 'from-green-500 to-green-600';
      case 'category':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'quarterly':
        return <BarChart3 className="w-5 h-5" />;
      case 'monthly':
        return <Calendar className="w-5 h-5" />;
      case 'category':
        return <Package className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const quickReportTypes = [
    {
      title: 'All Products Report',
      description: 'Complete transparency report for all products',
      icon: <Package className="w-6 h-6" />,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20',
      type: 'all-products'
    },
    {
      title: 'Quarterly Summary',
      description: 'Quarterly performance and transparency metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-success-500 to-success-600',
      bgColor: 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
      type: 'quarterly'
    },
    {
      title: 'Category Analysis',
      description: 'Detailed analysis by product category',
      icon: <Target className="w-6 h-6" />,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20',
      type: 'category'
    }
  ];

  const quarterOptions = [
    { value: 'Q1-2024', label: 'Q1 2024 (Jan-Mar)' },
    { value: 'Q2-2024', label: 'Q2 2024 (Apr-Jun)' },
    { value: 'Q3-2024', label: 'Q3 2024 (Jul-Sep)' },
    { value: 'Q4-2024', label: 'Q4 2024 (Oct-Dec)' },
    { value: 'Q1-2025', label: 'Q1 2025 (Jan-Mar)' },
    { value: 'Q2-2025', label: 'Q2 2025 (Apr-Jun)' },
    { value: 'Q3-2025', label: 'Q3 2025 (Jul-Sep)' },
    { value: 'Q4-2025', label: 'Q4 2025 (Oct-Dec)' }
  ];

  // Calculate stats from real data
  const avgTransparencyScore = reports.length > 0
    ? Math.round(reports.reduce((sum, report) => sum + (report.transparencyScore || 0), 0) / reports.length)
    : 0;

  const totalProductsCovered = reports.reduce((sum, report) => sum + (report.productCount || report.products?.length || 0), 0);

  const stats = [
    {
      title: 'Total Reports',
      value: reports.length,
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      change: `+${reports.length} generated`
    },
    {
      title: 'Avg. Transparency Score',
      value: reports.length > 0 ? `${avgTransparencyScore}%` : '0%',
      icon: <Award className="w-6 h-6" />,
      color: 'from-success-500 to-success-600',
      bgColor: 'from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20',
      change: avgTransparencyScore > 90 ? 'Excellent' : 'Good'
    },
    {
      title: 'Products Covered',
      value: totalProductsCovered,
      icon: <Package className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      change: `${products.filter(p => p.status === 'approved').length} approved`
    },
    {
      title: 'Report Types',
      value: [...new Set(reports.map(r => r.type))].length,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      change: 'Active types'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Reports
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Generate and manage your product transparency reports
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{animationDelay: '200ms'}}>
          {stats.map((stat, index) => (
            <div 
              key={stat.title}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up group`}
              style={{animationDelay: `${300 + index * 100}ms`}}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-success-600 dark:text-success-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Generate Reports */}
        <div className="animate-slide-up" style={{animationDelay: '600ms'}}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Generate New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickReportTypes.map((reportType, index) => (
              <div
                key={reportType.type}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${reportType.bgColor} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up cursor-pointer`}
                style={{animationDelay: `${700 + index * 100}ms`}}
                onClick={() => {
                  if (reportType.type === 'quarterly') {
                    // Don't generate immediately for quarterly reports, need quarter selection
                    return;
                  }
                  // Ensure clean product IDs are passed
                  const cleanProductIds = products.map(p => typeof p.id === 'string' ? p.id : String(p.id));
                  handleGenerateReport(cleanProductIds, reportType.type);
                }}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${reportType.color} rounded-full transform translate-x-6 -translate-y-6`} />
                </div>
                
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${reportType.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4`}>
                    {reportType.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {reportType.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {reportType.description}
                  </p>

                  {reportType.type === 'quarterly' && (
                    <div className="mb-4">
                      <Select
                        placeholder="Select Quarter"
                        value={selectedQuarter}
                        onChange={(e) => {
                          const value = e.target?.value || e;
                          setSelectedQuarter(typeof value === 'string' ? value : String(value));
                        }}
                        options={quarterOptions.map(option => ({
                          value: option.value,
                          label: option.label
                        }))}
                        className="w-full"
                      />
                    </div>
                  )}

                  <Button
                    size="sm"
                    className={`w-full group-hover:scale-105 transition-transform ${
                      reportType.type === 'quarterly' && !selectedQuarter
                        ? 'btn-secondary opacity-50 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                    loading={generatingReport === reportType.type}
                    disabled={reportType.type === 'quarterly' && !selectedQuarter}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Ensure clean product IDs are passed
                      const cleanProductIds = products.map(p => typeof p.id === 'string' ? p.id : String(p.id));
                      handleGenerateReport(cleanProductIds, reportType.type);
                    }}
                  >
                    {generatingReport === reportType.type ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="animate-slide-up" style={{animationDelay: '1000ms'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Reports</h2>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search reports..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report, index) => (
              <div 
                key={report.id}
                className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-slide-up group"
                style={{animationDelay: `${1100 + index * 100}ms`}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getReportTypeColor(report.type)} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {report.productCount || report.products?.length || 0} products
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(report.generatedAt)}
                        </span>
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {report.transparencyScore || 0}% transparency
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300">
                      <CheckCircle className="w-4 h-4" />
                      <span className="ml-1">Completed</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="btn-primary"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reportsLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No reports yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Generate your first transparency report to track your product transparency scores and compliance metrics.
              </p>
              {products.length > 0 ? (
                <Button
                  className="btn-primary"
                  onClick={() => {
                    const cleanProductIds = products.map(p => typeof p.id === 'string' ? p.id : String(p.id));
                    handleGenerateReport(cleanProductIds, 'all-products');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate First Report
                </Button>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    You need to add some products first before generating reports.
                  </p>
                  <Link to="/form">
                    <Button className="btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 via-accent-500 to-primary-700 p-8 text-white animate-slide-up" style={{animationDelay: '1200ms'}}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-hero-pattern opacity-10" />
          
          <div className="relative text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Award className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">Share Your Transparency</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Use these reports to build trust with customers, meet regulatory requirements, and showcase your commitment to transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3"
                onClick={() => handleGenerateReport(products.map(p => p.id), 'all-products')}
              >
                Generate Complete Report
              </Button>
              <Button className="btn bg-white/20 text-white hover:bg-white/30 border border-white/30 px-8 py-3">
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;