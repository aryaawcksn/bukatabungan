import { useCallback } from 'react';
import type { ValidationResult } from '../utils/formValidation';

/**
 * Custom hook for managing form validation with automatic error clearing
 */
export const useFormValidation = (
  errors: Record<string, string>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  /**
   * Validates a field and updates errors state
   * Clears error if validation passes
   */
  const validateField = useCallback(
    (fieldName: string, validationFn: () => ValidationResult) => {
      const result = validationFn();
      
      setErrors(prev => {
        const next = { ...prev };
        
        if (result.isValid) {
          // Clear error if validation passes
          delete next[fieldName];
        } else {
          // Set error if validation fails
          next[fieldName] = result.error;
        }
        
        return next;
      });
      
      return result.isValid;
    },
    [setErrors]
  );

  /**
   * Validates multiple fields and updates errors state
   */
  const validateFields = useCallback(
    (validations: Record<string, () => ValidationResult>) => {
      const newErrors: Record<string, string> = {};
      let isValid = true;
      
      Object.entries(validations).forEach(([fieldName, validationFn]) => {
        const result = validationFn();
        if (!result.isValid) {
          newErrors[fieldName] = result.error;
          isValid = false;
        }
      });
      
      setErrors(prev => {
        const next = { ...prev };
        
        // Clear errors for fields that passed validation
        Object.keys(validations).forEach(fieldName => {
          if (!newErrors[fieldName]) {
            delete next[fieldName];
          }
        });
        
        // Add new errors
        return { ...next, ...newErrors };
      });
      
      return isValid;
    },
    [setErrors]
  );

  /**
   * Clears error for a specific field
   */
  const clearFieldError = useCallback(
    (fieldName: string) => {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    },
    [setErrors]
  );

  /**
   * Clears errors for multiple fields
   */
  const clearFieldErrors = useCallback(
    (fieldNames: string[]) => {
      setErrors(prev => {
        const next = { ...prev };
        fieldNames.forEach(fieldName => {
          delete next[fieldName];
        });
        return next;
      });
    },
    [setErrors]
  );

  /**
   * Clears all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, [setErrors]);

  /**
   * Sets multiple errors at once
   */
  const setFieldErrors = useCallback(
    (newErrors: Record<string, string>) => {
      setErrors(prev => ({ ...prev, ...newErrors }));
    },
    [setErrors]
  );

  return {
    validateField,
    validateFields,
    clearFieldError,
    clearFieldErrors,
    clearAllErrors,
    setFieldErrors,
  };
};
