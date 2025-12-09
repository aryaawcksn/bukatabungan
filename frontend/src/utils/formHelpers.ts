/**
 * Form Helper Utilities
 * Provides helper functions for form styling and behavior
 */

/**
 * Returns the appropriate CSS class for an input field based on error state
 */
export const getInputErrorClass = (hasError: boolean, baseClass: string = ''): string => {
  const errorClass = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  return `${baseClass} ${errorClass}`.trim();
};

/**
 * Scrolls to the first error field in the form
 */
export const scrollToFirstError = (errors: Record<string, string>): void => {
  const firstErrorKey = Object.keys(errors)[0];
  if (firstErrorKey) {
    const element = document.getElementById(firstErrorKey);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus the element after scrolling
      setTimeout(() => {
        element.focus();
      }, 500);
    }
  }
};

/**
 * Checks if a form step has any validation errors
 */
export const hasStepErrors = (errors: Record<string, string>, stepFields: string[]): boolean => {
  return stepFields.some(field => errors[field]);
};

/**
 * Clears errors for specific fields
 */
export const clearFieldErrors = (
  errors: Record<string, string>,
  fields: string[]
): Record<string, string> => {
  const newErrors = { ...errors };
  fields.forEach(field => {
    delete newErrors[field];
  });
  return newErrors;
};
