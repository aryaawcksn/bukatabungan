# Requirements Document

## Introduction

This document outlines the requirements for enhancing the FormSimpel component to include comprehensive data collection fields across multiple steps. The enhancement will transform the current basic form into a complete account opening form with proper step-by-step data collection including personal information, employment details, account preferences, and beneficial owner information.

## Glossary

- **FormSimpel**: The React component responsible for collecting account opening information for Simpel savings account type
- **System**: The web-based account opening application
- **User**: A person filling out the account opening form
- **Beneficial Owner (BO)**: The actual owner or beneficiary of the account being opened
- **NIK**: Nomor Induk Kependudukan (Indonesian National Identity Number)
- **KTP**: Kartu Tanda Penduduk (Indonesian Identity Card)
- **NPWP**: Nomor Pokok Wajib Pajak (Indonesian Tax Identification Number)
- **Backend**: The server-side application that processes and stores form submissions
- **Database**: The PostgreSQL database storing account opening data

## Requirements

### Requirement 1: Branch Selection Step

**User Story:** As a user, I want to select a branch office and confirm my customer status, so that I can specify where to collect my account materials and indicate if I am a new or existing customer.

#### Acceptance Criteria

1. WHEN the user views step 1, THE System SHALL display a branch selection dropdown with all available branches
2. WHEN the user selects an inactive branch, THE System SHALL display an error message indicating the branch is unavailable
3. WHEN the user attempts to proceed without selecting a branch, THE System SHALL prevent navigation and display a validation error
4. WHEN the user selects a valid active branch, THE System SHALL allow proceeding to the next step

### Requirement 2: Personal Identity Information Collection

**User Story:** As a user, I want to provide my complete personal identity information, so that the bank can verify my identity and comply with regulatory requirements.

#### Acceptance Criteria

1. WHEN the user views step 3, THE System SHALL display input fields for name, alias, identity type (KTP/Passport), identity number, validity date, place of birth, date of birth, address as per ID, postal code, current address, gender, marital status, religion, education, mother's maiden name, NPWP, phone number, citizenship, and residence status
2. WHEN the user enters an identity number, THE System SHALL validate the format matches the selected identity type
3. WHEN the user enters a date of birth, THE System SHALL validate the user meets minimum age requirements for account opening
4. WHEN the user provides current address different from ID address, THE System SHALL store both addresses separately
5. WHEN the user selects citizenship other than Indonesia, THE System SHALL display a text input for specifying the country

### Requirement 3: Employment and Financial Information Collection

**User Story:** As a user, I want to provide my employment and financial information, so that the bank can assess my financial profile and comply with anti-money laundering regulations.

#### Acceptance Criteria

1. WHEN the user views the employment section in step 3, THE System SHALL display fields for occupation, monthly salary, source of funds, average monthly transactions, company/institution name, company address, phone number, position, business sector, and reference contact information
2. WHEN the user selects an occupation type, THE System SHALL adjust field labels appropriately (e.g., "School Name" for students vs "Company Name" for employees)
3. WHEN the user enters monthly salary, THE System SHALL accept predefined ranges rather than exact amounts
4. WHEN the user provides reference contact information, THE System SHALL require name, address, phone number, and relationship fields
5. WHEN the user leaves optional employment fields empty, THE System SHALL allow form submission without those fields

### Requirement 4: Account Configuration

**User Story:** As a user, I want to specify my account preferences including account type, initial deposit, ATM card preference, and account purpose, so that the bank can set up my account according to my needs.

#### Acceptance Criteria

1. WHEN the user views the account section in step 3, THE System SHALL display fields for account type, initial deposit amount, ATM card preference (for Mutiara: none, yes, silver, gold), and account opening purpose
2. WHEN the user selects Simpel account type, THE System SHALL pre-fill the account type field and make it read-only
3. WHEN the user enters an initial deposit amount, THE System SHALL validate it meets the minimum requirement for the selected account type
4. WHEN the user selects an account opening purpose, THE System SHALL accept values: business, savings, credit, salary, or other
5. WHEN the user selects "other" as account purpose, THE System SHALL display a text input for specifying the purpose

### Requirement 5: Beneficial Owner Information Collection

**User Story:** As a user, I want to provide beneficial owner information, so that the bank can comply with beneficial ownership transparency regulations.

#### Acceptance Criteria

1. WHEN the user views step 3, THE System SHALL display fields for beneficial owner name, address, place and date of birth, ID type (KTP, passport, other), ID number, occupation, annual income range, and approval confirmation
2. WHEN the user enters beneficial owner information, THE System SHALL validate all required fields are completed
3. WHEN the user selects an annual income range, THE System SHALL accept predefined ranges: up to 5 million, 5-10 million, 10-25 million, 25-100 million
4. WHEN the user provides beneficial owner ID number, THE System SHALL validate the format matches the selected ID type
5. WHEN the user attempts to submit without beneficial owner approval, THE System SHALL prevent submission and display a validation error

### Requirement 6: Form Data Persistence and Submission

**User Story:** As a user, I want my form data to be saved to the database when I submit, so that the bank can process my account opening request.

#### Acceptance Criteria

1. WHEN the user submits the complete form, THE System SHALL send all collected data to the backend API endpoint
2. WHEN the backend receives form data, THE System SHALL validate all required fields are present
3. WHEN the backend validates the data successfully, THE System SHALL insert records into the appropriate database tables (cdd_self, cdd_job, account, cdd_reference)
4. WHEN the database insertion succeeds, THE System SHALL return a success response with a reference code
5. WHEN any validation or database error occurs, THE System SHALL return an error response with a descriptive message

### Requirement 7: Form Validation and Error Handling

**User Story:** As a user, I want to receive clear validation feedback when I enter invalid data, so that I can correct my mistakes before submission.

#### Acceptance Criteria

1. WHEN the user enters data in any field, THE System SHALL validate the input according to field-specific rules
2. WHEN validation fails for a field, THE System SHALL display an error message below the field
3. WHEN the user corrects invalid data, THE System SHALL clear the error message for that field
4. WHEN the user attempts to proceed to the next step with validation errors, THE System SHALL prevent navigation and scroll to the first error
5. WHEN the user submits the form with validation errors, THE System SHALL prevent submission and display all error messages

### Requirement 8: Multi-Step Form Navigation

**User Story:** As a user, I want to navigate between form steps easily, so that I can review and edit my information before final submission.

#### Acceptance Criteria

1. WHEN the user completes a form step, THE System SHALL allow navigation to the next step
2. WHEN the user clicks the back button, THE System SHALL navigate to the previous step without losing entered data
3. WHEN the user navigates between steps, THE System SHALL preserve all previously entered form data
4. WHEN the user reaches the final step, THE System SHALL display a submit button instead of a next button
5. WHEN the user submits the form successfully, THE System SHALL display a success confirmation screen

### Requirement 9: Emergency Contact Information

**User Story:** As a user, I want to provide emergency contact information, so that the bank can reach someone on my behalf if needed.

#### Acceptance Criteria

1. WHEN the user views step 3, THE System SHALL display fields for emergency contact name, relationship, and phone number
2. WHEN the user enters emergency contact information, THE System SHALL validate all three fields are completed
3. WHEN the user selects a relationship type, THE System SHALL accept predefined values: parent, spouse, child, sibling, or other relative
4. WHEN the user enters an emergency contact phone number, THE System SHALL validate it is a valid Indonesian phone number format
5. WHEN the user submits the form, THE System SHALL include emergency contact information in the database submission
