export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  role?: string;
}

export interface Company {
  id: string;
  companyName: string;
  email: string;
  industry: string;
  contactPerson: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: string;
  isActive: boolean;
}

export interface Question {
  id: string;
  question: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'email' | 'phone' | 'textarea';
  required: boolean;
  options: string[];
  categories: string[];
  conditionalLogic?: ConditionalLogic;
  validationRules: ValidationRules;
  helpText: string;
  order: number;
  isActive: boolean;
}

export interface ConditionalLogic {
  dependsOn: string; // Question ID
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  showWhen: boolean;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: string;
}

export interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: any;
  type: Question['type'];
}

export interface Product {
  id?: string;
  userId: string;
  productName: string;
  category: string;
  description?: string;
  price?: number;
  specifications?: Record<string, any>;
  questions: QuestionAnswer[];
  submittedAt: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isCompleted: boolean;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  department?: string;
  phone?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: string[];
}

export interface PaginationResponse<T> {
  products: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}
