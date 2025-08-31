import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helpText,
  options,
  placeholder,
  className,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="label">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'input appearance-none pr-10',
            error ? 'input-error' : '',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {error && <p className="error-text">{error}</p>}
      {helpText && !error && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
