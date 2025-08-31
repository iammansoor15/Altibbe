import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '@/types';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await authApi.verify();
      if (response.data.valid && response.data.user) {
        const userData: User = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          department: response.data.user.department,
          role: response.data.user.role,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      const { token: authToken, user: userInfo } = response.data;

      const userData: User = {
        id: userInfo.id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        department: userInfo.department,
        role: userInfo.role,
      };

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`Welcome back, ${userInfo.firstName}!`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      const { token: authToken, user: userInfo } = response.data;

      const userData: User = {
        id: userInfo.id,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        department: userInfo.department,
        role: userInfo.role,
      };

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`Welcome to Altibbe, ${userInfo.firstName}!`);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
