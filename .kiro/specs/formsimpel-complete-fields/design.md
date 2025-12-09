# Design Document

## Overview

This design document outlines the technical approach for enhancing the FormSimpel component to collect comprehensive account opening information across multiple form steps. The enhancement will add new form fields, update the TypeScript type definitions, modify the form submission logic, and ensure proper integration with the existing backend API.

The design follows the existing architecture pattern used in other form components (FormReguler, FormMutiara, etc.) and maintains consistency with the current multi-step form navigation system.

## Architecture

### Component Structure

The FormSimpel component will maintain its current structure as a controlled React component that receives props from the parent AccountForm component. The component will:

1. Accept form data and setter functions via props
2. Manage local UI state (modals, conditional displays)
3. Render different content based on the currentStep prop
4. Perform client-side validation
5. Delegate submission to the parent component

### Data Flow

```
User Input → FormSimpel Component → Parent AccountForm → Backend API → Database
                ↓                           ↓
         Local Validation          Async Validation (NIK, Email, Phone)
```

### Integration Points

1. **Frontend-Backend API**: POST to `/api/pengajuan` endpoint
2. **Database Tables**: 
   - `pengajuan_tabungan` (parent record)
   - `cdd_self` (personal identity data)
   - `cdd_job` (employment and financial data)
   - `account` (account preferences)
   - `cdd_reference` (emergency contact)
3. **Type System**: TypeScript interfaces in `types.ts`

## Components and Interfaces

### Updated TypeScript Interface

The `AccountFormData` interface in `types.ts` will be extended to include all new fields:

```typescript
export interface AccountFormData {
  // Existing fields
  fullName: string;
  nik: string;
  email: string;
  phone: string;
  birthDate: string;
  tempatLahir: string;
  address: string;
  alamatDomisili: string;
  province: string;
  city: string;
  postalCode: string;
  statusRumah: string;
  agama: string;
  pendidikan: string;
  npwp: string;
  monthlyIncome: string;
  cabang_pengambilan: string;
  cardType: string;
  agreeTerms: boolean;
  jenis_rekening: string;
  gender: string;
  maritalStatus: string;
  citizenship: string;
  motherName: string;
  tempatBekerja: string;
  alamatKantor: string;
  jabatan: string;
  bidangUsaha: string;
  sumberDana: string;
  tujuanRekening: string;
  kontakDaruratNama: string;
  kontakDaruratHp: string;
  kontakDaruratHubungan: string;
  employmentStatus: string;

  // New fields to be added
  alias: string;
  jenisId: string; // 'KTP' | 'Paspor' | 'Lainnya'
  nomorId: string;
  berlakuId: string; // validity date
  rataRataTransaksi: string;
  teleponKantor: string;
  referensiNama: string;
  referensiAlamat: string;
  referensiTelepon: string;
  referensiHubungan: string;
  nominalSetoran: string;
  atmPreference: string; // 'tidak' | 'ya' | 'silver' | 'gold'
  
  // Beneficial Owner fields
  boNama: string;
  boAlamat: string;
  boTempatLahir: string;
  boTanggalLahir: string;
  boJenisId: string; // 'KTP' | 'Paspor' | 'Lainnya'
  boNomorId: string;
  boPekerjaan: string;
  boPendapatanTahun: string; // 'sd-5jt' | '5-10jt' | '10-25jt' | '25-100jt'
  boPersetujuan: boolean;
}
```

### Form Step Structure

The FormSimpel component will render different sections based on `currentStep`:

- **Step 1**: Branch selection and customer status confirmation
- **Step 2**: Document upload (deprecated, can be skipped or show informational content)
- **Step 3**: Complete data entry (personal, employment, account, beneficial owner)
- **Step 4**: Success confirmation (handled by parent)

### Form Sections in Step 3

Step 3 will be organized into collapsible or clearly separated sections:

1. **Personal Identity Data** (Data Diri)
2. **Address Information** (Alamat)
3. **Employment & Financial Data** (Pekerjaan & Penghasilan)
4. **Account Configuration** (Data Rekening)
5. **Beneficial Owner Information** (Beneficial Owner)
6. **Terms & Conditions** (Persetujuan)

## Data Models

### Frontend Form State

The form state is managed in the parent `AccountForm` component and passed down to `FormSimpel`. All fields are initialized as empty strings or false for booleans.

### Backend Request Payload

When submitting, the frontend will map form fields to backend-expected field names:

```javascript
{
  // cdd_self fields
  nama: formData.fullName,
  alias: formData.alias,
  jenis_id: formData.jenisId,
  no_id: formData.nomorId || formData.nik,
  berlaku_id: formData.berlakuId,
  tempat_lahir: formData.tempatLahir,
  tanggal_lahir: formData.birthDate,
  alamat_id: formData.address,
  kode_pos_id: formData.postalCode,
  alamat_now: formData.alamatDomisili || formData.address,
  jenis_kelamin: formData.gender,
  status_kawin: formData.maritalStatus,
  agama: formData.agama,
  pendidikan: formData.pendidikan,
  nama_ibu_kandung: formData.motherName,
  npwp: formData.npwp,
  email: formData.email,
  no_hp: formData.phone,
  kewarganegaraan: formData.citizenship,
  status_rumah: formData.statusRumah,
  
  // cdd_job fields
  pekerjaan: formData.employmentStatus,
  gaji_per_bulan: formData.monthlyIncome,
  sumber_dana: formData.sumberDana,
  rata_rata_transaksi: formData.rataRataTransaksi,
  nama_perusahaan: formData.tempatBekerja,
  alamat_perusahaan: formData.alamatKantor,
  telepon_perusahaan: formData.teleponKantor,
  jabatan: formData.jabatan,
  bidang_usaha: formData.bidangUsaha,
  referensi_nama: formData.referensiNama,
  referensi_alamat: formData.referensiAlamat,
  referensi_telepon: formData.referensiTelepon,
  referensi_hubungan: formData.referensiHubungan,
  
  // account fields
  jenis_rekening: formData.jenis_rekening,
  nominal_setoran: formData.nominalSetoran,
  jenis_kartu: formData.atmPreference,
  tujuan_rekening: formData.tujuanRekening,
  
  // cdd_reference (emergency contact)
  kontak_darurat_nama: formData.kontakDaruratNama,
  kontak_darurat_hp: formData.kontakDaruratHp,
  kontak_darurat_hubungan: formData.kontakDaruratHubungan,
  
  // beneficial owner (may need separate table or JSON field)
  bo_nama: formData.boNama,
  bo_alamat: formData.boAlamat,
  bo_tempat_lahir: formData.boTempatLahir,
  bo_tanggal_lahir: formData.boTanggalLahir,
  bo_jenis_id: formData.boJenisId,
  bo_nomor_id: formData.boNomorId,
  bo_pekerjaan: formData.boPekerjaan,
  bo_pendapatan_tahun: formData.boPendapatanTahun,
  bo_persetujuan: formData.boPersetujuan,
  
  // system fields
  cabang_id: formData.cabang_pengambilan,
  setuju_data: formData.agreeTerms ? "Ya" : "Tidak"
}
```

### Database Schema Considerations

The backend controller already handles most fields. New fields that may need database schema updates:

1. **cdd_self table**: Add columns for `alias`, `jenis_id`, `berlaku_id` if not present
2. **cdd_job table**: Add columns for `rata_rata_transaksi`, `telepon_perusahaan`, `referensi_nama`, `referensi_alamat`, `referensi_telepon`, `referensi_hubungan`
3. **account table**: Add column for `nominal_setoran`
4. **Beneficial Owner**: Either add new table `cdd_beneficial_owner` or add columns to existing tables

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Branch validation prevents inactive selection
*For any* branch selection, if the selected branch has `is_active = false`, then the form validation should fail and display an error message
**Validates: Requirements 1.2**

### Property 2: Active branch allows navigation
*For any* valid active branch selection, the system should allow proceeding to the next step without validation errors
**Validates: Requirements 1.4**

### Property 3: Identity number format validation
*For any* identity number input and identity type combination, the validation should pass if and only if the format matches the selected identity type (16 digits for KTP, alphanumeric for Passport)
**Validates: Requirements 2.2**

### Property 4: Age validation for account opening
*For any* date of birth input, the validation should pass if and only if the calculated age meets the minimum age requirement for account opening
**Validates: Requirements 2.3**

### Property 5: Dual address storage
*For any* form submission where current address differs from ID address, both addresses should be stored separately in the database
**Validates: Requirements 2.4**

### Property 6: Occupation-based field label adaptation
*For any* occupation selection, the labels for employment-related fields should adjust appropriately (e.g., "School Name" for students, "Company Name" for employees)
**Validates: Requirements 3.2**

### Property 7: Reference contact field completeness
*For any* reference contact information entry, if any one field (name, address, phone, relationship) is filled, then all four fields must be filled for validation to pass
**Validates: Requirements 3.4**

### Property 8: Optional field submission allowance
*For any* form submission with optional employment fields left empty, the submission should succeed without requiring those fields
**Validates: Requirements 3.5**

### Property 9: Minimum deposit validation
*For any* initial deposit amount and account type combination, the validation should pass if and only if the deposit meets the minimum requirement for that account type
**Validates: Requirements 4.3**

### Property 10: Beneficial owner field completeness
*For any* beneficial owner information entry, all required fields (name, address, birth info, ID info, occupation, income, approval) must be completed for validation to pass
**Validates: Requirements 5.2**

### Property 11: Beneficial owner ID format validation
*For any* beneficial owner ID number and ID type combination, the validation should pass if and only if the format matches the selected ID type
**Validates: Requirements 5.4**

### Property 12: Complete data transmission to backend
*For any* form submission, all collected form data should be included in the API request payload without data loss
**Validates: Requirements 6.1**

### Property 13: Backend required field validation
*For any* data received by the backend, if any required field is missing, the backend should return a validation error response
**Validates: Requirements 6.2**

### Property 14: Successful database insertion response
*For any* successful database insertion, the backend should return a success response containing a unique reference code
**Validates: Requirements 6.4**

### Property 15: Error response with descriptive message
*For any* validation or database error, the backend should return an error response with a descriptive message explaining the failure
**Validates: Requirements 6.5**

### Property 16: Field-specific validation application
*For any* field input, the system should apply the appropriate validation rules specific to that field type
**Validates: Requirements 7.1**

### Property 17: Error message display on validation failure
*For any* field with validation failure, an error message should be displayed below that field
**Validates: Requirements 7.2**

### Property 18: Error message clearing on correction
*For any* field with a displayed error message, when the user corrects the input to be valid, the error message should be cleared
**Validates: Requirements 7.3**

### Property 19: Navigation prevention with validation errors
*For any* attempt to navigate to the next step, if the current step has validation errors, navigation should be prevented and the page should scroll to the first error
**Validates: Requirements 7.4**

### Property 20: Submission prevention with validation errors
*For any* form submission attempt, if validation errors exist, the submission should be prevented and all error messages should be displayed
**Validates: Requirements 7.5**

### Property 21: Navigation allowance for completed steps
*For any* completed form step without validation errors, the system should allow navigation to the next step
**Validates: Requirements 8.1**

### Property 22: Data persistence on backward navigation
*For any* backward navigation action, all previously entered form data should be preserved without loss
**Validates: Requirements 8.2**

### Property 23: Form data persistence across navigation
*For any* navigation sequence between steps, all previously entered form data should remain unchanged
**Validates: Requirements 8.3**

### Property 24: Emergency contact field completeness
*For any* emergency contact information entry, if any one field (name, relationship, phone) is filled, then all three fields must be filled for validation to pass
**Validates: Requirements 9.2**

### Property 25: Emergency contact phone format validation
*For any* emergency contact phone number input, the validation should pass if and only if it matches valid Indonesian phone number format
**Validates: Requirements 9.4**

### Property 26: Emergency contact data inclusion in submission
*For any* form submission with emergency contact data, that data should be included in the database submission payload
**Validates: Requirements 9.5**

## Error Handling

### Client-Side Validation Errors

1. **Empty Required Fields**: Display inline error message below the field
2. **Format Validation**: Display specific format error (e.g., "NIK must be 16 digits")
3. **Async Validation**: Display server-returned error messages (e.g., "NIK already registered")
4. **Step Navigation**: Prevent navigation and scroll to first error

### Server-Side Errors

1. **Network Errors**: Display user-friendly message "Failed to submit. Please check your connection."
2. **Validation Errors**: Display specific error from backend response
3. **Database Errors**: Display generic error "Failed to save data. Please try again."
4. **Duplicate Data**: Display specific message "This NIK/Email/Phone is already registered"

### Error Recovery

- Users can correct errors and resubmit without losing other form data
- Validation errors are cleared when the user corrects the input
- Network errors allow retry without re-entering data

## Testing Strategy

### Unit Testing

Unit tests will verify:
1. Form field rendering for each step
2. Validation logic for individual fields
3. Error message display and clearing
4. Form data state updates
5. Conditional field display logic

### Property-Based Testing

Property-based tests will be written using **fast-check** library for TypeScript/JavaScript. Each test will run a minimum of 100 iterations with randomly generated inputs.

Property tests will verify:
1. **Property 1**: Branch validation with random branch data
2. **Property 2**: Required field validation with random field combinations
3. **Property 3**: Identity number validation with random valid/invalid formats
4. **Property 4**: Form data persistence with random navigation sequences
5. **Property 5**: Backend payload mapping with random form data
6. **Property 6**: Emergency contact validation with random field combinations
7. **Property 7**: Beneficial owner approval with random BO data
8. **Property 8**: Address fallback with random address combinations
9. **Property 9**: Occupation-based labels with random occupation types
10. **Property 10**: Step navigation with random validation states

### Integration Testing

Integration tests will verify:
1. Complete form submission flow from start to finish
2. Backend API integration with real/mocked endpoints
3. Multi-step navigation with data persistence
4. Error handling for various failure scenarios

### Manual Testing Checklist

1. Fill out complete form and verify all data is saved
2. Test validation for each required field
3. Test branch selection with active/inactive branches
4. Test navigation between steps
5. Test form submission with valid and invalid data
6. Verify error messages are clear and helpful
7. Test on different screen sizes (responsive design)
8. Test with different browsers

## Implementation Notes

### Existing Code Reuse

The implementation will reuse existing patterns from:
- FormReguler: Multi-section form layout
- FormMutiara: ATM card selection logic
- AccountForm: Step navigation and validation flow

### UI/UX Considerations

1. **Field Grouping**: Related fields should be visually grouped
2. **Progressive Disclosure**: Optional fields can be hidden until relevant
3. **Clear Labels**: All fields should have descriptive labels
4. **Help Text**: Complex fields should have explanatory text
5. **Responsive Design**: Form should work on mobile and desktop
6. **Loading States**: Show loading indicator during submission
7. **Success Feedback**: Clear confirmation after successful submission

### Performance Considerations

1. **Debounced Validation**: Async validation should be debounced to avoid excessive API calls
2. **Lazy Loading**: Step content can be lazy-loaded if needed
3. **Memoization**: Use React.memo for expensive child components
4. **Optimistic Updates**: Update UI immediately, validate asynchronously

### Accessibility

1. **Keyboard Navigation**: All form controls should be keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels and roles
3. **Error Announcements**: Validation errors should be announced to screen readers
4. **Focus Management**: Focus should move to error fields when validation fails
5. **Color Contrast**: Error messages should have sufficient contrast

### Security Considerations

1. **Input Sanitization**: All user input should be sanitized before submission
2. **XSS Prevention**: Use React's built-in XSS protection
3. **CSRF Protection**: Backend should validate CSRF tokens
4. **Data Encryption**: Sensitive data should be transmitted over HTTPS
5. **PII Handling**: Personal data should be handled according to privacy regulations
