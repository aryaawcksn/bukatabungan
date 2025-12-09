# Implementation Plan

- [x] 1. Update TypeScript type definitions




  - [x] 1.1 Add new fields to AccountFormData interface in types.ts


    - Add alias, jenisId, nomorId, berlakuId fields for identity
    - Add rataRataTransaksi, teleponKantor, referensi fields for employment
    - Add nominalSetoran, atmPreference for account configuration
    - Add all beneficial owner fields (boNama, boAlamat, boTempatLahir, boTanggalLahir, boJenisId, boNomorId, boPekerjaan, boPendapatanTahun, boPersetujuan)
    - _Requirements: 2.1, 3.1, 4.1, 5.1_

- [x] 2. Update FormSimpel component - Step 1 (Branch Selection)





  - [x] 2.1 Verify branch selection dropdown is properly implemented


    - Ensure dropdown displays all branches from props
    - Verify inactive branch validation is working
    - Ensure error message displays for inactive branches
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 2.2 Write property test for branch validation




    - **Property 1: Branch validation prevents inactive selection**
    - **Validates: Requirements 1.2**
  - [ ]* 2.3 Write property test for active branch navigation
    - **Property 2: Active branch allows navigation**
    - **Validates: Requirements 1.4**

- [ ] 3. Update FormSimpel component - Step 3 Personal Identity Section





  - [x] 3.1 Add identity information fields


    - Add alias input field
    - Add identity type selector (KTP/Paspor/Lainnya)
    - Add identity number input field (separate from NIK for flexibility)
    - Add validity date input field
    - Update existing fields to match new requirements
    - _Requirements: 2.1, 2.2_
  - [x] 3.2 Implement identity number format validation


    - Add validation function for KTP format (16 digits)
    - Add validation function for Passport format (alphanumeric)
    - Connect validation to identity type selection
    - Display appropriate error messages
    - _Requirements: 2.2_
  - [ ]* 3.3 Write property test for identity number validation
    - **Property 3: Identity number format validation**
    - **Validates: Requirements 2.2**
  - [x] 3.4 Implement age validation


    - Add validation function to calculate age from birthDate
    - Check against minimum age requirement (e.g., 17 years for Simpel)
    - Display error message if age requirement not met
    - _Requirements: 2.3_
  - [ ]* 3.5 Write property test for age validation
    - **Property 4: Age validation for account opening**
    - **Validates: Requirements 2.3**
  - [x] 3.6 Implement citizenship conditional field


    - Add logic to show text input when citizenship is not "Indonesia"
    - Ensure proper state management for custom citizenship value
    - _Requirements: 2.5_

- [x] 4. Update FormSimpel component - Step 3 Employment Section





  - [x] 4.1 Add employment and financial fields


    - Add average monthly transactions field
    - Add company phone number field
    - Add reference contact subsection with name, address, phone, relationship fields
    - Update existing employment fields layout
    - _Requirements: 3.1, 3.4_
  - [x] 4.2 Implement occupation-based field label logic

    - Create label mapping for different occupation types
    - Update labels dynamically based on employmentStatus selection
    - Test with "pelajar-mahasiswa" (student) and "karyawan-swasta" (employee)
    - _Requirements: 3.2_
  - [ ]* 4.3 Write property test for occupation-based labels
    - **Property 6: Occupation-based field label adaptation**
    - **Validates: Requirements 3.2**
  - [x] 4.4 Implement reference contact validation

    - Add validation to check if any reference field is filled
    - If any field filled, require all four fields (name, address, phone, relationship)
    - Display appropriate error messages
    - _Requirements: 3.4_
  - [ ]* 4.5 Write property test for reference contact completeness
    - **Property 7: Reference contact field completeness**
    - **Validates: Requirements 3.4**
  - [ ]* 4.6 Write property test for optional field handling
    - **Property 8: Optional field submission allowance**
    - **Validates: Requirements 3.5**

- [x] 5. Update FormSimpel component - Step 3 Account Configuration Section





  - [x] 5.1 Add account configuration fields


    - Add initial deposit amount input field
    - Add ATM preference selector (tidak/ya/silver/gold for Mutiara, simplified for Simpel)
    - Ensure account type is pre-filled and read-only for Simpel
    - Add conditional "other" purpose text input
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  - [x] 5.2 Implement minimum deposit validation


    - Create validation function to check deposit against account type minimum
    - Define minimum deposit amounts for each account type
    - Display error message if deposit is below minimum
    - _Requirements: 4.3_
  - [ ]* 5.3 Write property test for minimum deposit validation
    - **Property 9: Minimum deposit validation**
    - **Validates: Requirements 4.3**

- [x] 6. Update FormSimpel component - Step 3 Beneficial Owner Section




  - [x] 6.1 Add beneficial owner information fields


    - Add BO name, address, place of birth, date of birth fields
    - Add BO identity type selector (KTP/Paspor/Lainnya)
    - Add BO identity number field
    - Add BO occupation field
    - Add BO annual income range selector (sd-5jt, 5-10jt, 10-25jt, 25-100jt)
    - Add BO approval checkbox
    - _Requirements: 5.1, 5.3_
  - [x] 6.2 Implement beneficial owner validation


    - Add validation to check all BO required fields are completed
    - Add validation for BO ID number format based on ID type
    - Add validation to ensure BO approval checkbox is checked
    - Display appropriate error messages
    - _Requirements: 5.2, 5.4, 5.5_
  - [ ]* 6.3 Write property test for BO field completeness
    - **Property 10: Beneficial owner field completeness**
    - **Validates: Requirements 5.2**
  - [ ]* 6.4 Write property test for BO ID format validation
    - **Property 11: Beneficial owner ID format validation**
    - **Validates: Requirements 5.4**

- [x] 7. Update AccountForm parent component





  - [x] 7.1 Initialize new form fields in formData state


    - Add all new fields to initial state with empty string or false values
    - Ensure state structure matches updated AccountFormData interface
    - _Requirements: 6.1_
  - [x] 7.2 Update form submission payload mapping


    - Map all new frontend fields to backend field names
    - Add alias, jenis_id, berlaku_id to cdd_self mapping
    - Add rata_rata_transaksi, telepon_perusahaan, referensi fields to cdd_job mapping
    - Add nominal_setoran to account mapping
    - Add all beneficial owner fields to payload (may need new table or JSON field)
    - _Requirements: 6.1_
  - [ ]* 7.3 Write property test for complete data transmission
    - **Property 12: Complete data transmission to backend**
    - **Validates: Requirements 6.1**
  - [ ]* 7.4 Write property test for backend payload mapping
    - **Property 5: Backend payload field mapping consistency** (from design doc)
    - **Validates: Requirements 6.1**

- [x] 8. Update backend controller (if needed)





  - [x] 8.1 Review pengajuanController.js for new field support


    - Check if cdd_self table accepts alias, jenis_id, berlaku_id
    - Check if cdd_job table accepts rata_rata_transaksi, telepon_perusahaan, referensi fields
    - Check if account table accepts nominal_setoran
    - Determine if beneficial owner needs new table or can use existing structure
    - _Requirements: 6.2, 6.3_
  - [x] 8.2 Add database schema migrations if needed


    - Create migration to add missing columns to cdd_self table
    - Create migration to add missing columns to cdd_job table
    - Create migration to add missing columns to account table
    - Create migration for beneficial owner table if needed
    - _Requirements: 6.3_


  - [ ] 8.3 Update controller to handle new fields
    - Update createPengajuan function to extract new fields from request body
    - Update SQL INSERT queries to include new fields
    - Add fallback logic for optional fields
    - _Requirements: 6.2, 6.3_
  - [ ]* 8.4 Write property test for backend required field validation
    - **Property 13: Backend required field validation**
    - **Validates: Requirements 6.2**
  - [ ]* 8.5 Write property test for successful insertion response
    - **Property 14: Successful database insertion response**
    - **Validates: Requirements 6.4**
  - [ ]* 8.6 Write property test for error response format
    - **Property 15: Error response with descriptive message**
    - **Validates: Requirements 6.5**

- [ ] 9. Implement comprehensive form validation





  - [x] 9.1 Add field-specific validation functions


    - Create validation function for each field type (email, phone, date, number, etc.)
    - Implement validation rules according to field requirements
    - Return appropriate error messages for each validation failure
    - _Requirements: 7.1_
  - [ ]* 9.2 Write property test for field-specific validation
    - **Property 16: Field-specific validation application**
    - **Validates: Requirements 7.1**
  - [x] 9.3 Implement error message display logic


    - Ensure error messages appear below fields on validation failure
    - Style error messages for visibility (red text, appropriate spacing)
    - _Requirements: 7.2_
  - [ ]* 9.4 Write property test for error message display
    - **Property 17: Error message display on validation failure**
    - **Validates: Requirements 7.2**
  - [x] 9.5 Implement error message clearing logic


    - Clear error message when user corrects the input
    - Trigger validation on blur or change events
    - _Requirements: 7.3_
  - [ ]* 9.6 Write property test for error message clearing
    - **Property 18: Error message clearing on correction**
    - **Validates: Requirements 7.3**
  - [x] 9.7 Implement step navigation validation


    - Add validation check before allowing navigation to next step
    - Prevent navigation if current step has errors
    - Scroll to first error field when navigation is prevented
    - _Requirements: 7.4_
  - [ ]* 9.8 Write property test for navigation prevention
    - **Property 19: Navigation prevention with validation errors**
    - **Validates: Requirements 7.4**
  - [x] 9.9 Implement form submission validation


    - Add comprehensive validation check before form submission
    - Prevent submission if any validation errors exist
    - Display all error messages on submission attempt
    - _Requirements: 7.5_
  - [ ]* 9.10 Write property test for submission prevention
    - **Property 20: Submission prevention with validation errors**
    - **Validates: Requirements 7.5**

- [x] 10. Implement multi-step navigation with data persistence




  - [x] 10.1 Verify step navigation logic


    - Ensure handleNextStep function validates current step before proceeding
    - Ensure handlePrevStep function preserves data
    - Test navigation between all steps
    - _Requirements: 8.1, 8.2_
  - [ ]* 10.2 Write property test for navigation allowance
    - **Property 21: Navigation allowance for completed steps**
    - **Validates: Requirements 8.1**
  - [ ]* 10.3 Write property test for backward navigation data persistence
    - **Property 22: Data persistence on backward navigation**
    - **Validates: Requirements 8.2**
  - [ ]* 10.4 Write property test for form data persistence across navigation
    - **Property 23: Form data persistence across navigation**
    - **Validates: Requirements 8.3**

- [x] 11. Update emergency contact section




  - [x] 11.1 Verify emergency contact fields are properly implemented


    - Ensure name, relationship, phone fields are present
    - Verify relationship dropdown has correct options
    - _Requirements: 9.1, 9.3_
  - [x] 11.2 Implement emergency contact validation


    - Add validation to check if any emergency contact field is filled
    - If any field filled, require all three fields
    - Add phone number format validation for Indonesian numbers
    - _Requirements: 9.2, 9.4_
  - [ ]* 11.3 Write property test for emergency contact completeness
    - **Property 24: Emergency contact field completeness**
    - **Validates: Requirements 9.2**
  - [ ]* 11.4 Write property test for emergency contact phone validation
    - **Property 25: Emergency contact phone format validation**
    - **Validates: Requirements 9.4**
  - [ ]* 11.5 Write property test for emergency contact data inclusion
    - **Property 26: Emergency contact data inclusion in submission**
    - **Validates: Requirements 9.5**

- [ ] 12. Final integration and testing
  - [ ] 12.1 Test complete form flow end-to-end
    - Fill out all form fields with valid data
    - Navigate through all steps
    - Submit form and verify success response
    - Check database to confirm all data is saved correctly
    - _Requirements: All_
  - [ ] 12.2 Test validation error scenarios
    - Test each validation rule with invalid data
    - Verify error messages are displayed correctly
    - Verify form submission is prevented with errors
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ] 12.3 Test edge cases
    - Test with empty optional fields
    - Test with inactive branch selection
    - Test with missing beneficial owner approval
    - Test with incomplete emergency contact
    - Test with incomplete reference contact
    - _Requirements: 1.2, 3.5, 5.5, 9.2_
  - [ ]* 12.4 Run all property-based tests
    - Execute all property tests with 100+ iterations
    - Fix any failures discovered by property tests
    - Ensure all properties pass consistently
  - [ ] 12.5 Perform manual testing on different devices
    - Test on desktop browsers (Chrome, Firefox, Safari)
    - Test on mobile devices (iOS, Android)
    - Verify responsive design works correctly
    - Check accessibility with keyboard navigation and screen readers

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
