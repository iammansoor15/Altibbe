import axios, { AxiosResponse } from 'axios';
import { Product } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// AI-specific types
export interface AIQuestion {
  question: string;
  type: 'text' | 'select' | 'boolean' | 'number' | 'textarea' | 'date' | 'email' | 'phone';
  required: boolean;
  options?: string[];
  category: 'transparency' | 'sustainability' | 'compliance' | 'quality' | 'safety';
  helpText?: string;
}

export interface AIAnswer {
  question: string;
  answer: string | number | boolean | string[];
}

export interface TransparencyScore {
  overallScore: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    transparency: { score: number; maxScore: number; percentage: number };
    sustainability: { score: number; maxScore: number; percentage: number };
    compliance: { score: number; maxScore: number; percentage: number };
    quality: { score: number; maxScore: number; percentage: number };
  };
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  complianceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Create axios instance with auth
const aiApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
aiApi.interceptors.request.use(
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

export const aiService = {
  /**
   * Generate dynamic questions based on product data
   */
  generateQuestions: async (
    productData: Partial<Product>,
    existingQuestions?: AIQuestion[]
  ): Promise<AxiosResponse<{
    success: boolean;
    questions: AIQuestion[];
    productName: string;
    category: string;
    generatedAt: string;
  }>> => {
    return aiApi.post('/ai/generate-questions', {
      productData,
      existingQuestions
    });
  },

  /**
   * Calculate transparency score based on product data and answers
   */
  calculateTransparencyScore: async (
    productData: Partial<Product>,
    answers: AIAnswer[]
  ): Promise<AxiosResponse<TransparencyScore & {
    success: boolean;
    productName: string;
    category: string;
    calculatedAt: string;
    answersAnalyzed: number;
  }>> => {
    return aiApi.post('/ai/transparency-score', {
      productData,
      answers
    });
  },

  /**
   * Check AI service health
   */
  checkHealth: async (): Promise<AxiosResponse<{
    aiService: string;
    status: any;
    proxyWorking: boolean;
    timestamp: string;
  }>> => {
    return aiApi.get('/ai/health');
  },

  /**
   * Test AI service integration
   */
  testIntegration: async (): Promise<AxiosResponse<{
    message: string;
    proxyStatus: string;
    aiServiceResponse: any;
    timestamp: string;
  }>> => {
    return aiApi.get('/ai/test');
  }
};

export default aiService;

