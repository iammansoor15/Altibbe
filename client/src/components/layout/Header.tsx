import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-gray-200 dark:border-secondary-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-gradient">Altibbe</div>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/products" className="nav-link">
                Products
              </Link>
              <Link to="/form" className="nav-link">
                Add Product
              </Link>
              <Link to="/reports" className="nav-link">
                Reports
              </Link>
            </nav>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.companyName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.contactPerson}</p>
                </div>
              </div>
              
              <div className="h-6 w-px bg-gray-300 dark:bg-secondary-600" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
