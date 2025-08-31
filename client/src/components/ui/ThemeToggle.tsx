import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'md' }) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-xl',
        'bg-white dark:bg-secondary-800 border border-gray-300 dark:border-secondary-600',
        'shadow-sm hover:shadow-md dark:shadow-glass-dark',
        'transition-all duration-300 transform hover:scale-105 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50',
        'group overflow-hidden',
        sizeClasses[size],
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      
      {/* Sun Icon */}
      <Sun
        className={clsx(
          iconSizes[size],
          'absolute text-amber-500 transition-all duration-500 transform',
          theme === 'light' 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-90 scale-0 opacity-0'
        )}
      />
      
      {/* Moon Icon */}
      <Moon
        className={clsx(
          iconSizes[size],
          'absolute text-blue-500 transition-all duration-500 transform',
          theme === 'dark' 
            ? 'rotate-0 scale-100 opacity-100' 
            : '-rotate-90 scale-0 opacity-0'
        )}
      />
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-xl bg-white dark:bg-secondary-700 opacity-0 group-active:opacity-20 transition-opacity duration-150" />
    </button>
  );
};

export default ThemeToggle;



