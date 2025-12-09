import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import type { AccountFormProps } from './types';
import TermsModal from '../TermsModal';
import { validateIdentityNumber } from '../../utils/formValidation';
import { validateMinimumDeposit } from '../../utils/formValidation';

interface FormSimpelProps extends AccountFormProps {
  currentStep?: number;
}

export default function FormSimpel({
  formData,
  setFormData,
  errors,
  setErrors,
  validateNikAsync,
  validateEmailAsync,
  validatePhoneAsync,
  getFieldClass,

  branches = [],
  currentStep = 1,
}: FormSimpelProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Auto-set employment status for Simpel
  React.useEffect(() => {
    if (formData.employmentStatus !== 'pelajar-mahasiswa') {
      setFormData(prev => ({ ...prev, employmentStatus: 'pelajar-mahasiswa' }));
    }
  }, []);

  // Validation function for identity number format
  const validateIdentityNumber = (idType: string, idNumber: string): string => {
    if (!idNumber) return '';
    
    if (idType === 'KTP') {
      // KTP must be exactly 16 digits
      if (!/^\d{16}$/.test(idNumber)) {
        return 'Nomor KTP harus 16 digit angka';
      }
    } else if (idType === 'Paspor') {
      // Passport should be alphanumeric, typically 6-9 characters
      if (!/^[A-Z0-9]{6,9}$/i.test(idNumber)) {
        return 'Nomor Paspor harus 6-9 karakter alfanumerik';
      }
    }
    // For 'Lainnya', we don't enforce specific format
    return '';
  };

  // Validation function for age requirement
  const validateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Minimum age requirement for Simpel account is 17 years
    if (age < 17) {
      return 'Usia minimal untuk membuka rekening Simpel adalah 17 tahun';
    }
    
    return '';
  };

  // Validation function for reference contact completeness
  const validateReferenceContact = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const { referensiNama, referensiAlamat, referensiTelepon, referensiHubungan } = formData;
    
    // Check if any reference field is filled
    const anyFieldFilled = referensiNama || referensiAlamat || referensiTelepon || referensiHubungan;
    
    if (anyFieldFilled) {
      // If any field is filled, all fields must be filled
      if (!referensiNama) {
        errors.referensiNama = 'Nama referensi harus diisi jika mengisi kontak referensi';
      }
      if (!referensiAlamat) {
        errors.referensiAlamat = 'Alamat referensi harus diisi jika mengisi kontak referensi';
      }
      if (!referensiTelepon) {
        errors.referensiTelepon = 'Telepon referensi harus diisi jika mengisi kontak referensi';
      }
      if (!referensiHubungan) {
        errors.referensiHubungan = 'Hubungan referensi harus diisi jika mengisi kontak referensi';
      }
    }
    
    return errors;
  };

  // Validation function for beneficial owner completeness
  const validateBeneficialOwner = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const { 
      boNama, 
      boAlamat, 
      boTempatLahir, 
      boTanggalLahir, 
      boJenisId, 
      boNomorId, 
      boPekerjaan, 
      boPendapatanTahun, 
      boPersetujuan 
    } = formData;
    
    // All BO fields are required
    if (!boNama) {
      errors.boNama = 'Nama beneficial owner harus diisi';
    }
    if (!boAlamat) {
      errors.boAlamat = 'Alamat beneficial owner harus diisi';
    }
    if (!boTempatLahir) {
      errors.boTempatLahir = 'Tempat lahir beneficial owner harus diisi';
    }
    if (!boTanggalLahir) {
      errors.boTanggalLahir = 'Tanggal lahir beneficial owner harus diisi';
    }
    if (!boJenisId) {
      errors.boJenisId = 'Jenis identitas beneficial owner harus dipilih';
    }
    if (!boNomorId) {
      errors.boNomorId = 'Nomor identitas beneficial owner harus diisi';
    } else if (boJenisId) {
      // Validate BO ID format based on ID type
      const formatError = validateIdentityNumber(boJenisId, boNomorId);
      if (formatError) {
        errors.boNomorId = formatError;
      }
    }
    if (!boPekerjaan) {
      errors.boPekerjaan = 'Pekerjaan beneficial owner harus diisi';
    }
    if (!boPendapatanTahun) {
      errors.boPendapatanTahun = 'Pendapatan tahunan beneficial owner harus dipilih';
    }
    if (!boPersetujuan) {
      errors.boPersetujuan = 'Persetujuan beneficial owner harus dicentang';
    }
    
    return errors;
  };

  // Validation function for emergency contact completeness
  const validateEmergencyContact = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const { kontakDaruratNama, kontakDaruratHp, kontakDaruratHubungan } = formData;
    
    // Check if any emergency contact field is filled
    const anyFieldFilled = kontakDaruratNama || kontakDaruratHp || kontakDaruratHubungan;
    
    if (anyFieldFilled) {
      // If any field is filled, all fields must be filled
      if (!kontakDaruratNama) {
        errors.kontakDaruratNama = 'Nama kontak darurat harus diisi jika mengisi kontak darurat';
      }
      if (!kontakDaruratHp) {
        errors.kontakDaruratHp = 'Nomor HP kontak darurat harus diisi jika mengisi kontak darurat';
      } else {
        // Validate phone number format for Indonesian numbers
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
        if (!phoneRegex.test(kontakDaruratHp)) {
          errors.kontakDaruratHp = 'Format nomor HP tidak valid (contoh: 08123456789)';
        }
      }
      if (!kontakDaruratHubungan) {
        errors.kontakDaruratHubungan = 'Hubungan kontak darurat harus diisi jika mengisi kontak darurat';
      }
    }
    
    return errors;
  };

  // Minimum deposit amounts for each account type
  const MINIMUM_DEPOSITS: Record<string, number> = {
    'SimPel': 5000,
    'Reguler': 10000,
    'Mutiara': 50000,
    'TabunganKu': 1,
    'Arofah': 10000,
    'Pensiun': 10000,
    'TamasyaPlus': 100000,
  };

  // Validation function for minimum deposit
  const validateMinimumDeposit = (accountType: string, depositAmount: string): string => {
    if (!depositAmount) return '';
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount)) {
      return 'Nominal setoran harus berupa angka';
    }
    
    const minimumDeposit = MINIMUM_DEPOSITS[accountType] || 0;
    
    if (amount < minimumDeposit) {
      return `Nominal setoran minimal untuk rekening ${accountType} adalah Rp ${minimumDeposit.toLocaleString('id-ID')}`;
    }
    
    return '';
  };

  // Validate reference contact when any field changes
  React.useEffect(() => {
    const refErrors = validateReferenceContact();
    setErrors(prev => {
      const next = { ...prev };
      // Clear previous reference errors
      delete next.referensiNama;
      delete next.referensiAlamat;
      delete next.referensiTelepon;
      delete next.referensiHubungan;
      // Add new reference errors if any
      return { ...next, ...refErrors };
    });
  }, [formData.referensiNama, formData.referensiAlamat, formData.referensiTelepon, formData.referensiHubungan]);

  // Validate beneficial owner when any field changes (only if account is for others, NOT for self)
  React.useEffect(() => {
    setErrors(prev => {
      const next = { ...prev };
      // Clear previous BO errors
      delete next.boNama;
      delete next.boAlamat;
      delete next.boTempatLahir;
      delete next.boTanggalLahir;
      delete next.boJenisId;
      delete next.boNomorId;
      delete next.boPekerjaan;
      delete next.boPendapatanTahun;
      delete next.boPersetujuan;
      
      // Only validate if account is for others (NOT for self)
      if (formData.rekeningUntukSendiri === false) {
        const boErrors = validateBeneficialOwner();
        return { ...next, ...boErrors };
      }
      
      return next;
    });
  }, [
    formData.rekeningUntukSendiri,
    formData.boNama,
    formData.boAlamat,
    formData.boTempatLahir,
    formData.boTanggalLahir,
    formData.boJenisId,
    formData.boNomorId,
    formData.boPekerjaan,
    formData.boPendapatanTahun,
    formData.boPersetujuan
  ]);

  // Validate emergency contact when any field changes
  React.useEffect(() => {
    const emergencyErrors = validateEmergencyContact();
    setErrors(prev => {
      const next = { ...prev };
      // Clear previous emergency contact errors
      delete next.kontakDaruratNama;
      delete next.kontakDaruratHp;
      delete next.kontakDaruratHubungan;
      // Add new emergency contact errors if any
      return { ...next, ...emergencyErrors };
    });
  }, [formData.kontakDaruratNama, formData.kontakDaruratHp, formData.kontakDaruratHubungan]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ========================================
          STEP 1: PILIH CABANG
          ======================================== */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Pilih Lokasi Cabang</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Silakan pilih kantor cabang Bank Sleman terdekat untuk pengambilan buku tabungan SimPel Anda.
            </p>
          </div>
          
          {/* Branch Selection */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
              <Label htmlFor="cabang_pengambilan" className="text-gray-800 font-semibold text-lg mb-3 block">
                Kantor Cabang <span className="text-red-500">*</span>
              </Label>
              {errors.cabang_pengambilan && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.cabang_pengambilan}
                  </p>
                </div>
              )}
              <Select
                value={formData.cabang_pengambilan}
                onValueChange={(value) => {
                   const selectedBranch = branches.find(b => b.id.toString() === value.toString());
                   if (selectedBranch && !selectedBranch.is_active) {
                      setErrors(prev => ({ ...prev, cabang_pengambilan: "Cabang sedang dalam perbaikan, silahkan pilih cabang lain" }));
                   } else {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.cabang_pengambilan;
                        return next;
                      });
                   }
                   setFormData({ ...formData, cabang_pengambilan: value });
                }}
              >
                <SelectTrigger className={`h-14 bg-white border-2 text-base focus:border-emerald-500 focus:ring-emerald-500 rounded-xl ${errors.cabang_pengambilan ? 'border-red-500' : 'border-slate-300'}`}>
                  <SelectValue placeholder="-- Pilih Cabang Bank Sleman --" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id.toString()} disabled={!branch.is_active}>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{branch.nama_cabang}</span>
                        {!branch.is_active && <span className="text-xs text-red-500 ml-2">(Tidak tersedia)</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 mt-3 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Buku tabungan dapat diambil di cabang yang Anda pilih setelah permohonan disetujui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          STEP 2: DATA DIRI NASABAH
          ======================================== */}
      {currentStep === 2 && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Data Diri Nasabah</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Lengkapi data diri Anda sesuai dengan dokumen identitas resmi.
            </p>
          </div>

          {/* Section 1: Identitas Diri */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
              Identitas Diri
            </h4>
            <div className="space-y-5">

              {/* Nama Lengkap */}
              <div>
                <Label htmlFor="fullName" className="text-gray-700 font-semibold">
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                />
              </div>

              {/* Alias */}
              <div>
                <Label htmlFor="alias" className="text-gray-700 font-semibold flex items-center gap-2">
                  Nama Panggilan / Alias
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                </Label>
                <Input
                  id="alias"
                  placeholder="Nama panggilan atau alias"
                  value={formData.alias}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                />
              </div>

              {/* Identity Type & Number */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Jenis Identitas <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.jenisId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, jenisId: value, nik: '' });
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.nik;
                        return next;
                      });
                    }}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih Jenis Identitas --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KTP">
                        <div className="flex items-center gap-2">
                          <span>🪪</span>
                          <span>KTP / KIA</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Paspor">
                        <div className="flex items-center gap-2">
                          <span>📘</span>
                          <span>Paspor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Lainnya">
                        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <span>Lainnya</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.jenisId === 'Lainnya' && (
                    <Input
                      placeholder="Sebutkan jenis identitas"
                      value={formData.jenisIdCustom || ''}
                      onChange={(e) => setFormData({ ...formData, jenisIdCustom: e.target.value })}
                      className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="nik" className="text-gray-700 font-semibold">
                    {formData.jenisId === 'KTP' ? 'NIK / KIA' : formData.jenisId === 'Paspor' ? 'Nomor Paspor' : 'Nomor Identitas'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nik"
                    required
                    placeholder={formData.jenisId === 'KTP' ? 'Masukkan 16 digit NIK' : formData.jenisId === 'Paspor' ? 'Masukkan 6-9 karakter' : 'Masukkan nomor identitas'}
                    maxLength={formData.jenisId === 'KTP' ? 16 : undefined}
                    value={formData.nik}
                    onChange={(e) => {
                      setFormData({ ...formData, nik: e.target.value });
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.nik;
                        return next;
                      });
                    }}
                    onBlur={async (e) => {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      
                      const formatError = validateIdentityNumber(formData.jenisId, val);
                      if (formatError) {
                        setErrors(prev => ({...prev, nik: formatError}));
                        return;
                      }
                      
                      if (formData.jenisId === 'KTP') {
                        const err = await validateNikAsync(val);
                        if(err) {
                          setErrors(prev => ({...prev, nik: err}));
                        } else {
                          setErrors(prev => {
                            const next = { ...prev };
                            delete next.nik;
                            return next;
                          });
                        }
                      }
                    }}
                    className={`mt-2 h-12 rounded-lg border-2 ${errors.nik ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {errors.nik && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.nik}
                    </p>
                  )}
                </div>
              </div>

              {/* Validity Date */}
              <div>
                <Label htmlFor="berlakuId" className="text-gray-700 font-semibold flex items-center gap-2">
                  Masa Berlaku Identitas
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                </Label>
                <Input
                  id="berlakuId"
                  type="date"
                  value={formData.berlakuId}
                  onChange={(e) => setFormData({ ...formData, berlakuId: e.target.value })}
                  className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Kosongkan jika berlaku seumur hidup
                </p>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                  <Label htmlFor="tempatLahir" className="text-gray-700 font-semibold">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tempatLahir"
                    required
                    placeholder="Contoh: Yogyakarta"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <Label htmlFor="birthDate" className="text-gray-700 font-semibold">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const err = validateAge(val);
                      if (err) {
                        setErrors(prev => ({ ...prev, birthDate: err }));
                      } else {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.birthDate;
                          return next;
                        });
                      }
                    }}
                    className={`mt-2 h-12 rounded-lg border-2 ${errors.birthDate ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.birthDate}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Minimal usia 17 tahun</p>
                </div>
              </div>

              {/* Gender + Marital + Agama */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">👨 Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">👩 Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Status Pernikahan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                      <SelectItem value="Kawin">Kawin</SelectItem>
                      <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                      <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Agama <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.agama}
                    onValueChange={(value) => setFormData({ ...formData, agama: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">☪️ Islam</SelectItem>
                      <SelectItem value="Kristen">✝️ Kristen</SelectItem>
                      <SelectItem value="Katolik">✝️ Katolik</SelectItem>
                      <SelectItem value="Hindu">🕉️ Hindu</SelectItem>
                      <SelectItem value="Budha">☸️ Budha</SelectItem>
                      <SelectItem value="Konghucu">☯️ Konghucu</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Pendidikan + Nama Ibu */}
               <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Pendidikan Terakhir <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.pendidikan}
                    onValueChange={(value) => setFormData({ ...formData, pendidikan: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih Pendidikan --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">🎒 SD</SelectItem>
                      <SelectItem value="SMP">📚 SMP</SelectItem>
                      <SelectItem value="SMA">🎓 SMA</SelectItem>
                      <SelectItem value="Diploma">📜 Diploma (D3)</SelectItem>
                      <SelectItem value="Sarjana">🎓 Sarjana (S1)</SelectItem>
                      <SelectItem value="Magister">🎓 Magister (S2)</SelectItem>
                      <SelectItem value="Doktor">🎓 Doktor (S3)</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="motherName" className="text-gray-700 font-semibold">
                    Nama Ibu Kandung <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="motherName"
                    required
                    placeholder="Nama lengkap ibu kandung"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Informasi Kontak */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
              Informasi Kontak
            </h4>
            <div className="space-y-5">

              {/* Email + Phone */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="contoh@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.email;
                        return next;
                      });
                    }}
                     onBlur={async (e) => {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      const err = await validateEmailAsync(val);
                      if(err) {
                        setErrors(prev => ({...prev, email: err}));
                      } else {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.email;
                          return next;
                        });
                      }
                    }}
                    className={`mt-2 h-12 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                   {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-semibold">
                    Nomor Telepon (WA Aktif) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.phone;
                        return next;
                      });
                    }}
                    onBlur={async (e) => {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      const err = await validatePhoneAsync(val);
                      if(err) {
                        setErrors(prev => ({...prev, phone: err}));
                      } else {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.phone;
                          return next;
                        });
                      }
                    }}
                    className={`mt-2 h-12 rounded-lg border-2 ${errors.phone ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Nomor WhatsApp yang aktif untuk verifikasi</p>
                </div>
              </div>
              
              {/* Kewarganegaraan */}
              <div>
                 <Label className="text-gray-700 font-semibold">
                   Kewarganegaraan <span className="text-red-500">*</span>
                 </Label>
                  <div className="flex items-center gap-6 mt-3 flex-wrap">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition">
                    <input 
                      type="radio" 
                      name="citizenship" 
                      value="Indonesia" 
                      checked={formData.citizenship === "Indonesia"} 
                      onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })} 
                      className="hidden" 
                    />
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.citizenship === "Indonesia" ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}>
                      {formData.citizenship === "Indonesia" && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </span>
                    <span className="text-sm font-medium text-gray-700">🇮🇩 Indonesia</span>
                  </label>
                   <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 border-slate-200 hover:border-emerald-300 transition">
                    <input 
                      type="radio" 
                      name="citizenship" 
                      value="Other" 
                      checked={formData.citizenship !== "Indonesia" && formData.citizenship !== ""} 
                      onChange={() => {
                        if (formData.citizenship === "Indonesia" || formData.citizenship === "") {
                          setFormData({ ...formData, citizenship: "Other" });
                        }
                      }} 
                      className="hidden" 
                    />
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.citizenship !== "Indonesia" && formData.citizenship !== "" ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}>
                      {formData.citizenship !== "Indonesia" && formData.citizenship !== "" && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                    </span>
                    <span className="text-sm font-medium text-gray-700">🌍 Lainnya</span>
                  </label>
                  </div>
                  {formData.citizenship !== "Indonesia" && formData.citizenship !== "" && (
                    <Input 
                      type="text" 
                      placeholder="Ketik kewarganegaraan Anda" 
                      value={formData.citizenship === "Other" ? "" : formData.citizenship} 
                      onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })} 
                      className="mt-3 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500" 
                    />
                  )}
              </div>

            </div>
          </div>

          {/* Section 3: Alamat Tempat Tinggal */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">3</span>
              Alamat Tempat Tinggal
            </h4>
            <div className="space-y-5">

              <div>
                <Label htmlFor="address" className="text-gray-700 font-semibold">
                  Alamat Lengkap (Jalan, RT/RW) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  required
                  rows={3}
                  placeholder="Contoh: Jl. Magelang No. 123, RT 02/RW 05"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">Alamat sesuai dengan KTP/identitas</p>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label htmlFor="province" className="text-gray-700 font-semibold">
                    Provinsi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="province"
                    required
                    placeholder="Contoh: DI Yogyakarta"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-gray-700 font-semibold">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    required
                    placeholder="Contoh: Sleman"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-gray-700 font-semibold">
                    Kode Pos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    required
                    maxLength={5}
                    placeholder="55281"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700 font-semibold">
                      Status Tempat Tinggal <span className="text-red-500">*</span>
                    </Label>
                     <Select
                        value={formData.statusRumah}
                        onValueChange={(value) => setFormData({ ...formData, statusRumah: value })}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Status --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milik Sendiri">🏠 Milik Sendiri</SelectItem>
                          <SelectItem value="Milik Orang Tua">👨‍👩‍👧 Milik Orang Tua</SelectItem>
                          <SelectItem value="Sewa/Kontrak">🔑 Sewa/Kontrak</SelectItem>
                          <SelectItem value="Dinas">🏢 Rumah Dinas</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
                 
                 <div>
                    <Label className="text-gray-700 font-semibold flex items-center gap-2">
                      Alamat Domisili
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                    </Label>
                    <Input
                       placeholder="Kosongkan jika sama dengan alamat KTP"
                       value={formData.alamatDomisili}
                       onChange={(e) => setFormData({...formData, alamatDomisili: e.target.value})}
                       className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Isi jika berbeda dengan alamat KTP</p>
                 </div>
              </div>

            </div>
          </div>

          {/* Section 4: Kontak Darurat (Optional) */}
          <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold text-emerald-800 text-lg">Kontak Darurat</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Opsional</span>
            </div>
            <p className="text-sm text-gray-600 mb-5 bg-white p-3 rounded-lg border border-slate-200">
              💡 Jika diisi, harap lengkapi semua field. Kontak darurat akan dihubungi jika terjadi hal penting terkait rekening Anda.
            </p>
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <Label htmlFor="kontakDaruratNama" className="text-gray-700 font-semibold">Nama Lengkap</Label>
                <Input
                  id="kontakDaruratNama"
                  placeholder="Nama kontak darurat"
                  value={formData.kontakDaruratNama}
                  onChange={(e) => setFormData({ ...formData, kontakDaruratNama: e.target.value })}
                  className={`mt-2 h-12 rounded-lg border-2 ${errors.kontakDaruratNama ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {errors.kontakDaruratNama && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.kontakDaruratNama}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="kontakDaruratHubungan" className="text-gray-700 font-semibold">Hubungan</Label>
                <Select
                  value={formData.kontakDaruratHubungan}
                  onValueChange={(value) => setFormData({ ...formData, kontakDaruratHubungan: value })}
                >
                  <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${errors.kontakDaruratHubungan ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                    <SelectValue placeholder="-- Pilih --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Orang Tua">👨‍👩‍👧 Orang Tua</SelectItem>
                    <SelectItem value="Suami/Istri">💑 Suami/Istri</SelectItem>
                    <SelectItem value="Anak">👶 Anak</SelectItem>
                    <SelectItem value="Saudara Kandung">👫 Saudara Kandung</SelectItem>
                    <SelectItem value="Kerabat Lain">👥 Kerabat Lain</SelectItem>
                  </SelectContent>
                </Select>
                {errors.kontakDaruratHubungan && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.kontakDaruratHubungan}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="kontakDaruratHp" className="text-gray-700 font-semibold">Nomor HP</Label>
                <Input
                  id="kontakDaruratHp"
                  placeholder="08123456789"
                  value={formData.kontakDaruratHp}
                  onChange={(e) => setFormData({ ...formData, kontakDaruratHp: e.target.value })}
                  className={`mt-2 h-12 rounded-lg border-2 ${errors.kontakDaruratHp ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {errors.kontakDaruratHp && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.kontakDaruratHp}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================
          STEP 3: DATA PEKERJAAN & KEUANGAN
          ======================================== */}
      {currentStep === 3 && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Data Pekerjaan & Keuangan</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Informasi ini diperlukan untuk proses verifikasi dan keamanan rekening Anda.
            </p>
          </div>

          {/* Section 1: Informasi Pekerjaan */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
              Informasi Pekerjaan
            </h4>
            <div className="space-y-5">

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                   <Label className="text-gray-700 font-semibold">
                     Pekerjaan <span className="text-red-500">*</span>
                   </Label>
                   <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => setFormData({ ...formData, employmentStatus: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih Pekerjaan --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pelajar-mahasiswa">🎓 Pelajar / Mahasiswa</SelectItem>
                      <SelectItem value="karyawan-swasta">💼 Karyawan Swasta</SelectItem>
                      <SelectItem value="pns">🏛️ PNS / TNI / Polri</SelectItem>
                      <SelectItem value="wiraswasta">🏪 Wiraswasta</SelectItem>
                      <SelectItem value="ibu-rumah-tangga">🏠 Ibu Rumah Tangga</SelectItem>
                      <SelectItem value="lainnya">📋 Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">Default: Pelajar/Mahasiswa untuk SimPel</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Penghasilan / Gaji per Bulan <span className="text-red-500">*</span>
                  </Label>
                   <Select
                    value={formData.monthlyIncome}
                    onValueChange={(value) => setFormData({ ...formData, monthlyIncome: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                      <SelectValue placeholder="-- Pilih Range Penghasilan --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 3 Juta">💰 &lt; 3 Juta</SelectItem>
                      <SelectItem value="3 - 5 Juta">💰 3 - 5 Juta</SelectItem>
                      <SelectItem value="5 - 10 Juta">💰💰 5 - 10 Juta</SelectItem>
                      <SelectItem value="> 10 Juta">💰💰💰 &gt; 10 Juta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
               </div>

              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">
                      {formData.employmentStatus === 'pelajar-mahasiswa' ? 'Nama Sekolah / Universitas' : 'Nama Perusahaan'}
                    </Label>
                    <Input
                      value={formData.tempatBekerja}
                      onChange={(e) => setFormData({ ...formData, tempatBekerja: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
                 <div>
                    <Label className="text-gray-700">
                      {formData.employmentStatus === 'pelajar-mahasiswa' ? 'Kelas / Jurusan' : 'Jabatan'}
                    </Label>
                    <Input
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">
                      {formData.employmentStatus === 'pelajar-mahasiswa' ? 'Alamat Sekolah / Universitas' : 'Alamat Kantor'}
                    </Label>
                    <Input
                      value={formData.alamatKantor}
                      onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>

              </div>

              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">Bidang Usaha (Jika Bekerja)</Label>
                    <Input
                      placeholder="Contoh: Perdagangan, Jasa..."
                      value={formData.bidangUsaha}
                      onChange={(e) => setFormData({ ...formData, bidangUsaha: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
                 <div>
                    <Label className="text-gray-700">Rata-rata Transaksi per Bulan</Label>
                    <Input
                      type="number"
                      placeholder="Contoh: 1000000"
                      value={formData.rataRataTransaksi}
                      onChange={(e) => setFormData({ ...formData, rataRataTransaksi: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
              </div>


              <div>
                <Label htmlFor="sumberDana" className="text-gray-700">Sumber Dana</Label>
                <Select
                  value={formData.sumberDana}
                  onValueChange={(value) => setFormData({ ...formData, sumberDana: value })}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-md">
                    <SelectValue placeholder="Pilih sumber dana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gaji">Gaji</SelectItem>
                    <SelectItem value="Hasil Usaha">Hasil Usaha</SelectItem>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Beasiswa">Beasiswa</SelectItem>
                    <SelectItem value="Warisan">Warisan</SelectItem>
                    <SelectItem value="Tabungan">Tabungan Pribadi</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reference Contact Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-emerald-800 mb-3">Kontak Referensi (Opsional)</h4>
                <p className="text-xs text-gray-500 mb-4">Jika diisi, harap lengkapi semua field</p>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="referensiNama" className="text-gray-700">Nama Lengkap</Label>
                      <Input
                        id="referensiNama"
                        placeholder="Nama kontak referensi"
                        value={formData.referensiNama}
                        onChange={(e) => setFormData({ ...formData, referensiNama: e.target.value })}
                        className={`mt-2 h-10 rounded-md ${errors.referensiNama ? 'border-red-500' : ''}`}
                      />
                      {errors.referensiNama && <p className="text-sm text-red-600 mt-1">{errors.referensiNama}</p>}
                    </div>
                    <div>
                      <Label htmlFor="referensiTelepon" className="text-gray-700">Nomor Telepon</Label>
                      <Input
                        id="referensiTelepon"
                        placeholder="08xxxxxxxxxx"
                        value={formData.referensiTelepon}
                        onChange={(e) => setFormData({ ...formData, referensiTelepon: e.target.value })}
                        className={`mt-2 h-10 rounded-md ${errors.referensiTelepon ? 'border-red-500' : ''}`}
                      />
                      {errors.referensiTelepon && <p className="text-sm text-red-600 mt-1">{errors.referensiTelepon}</p>}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="referensiAlamat" className="text-gray-700">Alamat</Label>
                      <Input
                        id="referensiAlamat"
                        placeholder="Alamat lengkap"
                        value={formData.referensiAlamat}
                        onChange={(e) => setFormData({ ...formData, referensiAlamat: e.target.value })}
                        className={`mt-2 h-10 rounded-md ${errors.referensiAlamat ? 'border-red-500' : ''}`}
                      />
                      {errors.referensiAlamat && <p className="text-sm text-red-600 mt-1">{errors.referensiAlamat}</p>}
                    </div>
                    <div>
                      <Label htmlFor="referensiHubungan" className="text-gray-700">Hubungan</Label>
                      <Select
                        value={formData.referensiHubungan}
                        onValueChange={(value) => setFormData({ ...formData, referensiHubungan: value })}
                      >
                        <SelectTrigger className={`mt-2 h-10 rounded-md ${errors.referensiHubungan ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih hubungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Keluarga">Keluarga</SelectItem>
                          <SelectItem value="Teman">Teman</SelectItem>
                          <SelectItem value="Rekan Kerja">Rekan Kerja</SelectItem>
                          <SelectItem value="Tetangga">Tetangga</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.referensiHubungan && <p className="text-sm text-red-600 mt-1">{errors.referensiHubungan}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

        </div>
      )}

      {/* ========================================
          STEP 4: DATA REKENING
          ======================================== */}
      {currentStep === 4 && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Konfigurasi Rekening</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Tentukan detail rekening tabungan SimPel Anda.
            </p>
          </div>

          {/* Section 1: Konfigurasi Rekening */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
              Detail Rekening
            </h4>
            <div className="space-y-5">
              
              {/* Account Type - Pre-filled and Read-only for Simpel */}
              <div>
                <Label htmlFor="jenis_rekening" className="text-gray-700">Jenis Rekening</Label>
                <Input
                  id="jenis_rekening"
                  value="SimPel"
                  readOnly
                  disabled
                  className="mt-2 h-12 rounded-md bg-slate-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Jenis rekening SimPel (Simpanan Pelajar)</p>
              </div>

              {/* Initial Deposit Amount */}
              <div>
                <Label htmlFor="nominalSetoran" className="text-gray-700">Nominal Setoran Awal</Label>
                <Input
                  id="nominalSetoran"
                  type="number"
                  required
                  placeholder="Masukkan nominal setoran awal"
                  value={formData.nominalSetoran}
                  onChange={(e) => setFormData({ ...formData, nominalSetoran: e.target.value })}
                  onBlur={(e) => {
                    const val = e.target.value;
                    const err = validateMinimumDeposit('SimPel', val);
                    if (err) {
                      setErrors(prev => ({ ...prev, nominalSetoran: err }));
                    } else {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.nominalSetoran;
                        return next;
                      });
                    }
                  }}
                  className={`mt-2 h-12 rounded-md ${errors.nominalSetoran ? 'border-red-500' : ''}`}
                />
                {errors.nominalSetoran && <p className="text-sm text-red-600 mt-1">{errors.nominalSetoran}</p>}
                <p className="text-xs text-gray-500 mt-1">Minimal setoran awal untuk rekening SimPel adalah Rp 5.000</p>
              </div>

              {/* ATM Preference */}
              {/* <div>
                <Label className="text-gray-700">Preferensi Kartu ATM</Label>
                <Select
                  value={formData.atmPreference}
                  onValueChange={(value) => setFormData({ ...formData, atmPreference: value })}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-md">
                    <SelectValue placeholder="Pilih preferensi kartu ATM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tidak">Tidak Perlu Kartu ATM</SelectItem>
                    <SelectItem value="ya">Ya, Saya Ingin Kartu ATM</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Kartu ATM dapat digunakan untuk transaksi di seluruh jaringan ATM Bank Sleman</p>
              </div> */}

              {/* Account Purpose - Already exists, just add conditional "other" input */}
              <div>
                <Label htmlFor="tujuanRekening" className="text-gray-700">Tujuan Pembukaan Rekening</Label>
                <Select
                  value={formData.tujuanRekening}
                  onValueChange={(value) => setFormData({ ...formData, tujuanRekening: value })}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-md">
                    <SelectValue placeholder="Pilih tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Menabung">Menabung</SelectItem>
                    <SelectItem value="Transaksi">Transaksi</SelectItem>
                    <SelectItem value="Investasi">Investasi</SelectItem>
                    <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Conditional "other" purpose text input */}
                {formData.tujuanRekening === 'Lainnya' && (
                  <Input
                    id="tujuanRekeningLainnya"
                    placeholder="Sebutkan tujuan pembukaan rekening"
                    value={formData.tujuanRekeningLainnya || ''}
                    onChange={(e) => setFormData({ ...formData, tujuanRekeningLainnya: e.target.value })}
                    className="mt-3 h-12 rounded-md"
                  />
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Kepemilikan Rekening */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
              Kepemilikan Rekening
            </h4>
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <Label className="text-gray-800 font-semibold mb-4 block text-lg">Apakah rekening ini untuk Anda sendiri?</Label>
              <div className="flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="rekeningUntukSendiri" 
                    value="true" 
                    checked={formData.rekeningUntukSendiri === true} 
                    onChange={() => setFormData({ ...formData, rekeningUntukSendiri: true })} 
                    className="hidden" 
                  />
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.rekeningUntukSendiri === true ? "border-blue-500" : "border-gray-300"}`}>
                    {formData.rekeningUntukSendiri === true && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </span>
                  <span className="text-sm text-gray-700">Ya, untuk saya sendiri</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="rekeningUntukSendiri" 
                    value="false" 
                    checked={formData.rekeningUntukSendiri === false} 
                    onChange={() => setFormData({ ...formData, rekeningUntukSendiri: false })} 
                    className="hidden" 
                  />
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.rekeningUntukSendiri === false ? "border-blue-500" : "border-gray-300"}`}>
                    {formData.rekeningUntukSendiri === false && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </span>
                  <span className="text-sm text-gray-700">Tidak, untuk orang lain</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Informasi Beneficial Owner (pemilik manfaat sebenarnya) diperlukan jika rekening ini untuk orang lain.
              </p>
            </div>
          </div>

          {/* Section 3: Beneficial Owner (Conditional) */}
          {formData.rekeningUntukSendiri === false && (
          <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-xl">Informasi Beneficial Owner</h4>
                <p className="text-sm text-amber-800 mt-1">Wajib diisi karena rekening untuk orang lain</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6 bg-white p-4 rounded-lg">
              Beneficial Owner adalah pemilik sebenarnya atau penerima manfaat dari rekening yang dibuka. 
              Karena rekening ini untuk orang lain, mohon lengkapi informasi pemilik manfaat yang sebenarnya.
            </p>
            <div className="space-y-5">
              
              {/* BO Name */}
              <div>
                <Label htmlFor="boNama" className="text-gray-700">Nama Lengkap Beneficial Owner</Label>
                <Input
                  id="boNama"
                  required
                  placeholder="Nama lengkap sesuai identitas"
                  value={formData.boNama}
                  onChange={(e) => setFormData({ ...formData, boNama: e.target.value })}
                  className={`mt-2 h-12 rounded-md ${errors.boNama ? 'border-red-500' : ''}`}
                />
                {errors.boNama && <p className="text-sm text-red-600 mt-1">{errors.boNama}</p>}
              </div>

              {/* BO Address */}
              <div>
                <Label htmlFor="boAlamat" className="text-gray-700">Alamat Lengkap</Label>
                <Textarea
                  id="boAlamat"
                  required
                  rows={2}
                  placeholder="Alamat lengkap beneficial owner"
                  value={formData.boAlamat}
                  onChange={(e) => setFormData({ ...formData, boAlamat: e.target.value })}
                  className={`mt-2 ${errors.boAlamat ? 'border-red-500' : ''}`}
                />
                {errors.boAlamat && <p className="text-sm text-red-600 mt-1">{errors.boAlamat}</p>}
              </div>

              {/* BO Place and Date of Birth */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="boTempatLahir" className="text-gray-700">Tempat Lahir</Label>
                  <Input
                    id="boTempatLahir"
                    required
                    placeholder="Kota kelahiran"
                    value={formData.boTempatLahir}
                    onChange={(e) => setFormData({ ...formData, boTempatLahir: e.target.value })}
                    className={`mt-2 h-12 rounded-md ${errors.boTempatLahir ? 'border-red-500' : ''}`}
                  />
                  {errors.boTempatLahir && <p className="text-sm text-red-600 mt-1">{errors.boTempatLahir}</p>}
                </div>
                <div>
                  <Label htmlFor="boTanggalLahir" className="text-gray-700">Tanggal Lahir</Label>
                  <Input
                    id="boTanggalLahir"
                    type="date"
                    required
                    value={formData.boTanggalLahir}
                    onChange={(e) => setFormData({ ...formData, boTanggalLahir: e.target.value })}
                    className={`mt-2 h-12 rounded-md ${errors.boTanggalLahir ? 'border-red-500' : ''}`}
                  />
                  {errors.boTanggalLahir && <p className="text-sm text-red-600 mt-1">{errors.boTanggalLahir}</p>}
                </div>
              </div>

              {/* BO Identity Type & Number */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Jenis Identitas</Label>
                  <Select
                    value={formData.boJenisId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, boJenisId: value });
                      // Clear boNomorId error when identity type changes
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.boNomorId;
                        return next;
                      });
                    }}
                  >
                    <SelectTrigger className={`mt-2 h-12 rounded-md ${errors.boJenisId ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Pilih jenis identitas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KTP">KTP</SelectItem>
                      <SelectItem value="Paspor">Paspor</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.boJenisId && <p className="text-sm text-red-600 mt-1">{errors.boJenisId}</p>}
                </div>
                <div>
                  <Label htmlFor="boNomorId" className="text-gray-700">Nomor Identitas</Label>
                  <Input
                    id="boNomorId"
                    required
                    placeholder={formData.boJenisId === 'KTP' ? '16 digit' : 'Nomor identitas'}
                    value={formData.boNomorId}
                    onChange={(e) => setFormData({ ...formData, boNomorId: e.target.value })}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const err = validateIdentityNumber(formData.boJenisId, val);
                      if (err) {
                        setErrors(prev => ({ ...prev, boNomorId: err }));
                      } else {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.boNomorId;
                          return next;
                        });
                      }
                    }}
                    className={`mt-2 h-12 rounded-md ${errors.boNomorId ? 'border-red-500' : ''}`}
                  />
                  {errors.boNomorId && <p className="text-sm text-red-600 mt-1">{errors.boNomorId}</p>}
                </div>
              </div>

              {/* BO Occupation */}
              <div>
                <Label htmlFor="boPekerjaan" className="text-gray-700">Pekerjaan</Label>
                <Input
                  id="boPekerjaan"
                  required
                  placeholder="Pekerjaan beneficial owner"
                  value={formData.boPekerjaan}
                  onChange={(e) => setFormData({ ...formData, boPekerjaan: e.target.value })}
                  className={`mt-2 h-12 rounded-md ${errors.boPekerjaan ? 'border-red-500' : ''}`}
                />
                {errors.boPekerjaan && <p className="text-sm text-red-600 mt-1">{errors.boPekerjaan}</p>}
              </div>

              {/* BO Annual Income */}
              <div>
                <Label className="text-gray-700">Pendapatan per Tahun</Label>
                <Select
                  value={formData.boPendapatanTahun}
                  onValueChange={(value) => setFormData({ ...formData, boPendapatanTahun: value })}
                >
                  <SelectTrigger className={`mt-2 h-12 rounded-md ${errors.boPendapatanTahun ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Pilih range pendapatan tahunan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sd-5jt">Sampai dengan 5 Juta</SelectItem>
                    <SelectItem value="5-10jt">5 - 10 Juta</SelectItem>
                    <SelectItem value="10-25jt">10 - 25 Juta</SelectItem>
                    <SelectItem value="25-100jt">25 - 100 Juta</SelectItem>
                    <SelectItem value=">100jt">Lebih dari 100 Juta</SelectItem>
                  </SelectContent>
                </Select>
                {errors.boPendapatanTahun && <p className="text-sm text-red-600 mt-1">{errors.boPendapatanTahun}</p>}
              </div>

              {/* BO Approval Checkbox */}
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id="boPersetujuan"
                    checked={formData.boPersetujuan}
                    onCheckedChange={(checked) => setFormData({ ...formData, boPersetujuan: checked as boolean })}
                    required
                    className={`mt-1 ${errors.boPersetujuan ? 'border-red-500' : ''}`}
                  />
                  <div>
                    <Label htmlFor="boPersetujuan" className="cursor-pointer text-gray-800 font-medium">
                      Persetujuan Beneficial Owner
                    </Label>
                    <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                      Saya menyatakan bahwa informasi beneficial owner yang saya berikan adalah benar dan akurat. 
                      Saya memahami bahwa informasi ini diperlukan untuk kepatuhan terhadap peraturan anti pencucian uang 
                      dan pendanaan terorisme.
                    </p>
                  </div>
                </div>
                {errors.boPersetujuan && <p className="text-sm text-red-600 mt-2">{errors.boPersetujuan}</p>}
              </div>

            </div>
          </div>
          )}


        </div>
      )}

      {/* ========================================
          STEP 5: REVIEW & PERSETUJUAN
          ======================================== */}
      {currentStep === 5 && (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Review & Persetujuan</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Periksa kembali data Anda sebelum mengirim permohonan pembukaan rekening.
            </p>
          </div>

          {/* Ringkasan Data */}
          <div className="space-y-4">
            
            {/* 1. Data Cabang */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>📍</span>
                  <span>Lokasi Cabang</span>
                </h4>
              </div>
              <div className="text-gray-700">
                <p className="font-medium">{branches.find((b: any) => b.id.toString() === formData.cabang_pengambilan)?.nama_cabang || formData.cabang_pengambilan}</p>
              </div>
            </div>

            {/* 2. Data Diri */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>👤</span>
                  <span>Data Diri Nasabah</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nama Lengkap</p>
                  <p className="font-medium text-gray-800">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIK / Identitas</p>
                  <p className="font-medium text-gray-800">{formData.nik}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tempat, Tanggal Lahir</p>
                  <p className="font-medium text-gray-800">{formData.tempatLahir}, {formData.birthDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis Kelamin</p>
                  <p className="font-medium text-gray-800">{formData.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{formData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nomor Telepon</p>
                  <p className="font-medium text-gray-800">{formData.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Alamat</p>
                  <p className="font-medium text-gray-800">{formData.address}, {formData.city}, {formData.province} {formData.postalCode}</p>
                </div>
              </div>
            </div>

            {/* 3. Data Pekerjaan & Keuangan */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>💼</span>
                  <span>Data Pekerjaan & Keuangan</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Pekerjaan</p>
                  <p className="font-medium text-gray-800">{formData.employmentStatus}</p>
                </div>
                <div>
                  <p className="text-gray-500">Penghasilan per Bulan</p>
                  <p className="font-medium text-gray-800">{formData.monthlyIncome}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sumber Dana</p>
                  <p className="font-medium text-gray-800">{formData.sumberDana}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rata-rata Transaksi</p>
                  <p className="font-medium text-gray-800">{formData.rataRataTransaksi}</p>
                </div>
              </div>
            </div>

            {/* 4. Data Rekening */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>💳</span>
                  <span>Data Rekening</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Jenis Rekening</p>
                  <p className="font-medium text-gray-800">SimPel</p>
                </div>
                <div>
                  <p className="text-gray-500">Setoran Awal</p>
                  <p className="font-medium text-gray-800">Rp {parseFloat(formData.nominalSetoran || '0').toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tujuan Pembukaan</p>
                  <p className="font-medium text-gray-800">{formData.tujuanRekening}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kepemilikan</p>
                  <p className="font-medium text-gray-800">{formData.rekeningUntukSendiri ? 'Untuk Sendiri' : 'Untuk Orang Lain'}</p>
                </div>
              </div>
              
              {/* Show BO if exists */}
              {formData.rekeningUntukSendiri === false && formData.boNama && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-gray-500 font-medium mb-2">Beneficial Owner</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nama</p>
                      <p className="font-medium text-gray-800">{formData.boNama}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nomor Identitas</p>
                      <p className="font-medium text-gray-800">{formData.boNomorId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pekerjaan</p>
                      <p className="font-medium text-gray-800">{formData.boPekerjaan}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pendapatan Tahunan</p>
                      <p className="font-medium text-gray-800">{formData.boPendapatanTahun}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Persetujuan */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-200 shadow-sm">
            <h4 className="font-bold text-emerald-900 text-xl mb-6">Persetujuan</h4>
            
            {/* Terms & Conditions */}
            <div className="flex items-start gap-4 mb-4">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                required
                className="mt-1"
              />
              <div>
                <Label htmlFor="terms" className="cursor-pointer text-gray-800 font-medium text-base">
                  Saya menyetujui <button type="button" onClick={() => setShowTermsModal(true)} className="text-emerald-700 hover:underline font-bold">Syarat dan Ketentuan</button>
                </Label>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Dengan mencentang kotak ini, saya menyatakan bahwa semua data yang saya berikan adalah benar dan saya bertanggung jawab penuh atas kebenaran data tersebut.
                </p>
              </div>
            </div>

            {/* BO Approval if exists */}
            {formData.rekeningUntukSendiri === false && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-amber-200">
                <Checkbox
                  id="boApproval"
                  checked={formData.boPersetujuan}
                  onCheckedChange={(checked) => setFormData({ ...formData, boPersetujuan: checked as boolean })}
                  required
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="boApproval" className="cursor-pointer text-gray-800 font-medium text-base">
                    Persetujuan Beneficial Owner
                  </Label>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                    Saya menyatakan bahwa informasi beneficial owner yang saya berikan adalah benar dan akurat.
                  </p>
                </div>
              </div>
            )}
          </div>

          <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
      )}
    </div>
  );
}
