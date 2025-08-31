import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{leftIcon}</div>
          </div>
        )}
        
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'input',
            error ? 'input-error' : '',
            leftIcon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>
      
      {error && <p className="error-text">{error}</p>}
      {helpText && !error && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
