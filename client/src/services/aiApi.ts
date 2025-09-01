import axios, { AxiosResponse } from 'axios';
import { Product } from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

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

// Simple request deduplication cache
const pendingRequests = new Map();

function getRequestKey(url: string, data: any) {
  return `${url}_${JSON.stringify(data)}`;
}

// Add auth token to requests
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request deduplication for POST requests
    if (config.method === 'post' && config.data) {
      const requestKey = getRequestKey(config.url || '', config.data);

      if (pendingRequests.has(requestKey)) {
        console.log(`[DEDUPE] Preventing duplicate request: ${requestKey}`);
        // Cancel this request as there's already one in progress
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort();
        return Promise.reject(new Error('Request deduplicated'));
      }

      // Mark this request as pending
      pendingRequests.set(requestKey, Date.now());

      // Clean up when request completes (will be handled in response interceptor)
      config.timeout = 30000;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to clean up pending requests
aiApi.interceptors.response.use(
  (response) => {
    // Clean up pending request on success
    if (response.config.method === 'post') {
      const requestKey = getRequestKey(response.config.url || '', response.config.data);
      pendingRequests.delete(requestKey);
    }
    return response;
  },
  (error) => {
    // Clean up pending request on error (but not for cancelled requests)
    if (error.config?.method === 'post' && error.message !== 'Request deduplicated') {
      const requestKey = getRequestKey(error.config.url || '', error.config.data);
      pendingRequests.delete(requestKey);
    }
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
    cached?: boolean;
    deduplicated?: boolean;
  }>> => {
    try {
      return await aiApi.post('/ai/generate-questions', {
        productData,
        existingQuestions
      });
    } catch (error: any) {
      if (error.message === 'Request deduplicated') {
        console.log('[DEDUPE] AI question generation request was deduplicated');
        // Return a synthetic response indicating deduplication
        return {
          data: {
            success: true,
            questions: [],
            productName: productData.productName || '',
            category: productData.category || '',
            generatedAt: new Date().toISOString(),
            deduplicated: true
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {}
        } as AxiosResponse;
      }
      throw error;
    }
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

