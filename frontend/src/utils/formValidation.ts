/**
 * Form Validation Utilities
 * Provides field-specific validation functions for the account opening form
 */

export interface ValidationResult {
  isValid: boolean;
  error: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email wajib diisi' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates Indonesian phone number format
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Nomor telepon wajib diisi' };
  }
  
  // Indonesian phone numbers: starts with 08 or +62, 10-13 digits
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Format nomor telepon tidak valid (contoh: 08123456789)' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates date format and ensures it's not in the future
 */
export const validateDate = (date: string, fieldName: string = 'Tanggal'): ValidationResult => {
  if (!date) {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }
  
  const dateObj = new Date(date);
  const today = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} tidak valid` };
  }
  
  if (dateObj > today) {
    return { isValid: false, error: `${fieldName} tidak boleh di masa depan` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates numeric input
 */
export const validateNumber = (value: string, fieldName: string = 'Nilai', min?: number, max?: number): ValidationResult => {
  if (!value) {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} harus berupa angka` };
  }
  
  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} minimal ${min}` };
  }
  
  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} maksimal ${max}` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates required text field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates NIK (Indonesian National ID) format
 */
export const validateNIK = (nik: string): ValidationResult => {
  if (!nik) {
    return { isValid: false, error: 'NIK wajib diisi' };
  }
  
  if (!/^\d{16}$/.test(nik)) {
    return { isValid: false, error: 'NIK harus 16 digit angka' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates identity number based on type
 */
export const validateIdentityNumber = (idType: string, idNumber: string): ValidationResult => {
  if (!idNumber) {
    return { isValid: false, error: 'Nomor identitas wajib diisi' };
  }
  
  if (idType === 'KTP') {
    if (!/^\d{16}$/.test(idNumber)) {
      return { isValid: false, error: 'Nomor KTP harus 16 digit angka' };
    }
  } else if (idType === 'Paspor') {
    if (!/^[A-Z0-9]{6,9}$/i.test(idNumber)) {
      return { isValid: false, error: 'Nomor Paspor harus 6-9 karakter alfanumerik' };
    }
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates age requirement
 */
export const validateAge = (birthDate: string, minAge: number = 17): ValidationResult => {
  if (!birthDate) {
    return { isValid: false, error: 'Tanggal lahir wajib diisi' };
  }
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < minAge) {
    return { isValid: false, error: `Usia minimal untuk membuka rekening adalah ${minAge} tahun` };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates postal code format
 */
export const validatePostalCode = (postalCode: string): ValidationResult => {
  if (!postalCode) {
    return { isValid: false, error: 'Kode pos wajib diisi' };
  }
  
  if (!/^\d{5}$/.test(postalCode)) {
    return { isValid: false, error: 'Kode pos harus 5 digit angka' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates NPWP format (optional field)
 */
export const validateNPWP = (npwp: string): ValidationResult => {
  if (!npwp) {
    return { isValid: true, error: '' }; // NPWP is optional
  }
  
  // NPWP format: 15 digits (XX.XXX.XXX.X-XXX.XXX)
  const npwpClean = npwp.replace(/[.-]/g, '');
  if (!/^\d{15}$/.test(npwpClean)) {
    return { isValid: false, error: 'Format NPWP tidak valid (15 digit)' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates minimum deposit amount
 */
export const validateMinimumDeposit = (accountType: string, depositAmount: string): ValidationResult => {
  if (!depositAmount) {
    return { isValid: false, error: 'Nominal setoran wajib diisi' };
  }
  
  const amount = parseFloat(depositAmount);
  if (isNaN(amount)) {
    return { isValid: false, error: 'Nominal setoran harus berupa angka' };
  }
  
  const MINIMUM_DEPOSITS: Record<string, number> = {
    'SimPel': 5000,
    'Reguler': 10000,
    'Mutiara': 50000,
    'TabunganKu': 1,
    'Arofah': 10000,
    'Pensiun': 10000,
    'TamasyaPlus': 100000,
  };
  
  const minimumDeposit = MINIMUM_DEPOSITS[accountType] || 0;
  
  if (amount < minimumDeposit) {
    return { 
      isValid: false, 
      error: `Nominal setoran minimal untuk rekening ${accountType} adalah Rp ${minimumDeposit.toLocaleString('id-ID')}` 
    };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates reference contact completeness
 * If any field is filled, all fields must be filled
 */
export const validateReferenceContact = (
  nama: string,
  alamat: string,
  telepon: string,
  hubungan: string
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const anyFieldFilled = nama || alamat || telepon || hubungan;
  
  if (anyFieldFilled) {
    if (!nama) {
      errors.referensiNama = 'Nama referensi harus diisi jika mengisi kontak referensi';
    }
    if (!alamat) {
      errors.referensiAlamat = 'Alamat referensi harus diisi jika mengisi kontak referensi';
    }
    if (!telepon) {
      errors.referensiTelepon = 'Telepon referensi harus diisi jika mengisi kontak referensi';
    }
    if (!hubungan) {
      errors.referensiHubungan = 'Hubungan referensi harus diisi jika mengisi kontak referensi';
    }
  }
  
  return errors;
};

/**
 * Validates emergency contact completeness
 * If any field is filled, all fields must be filled
 */
export const validateEmergencyContact = (
  nama: string,
  hp: string,
  hubungan: string
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const anyFieldFilled = nama || hp || hubungan;
  
  if (anyFieldFilled) {
    if (!nama) {
      errors.kontakDaruratNama = 'Nama kontak darurat harus diisi jika mengisi kontak darurat';
    }
    if (!hp) {
      errors.kontakDaruratHp = 'Nomor HP kontak darurat harus diisi jika mengisi kontak darurat';
    }
    if (!hubungan) {
      errors.kontakDaruratHubungan = 'Hubungan kontak darurat harus diisi jika mengisi kontak darurat';
    }
  }
  
  return errors;
};

/**
 * Validates beneficial owner completeness
 * All BO fields are required
 */
export const validateBeneficialOwner = (boData: {
  boNama: string;
  boAlamat: string;
  boTempatLahir: string;
  boTanggalLahir: string;
  boJenisId: string;
  boNomorId: string;
  boPekerjaan: string;
  boPendapatanTahun: string;
  boPersetujuan: boolean;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!boData.boNama) {
    errors.boNama = 'Nama beneficial owner harus diisi';
  }
  if (!boData.boAlamat) {
    errors.boAlamat = 'Alamat beneficial owner harus diisi';
  }
  if (!boData.boTempatLahir) {
    errors.boTempatLahir = 'Tempat lahir beneficial owner harus diisi';
  }
  if (!boData.boTanggalLahir) {
    errors.boTanggalLahir = 'Tanggal lahir beneficial owner harus diisi';
  }
  if (!boData.boJenisId) {
    errors.boJenisId = 'Jenis identitas beneficial owner harus dipilih';
  }
  if (!boData.boNomorId) {
    errors.boNomorId = 'Nomor identitas beneficial owner harus diisi';
  } else if (boData.boJenisId) {
    const idValidation = validateIdentityNumber(boData.boJenisId, boData.boNomorId);
    if (!idValidation.isValid) {
      errors.boNomorId = idValidation.error;
    }
  }
  if (!boData.boPekerjaan) {
    errors.boPekerjaan = 'Pekerjaan beneficial owner harus diisi';
  }
  if (!boData.boPendapatanTahun) {
    errors.boPendapatanTahun = 'Pendapatan tahunan beneficial owner harus dipilih';
  }
  if (!boData.boPersetujuan) {
    errors.boPersetujuan = 'Persetujuan beneficial owner harus dicentang';
  }
  
  return errors;
};

/**
 * Validates branch selection
 */
export const validateBranch = (branchId: string, branches: any[]): ValidationResult => {
  if (!branchId) {
    return { isValid: false, error: 'Silakan pilih cabang pengambilan' };
  }
  
  const selectedBranch = branches.find(b => b.id.toString() === branchId.toString());
  if (selectedBranch && !selectedBranch.is_active) {
    return { isValid: false, error: 'Cabang sedang dalam perbaikan, silahkan pilih cabang lain' };
  }
  
  return { isValid: true, error: '' };
};

/**
 * Validates all required fields for step 3 (main data entry)
 */
export const validateStep3Required = (formData: any): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Personal Identity
  if (!formData.fullName) errors.fullName = 'Nama lengkap wajib diisi';
  if (!formData.nik) errors.nik = 'NIK wajib diisi';
  if (!formData.email) errors.email = 'Email wajib diisi';
  if (!formData.phone) errors.phone = 'Nomor telepon wajib diisi';
  if (!formData.birthDate) errors.birthDate = 'Tanggal lahir wajib diisi';
  if (!formData.tempatLahir) errors.tempatLahir = 'Tempat lahir wajib diisi';
  if (!formData.gender) errors.gender = 'Jenis kelamin wajib diisi';
  if (!formData.maritalStatus) errors.maritalStatus = 'Status pernikahan wajib diisi';
  if (!formData.agama) errors.agama = 'Agama wajib diisi';
  if (!formData.pendidikan) errors.pendidikan = 'Pendidikan wajib diisi';
  if (!formData.motherName) errors.motherName = 'Nama ibu kandung wajib diisi';
  if (!formData.citizenship) errors.citizenship = 'Kewarganegaraan wajib diisi';
  
  // Address
  if (!formData.address) errors.address = 'Alamat wajib diisi';
  if (!formData.province) errors.province = 'Provinsi wajib diisi';
  if (!formData.city) errors.city = 'Kota/Kabupaten wajib diisi';
  if (!formData.postalCode) errors.postalCode = 'Kode pos wajib diisi';
  if (!formData.statusRumah) errors.statusRumah = 'Status tempat tinggal wajib diisi';
  
  // Employment
  if (!formData.employmentStatus) errors.employmentStatus = 'Status pekerjaan wajib diisi';
  if (!formData.monthlyIncome) errors.monthlyIncome = 'Penghasilan per bulan wajib diisi';
  if (!formData.sumberDana) errors.sumberDana = 'Sumber dana wajib diisi';
  
  // Account Configuration
  if (!formData.tujuanRekening) errors.tujuanRekening = 'Tujuan rekening wajib diisi';
  if (formData.tujuanRekening === 'Lainnya' && !formData.tujuanRekeningLainnya) {
    errors.tujuanRekeningLainnya = 'Sebutkan tujuan pembukaan rekening';
  }
  
  // Emergency Contact
  if (!formData.kontakDaruratNama) errors.kontakDaruratNama = 'Nama kontak darurat wajib diisi';
  if (!formData.kontakDaruratHp) errors.kontakDaruratHp = 'Nomor HP kontak darurat wajib diisi';
  if (!formData.kontakDaruratHubungan) errors.kontakDaruratHubungan = 'Hubungan kontak darurat wajib diisi';
  
  // Terms
  if (!formData.agreeTerms) errors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
  
  return errors;
};
