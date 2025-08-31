import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import AIDemo from './components/ai/AIDemo';
import AIQuestionsPage from './pages/AIQuestionsPage';
import AIResultsPage from './pages/AIResultsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-secondary-950 transition-colors duration-300">
        <Routes>
          {/* Landing Page */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/form" 
          element={
            <ProtectedRoute>
              <FormPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/form/:id" 
          element={
            <ProtectedRoute>
              <FormPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-demo" 
          element={
            <ProtectedRoute>
              <AIDemo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-questions" 
          element={
            <ProtectedRoute>
              <AIQuestionsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-results" 
          element={
            <ProtectedRoute>
              <AIResultsPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirect root to landing page */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">Page not found</p>
                <a href="/dashboard" className="text-primary-600 hover:text-primary-500">
                  Go to Dashboard
                </a>
              </div>
            </div>
          } 
        />
        </Routes>
      </div>
    </ThemeProvider>
  );
};

export default App;
