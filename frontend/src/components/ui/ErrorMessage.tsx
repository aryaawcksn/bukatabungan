import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

/**
 * ErrorMessage Component
 * Displays validation error messages below form fields
 * Styled for visibility with red text and appropriate spacing
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`flex items-start gap-1.5 mt-1.5 ${className}`}>
      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-600 leading-tight">
        {message}
      </p>
    </div>
  );
};

export default ErrorMessage;
