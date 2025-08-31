import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse, Product, Question, RegisterData, PaginationResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status >= 400) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/auth/register', data);
  },
  
  login: async (email: string, password: string): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/auth/login', { email, password });
  },
  
  verify: async (): Promise<AxiosResponse<ApiResponse>> => {
    return api.get('/auth/verify');
  },
};

// Products API
export const productsApi = {
  getProducts: async (params?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<AxiosResponse<PaginationResponse<Product>>> => {
    return api.get('/products', { params });
  },
  
  getProduct: async (id: string): Promise<AxiosResponse<Product>> => {
    return api.get(`/products/${id}`);
  },
  
  createProduct: async (data: Partial<Product>): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/products', data);
  },
  
  updateProduct: async (id: string, data: Partial<Product>): Promise<AxiosResponse<ApiResponse>> => {
    return api.put(`/products/${id}`, data);
  },
  
  deleteProduct: async (id: string): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/products/${id}`);
  },
  
  generatePdf: async (id: string): Promise<Blob> => {
    const response = await api.get(`/products/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  generateSummaryPdf: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await api.get('/products/reports/summary', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// Questions API
export const questionsApi = {
  getQuestions: async (category?: string): Promise<AxiosResponse<{ questions: Question[] }>> => {
    return api.get('/questions', { params: category ? { category } : {} });
  },
  
  getQuestionsByCategory: async (category: string): Promise<AxiosResponse<{ questions: Question[] }>> => {
    return api.get(`/questions/category/${category}`);
  },
  
  createQuestion: async (data: Partial<Question>): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/questions', data);
  },
  
  updateQuestion: async (id: string, data: Partial<Question>): Promise<AxiosResponse<ApiResponse>> => {
    return api.put(`/questions/${id}`, data);
  },
  
  deleteQuestion: async (id: string): Promise<AxiosResponse<ApiResponse>> => {
    return api.delete(`/questions/${id}`);
  },
  
  getCategories: async (): Promise<AxiosResponse<{ categories: string[] }>> => {
    return api.get('/questions/categories');
  },
};

// Reports API
export const reportsApi = {
  getReports: async (): Promise<AxiosResponse<{ reports: any[] }>> => {
    return api.get('/reports');
  },
  
  generateReport: async (data: { 
    productIds?: string[]; 
    reportType: string; 
    title?: string; 
  }): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/reports/generate', data);
  },
  
  downloadReport: async (reportId: string): Promise<AxiosResponse<Blob>> => {
    return api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
  },
  
  getReport: async (reportId: string): Promise<AxiosResponse<{ report: any }>> => {
    return api.get(`/reports/${reportId}`);
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<AxiosResponse<{ status: string; timestamp: string }>> => {
    return api.get('/health');
  },
};

export default api;
