# Form Validation Implementation

This document describes the comprehensive form validation system implemented for the account opening form.

## Overview

The validation system provides:
- Field-specific validation functions
- Consistent error message display
- Automatic error clearing on correction
- Step navigation validation
- Form submission validation with error prevention

## Files Created

### 1. `formValidation.ts`
Contains all field-specific validation functions:

- **validateEmail**: Validates email format
- **validatePhone**: Validates Indonesian phone number format
- **validateDate**: Validates date format and ensures not in future
- **validateNumber**: Validates numeric input with optional min/max
- **validateRequired**: Validates required text fields
- **validateNIK**: Validates Indonesian National ID format (16 digits)
- **validateIdentityNumber**: Validates identity number based on type (KTP/Passport)
- **validateAge**: Validates minimum age requirement
- **validatePostalCode**: Validates 5-digit postal code
- **validateNPWP**: Validates optional NPWP format
- **validateMinimumDeposit**: Validates minimum deposit by account type
- **validateReferenceContact**: Validates reference contact completeness
- **validateEmergencyContact**: Validates emergency contact completeness
- **validateBeneficialOwner**: Validates beneficial owner completeness
- **validateBranch**: Validates branch selection and active status
- **validateStep3Required**: Validates all required fields for step 3

### 2. `ErrorMessage.tsx`
Reusable component for displaying validation errors:
- Consistent styling with red text and icon
- Proper spacing below form fields
- Only renders when error message exists

### 3. `formHelpers.ts`
Helper utilities for form behavior:
- **getInputErrorClass**: Returns appropriate CSS class for error state
- **scrollToFirstError**: Scrolls to and focuses first error field
- **hasStepErrors**: Checks if a step has validation errors
- **clearFieldErrors**: Clears errors for specific fields

### 4. `useFormValidation.ts`
Custom React hook for managing validation:
- **validateField**: Validates single field and updates errors
- **validateFields**: Validates multiple fields at once
- **clearFieldError**: Clears error for specific field
- **clearFieldErrors**: Clears errors for multiple fields
- **clearAllErrors**: Clears all errors
- **setFieldErrors**: Sets multiple errors at once

## Integration with AccountForm

### Step Navigation Validation (handleNextStep)
- Validates branch selection on step 1
- Prevents navigation if validation errors exist
- Scrolls to and focuses first error field
- Clears errors when validation passes

### Form Submission Validation (handleSubmit)
Comprehensive validation before submission:

**Personal Identity Fields:**
- fullName, nik, email, phone, birthDate, tempatLahir
- gender, maritalStatus, agama, pendidikan
- motherName, citizenship

**Address Fields:**
- address, province, city, postalCode, statusRumah

**Employment Fields:**
- employmentStatus, monthlyIncome, sumberDana

**Account Configuration:**
- tujuanRekening (with conditional validation for "Lainnya")

**Emergency Contact:**
- kontakDaruratNama, kontakDaruratHp, kontakDaruratHubungan

**Terms:**
- agreeTerms checkbox

**Async Validations:**
- NIK uniqueness check
- Email uniqueness check
- Phone uniqueness check

**Error Handling:**
- Displays all validation errors
- Scrolls to first error field
- Shows alert with error count
- Prevents submission until all errors resolved

## Usage Example

```typescript
import { validateEmail, validatePhone } from '../utils/formValidation';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useFormValidation } from '../hooks/useFormValidation';

// In component
const { validateField, clearFieldError } = useFormValidation(errors, setErrors);

// On blur validation
const handleEmailBlur = () => {
  validateField('email', () => validateEmail(formData.email));
};

// On change - clear error
const handleEmailChange = (e) => {
  setFormData({ ...formData, email: e.target.value });
  if (errors.email) {
    clearFieldError('email');
  }
};

// In JSX
<Input
  id="email"
  value={formData.email}
  onChange={handleEmailChange}
  onBlur={handleEmailBlur}
  className={errors.email ? 'border-red-500' : ''}
/>
<ErrorMessage message={errors.email} />
```

## Validation Rules

### Required Fields
All fields marked as required must be filled before form submission.

### Format Validations
- **Email**: Standard email format (user@domain.com)
- **Phone**: Indonesian format (08xxxxxxxxxx or +628xxxxxxxxxx)
- **NIK**: Exactly 16 digits
- **KTP**: Exactly 16 digits
- **Passport**: 6-9 alphanumeric characters
- **Postal Code**: Exactly 5 digits
- **NPWP**: 15 digits (optional field)

### Business Logic Validations
- **Age**: Minimum 17 years for Simpel account
- **Minimum Deposit**: Varies by account type (SimPel: Rp 5,000)
- **Branch**: Must be active
- **Reference Contact**: If any field filled, all must be filled
- **Emergency Contact**: If any field filled, all must be filled
- **Beneficial Owner**: All fields required

### Async Validations
- **NIK**: Must be unique (not already registered)
- **Email**: Must be unique (not already registered)
- **Phone**: Must be unique (not already registered)

## Error Display Strategy

1. **Inline Errors**: Display below each field on blur
2. **Step Navigation**: Prevent navigation and show errors
3. **Form Submission**: Show all errors and scroll to first
4. **Error Clearing**: Automatic on correction

## Benefits

✅ **Consistent Validation**: All fields use standardized validation functions
✅ **Better UX**: Immediate feedback on blur, clear on correction
✅ **Prevents Invalid Submissions**: Comprehensive checks before submission
✅ **Accessible**: Proper error messages and focus management
✅ **Maintainable**: Centralized validation logic
✅ **Reusable**: Validation functions can be used across forms
