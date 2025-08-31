import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helpText,
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={textareaId} className="label">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        ref={ref}
        className={clsx(
          'input resize-vertical min-h-[100px]',
          error ? 'input-error' : '',
          className
        )}
        {...props}
      />
      
      {error && <p className="error-text">{error}</p>}
      {helpText && !error && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
