import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, CheckCircle, Sparkles, ChevronRight, User, Building2, FileText, Check, CircleCheckBig, Loader2 } from 'lucide-react';
import OtpModal from './OtpModal';
import ScrollToTop from './ScrollToTop';
import FormSimpel from './account-forms/FormSimpel';
import type { AccountFormData } from './account-forms/types';
import { useNavigate, useBlocker } from 'react-router-dom';
// import FormTabunganku from './account-forms/FormTabunganKu';
import FormMutiara from './account-forms/FormMutiara';
import { API_BASE_URL } from '../config/api';

interface AccountFormProps {
  savingsType: string;
  onBack: () => void;
}

export default function AccountForm({ savingsType, onBack }: AccountFormProps) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [submitResponse, setSubmitResponse] = useState<any>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [ktpUrl, setKtpUrl] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentPhone, setCurrentPhone] = useState("");
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null); // simpan data sebelum OTP

  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // 1 (Cabang) + 5 (Form Steps)

  // Validation errors (simple server-backed uniqueness + basic client hints)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiBase = API_BASE_URL;

  // Removed async validation functions for NIK, email, and phone
  // Basic client-side validation only
  const validateNikBasic = (nik: string) => {
    if (!nik) return 'NIK wajib diisi';
    if (!/^\d{16}$/.test(nik)) return 'NIK harus 16 digit';
    return '';
  };

  const validateEmailBasic = (email: string) => {
    if (!email) return 'Email wajib diisi';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Format email tidak valid';
    return '';
  };

  const validatePhoneBasic = (phone: string) => {
    if (!phone) return 'Nomor telepon wajib diisi';
    if (!/^08\d{8,11}$/.test(phone)) return 'Nomor HP harus dimulai dengan 08 dan 10-13 digit';
    return '';
  };

  const getFieldClass = (name: string) => {
    return (errors[name] || rhfErrors[name as keyof AccountFormData])
      ? 'mt-2 border-red-500 focus:border-red-500 focus:ring-red-500 rounded'
      : 'mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded';
  };

  // Ensure page starts at the top when entering this screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // Initialize React Hook Form
  const methods = useForm<AccountFormData>({
    defaultValues: {
      fullName: '',
      nik: '',
      email: '',
      phone: '',
      birthDate: '',
      // New Fields
      tempatLahir: '',
      address: '',
      alamatJalan: '',
      alamatDomisili: '',
      province: '',
      city: '',
      kecamatan: '',
      kelurahan: '',
      postalCode: '',
      statusRumah: '',
      agama: '',
      pendidikan: '',
      npwp: '',

      monthlyIncome: '',
      cabang_pengambilan: '',
      cardType: '',
      agreeTerms: false,
      jenis_rekening: '',

      gender: '',
      maritalStatus: '',
      citizenship: '',
      motherName: '',

      // Identity fields (Requirements 2.1)
      alias: '',
      jenisId: '',
      nomorId: '',
      berlakuId: '',

      tempatBekerja: '',
      alamatKantor: '',
      jabatan: '',
      bidangUsaha: '',
      sumberDana: '',
      sumberDanaCustom: '',
      tujuanRekening: '',
      tujuanRekeningLainnya: '',

      // Employment and financial fields (Requirements 3.1)
      rataRataTransaksi: '',
      teleponKantor: '',


      // Account configuration fields (Requirements 4.1)
      nominalSetoran: '',
      atmPreference: '',

      // Account ownership
      rekeningUntukSendiri: true,

      // Beneficial Owner fields (Requirements 5.1)
      boNama: '',
      boAlamat: '',
      boTempatLahir: '',
      boTanggalLahir: '',
      boJenisKelamin: '',
      boKewarganegaraan: '',
      boStatusPernikahan: '',
      boJenisId: '',
      boNomorId: '',
      boSumberDana: '',
      boSumberDanaCustom: '',
      boHubungan: '',
      boHubunganCustom: '',
      boNomorHp: '',
      boPekerjaan: '',
      boPendapatanTahun: '',
      boPersetujuan: false,

      kontakDaruratNama: '',
      kontakDaruratHp: '',
      kontakDaruratAlamat: '',
      kontakDaruratHubungan: '',
      kontakDaruratHubunganLainnya: '',
      employmentStatus: '',

      // EDD Bank Lain
      eddBankLain: [],

      // EDD Pekerjaan Lain
      eddPekerjaanLain: [],

      // Customer Type
      tipeNasabah: 'baru',
      nomorRekeningLama: '',

      statusTempat: '',
    },
    mode: 'onBlur', // Validate on blur instead of onChange for better performance
  });

  const { control, handleSubmit: rhfHandleSubmit, setValue, getValues, formState: { errors: rhfErrors, isDirty }, reset } = methods;
  
  // Optimized setFormData wrapper
  const setFormData = React.useCallback((updater: any) => {
    const currentValues = getValues();
    const newValues = typeof updater === 'function' ? updater(currentValues) : updater;
    
    Object.keys(newValues).forEach((key) => {
      const fieldKey = key as keyof AccountFormData;
      if (newValues[fieldKey] !== currentValues[fieldKey]) {
        setValue(fieldKey, newValues[fieldKey] as any, { 
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false
        });
      }
    });
  }, [setValue, getValues]);
  
  // Exit/Refresh Warning Logic
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // isDirty from react-hook-form tracks if any field has been modified
      // We only show the warning if the user has touched the form and hasn't finished (step 6)
      if (isDirty && currentStep < 6) {
        e.preventDefault();
        e.returnValue = ''; // Standard requirement for modern browsers to show the confirmation
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, currentStep]);

  // Catch back button / internal navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentStep < 6 && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      const proceed = window.confirm("Apakah Anda yakin ingin keluar? Progres pengisian form akan hilang.");
      if (proceed) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);


  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/api/cabang`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBranches(data.data);
          // Set default if needed, or leave empty
        }
      })
      .catch(err => console.error("Failed to fetch branches", err));
  }, []);

  // RESTORE OTP PROCESS IF ANY 
  useEffect(() => {
    const otpActive = localStorage.getItem("otpInProgress") === "true";
    if (!otpActive) return;
  
    const savedData = localStorage.getItem("pendingSubmitData");
    const savedPhone = localStorage.getItem("currentPhone");
    const savedKtpUrl = localStorage.getItem("savedKtpUrl");

  
    if (savedData) {
      const parsed = JSON.parse(savedData);
      reset(parsed); // Use reset() instead of setFormData for bulk updates
      setPendingSubmitData(parsed);
    }
    if (savedPhone) {
      setCurrentPhone(savedPhone);
    }
    if (savedKtpUrl) setKtpUrl(savedKtpUrl);

  
    // Buka modal OTP
    setShowOtpModal(true);
  }, []);

  // Map default jenis_kartu: untuk Mutiara tidak ada default, harus dipilih
  const getDefaultCardType = () => {
    if (savingsType === 'mutiara') {
      return ''; // Mutiara harus pilih Gold/Silver/Platinum
    }
    return savingsType;
  };

  // Isi otomatis cardType saat savingsType berubah (kecuali untuk Mutiara)
  useEffect(() => {
    if (savingsType !== 'mutiara') {
      setValue('cardType', getDefaultCardType(), { shouldValidate: false });
    } else {
       // Reset logic for mutiara if accidentally switched
       setValue('cardType', '', { shouldValidate: false });
    }
  }, [savingsType, setValue]);

  const getSavingsTypeName = () => {
    switch (savingsType) {
      case 'mutiara':
        return 'Mutiara';
      case 'regular':
        return 'Reguler';
      case 'simpel':
        return 'SimPel';
      case 'arofah':
        return 'Arofah';
      case 'tamasya':
        return 'TamasyaPlus';
      case 'tabunganku':
        return 'TabunganKu';
      case 'pensiun':
        return 'Pensiun';
      default:
        return 'Undefinied';
    }
  };

  const handleNextStep = async () => {
    setLoadingNext(true);
    try {
        const newErrors: Record<string, string> = {};
        const currentData = getValues();
        
        if (currentStep === 1) {
           // Step 1: Validate Branch Selection
           if (!currentData.cabang_pengambilan) {
              newErrors.cabang_pengambilan = "Silakan pilih cabang pengambilan";
           } else {
              const selectedBranch = branches.find(b => b.id.toString() === currentData.cabang_pengambilan.toString());
              if (selectedBranch && !selectedBranch.is_active) {
                newErrors.cabang_pengambilan = "Cabang sedang dalam perbaikan, silahkan pilih cabang lain";
              }
           }
        } else if (currentStep === 2) {
           // Step 2: Validate Data Diri Nasabah
           if (!currentData.fullName) newErrors.fullName = "Nama lengkap wajib diisi";
           if (!currentData.nik) newErrors.nik = "NIK wajib diisi";
           if (!currentData.email) newErrors.email = "Email wajib diisi";
           if (!currentData.phone) newErrors.phone = "Nomor telepon wajib diisi";
           if (!currentData.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
           if (!currentData.tempatLahir) newErrors.tempatLahir = "Tempat lahir wajib diisi";
           if (!currentData.gender) newErrors.gender = "Jenis kelamin wajib diisi";
           if (!currentData.maritalStatus) newErrors.maritalStatus = "Status pernikahan wajib diisi";
           if (!currentData.agama) newErrors.agama = "Agama wajib diisi";
           if (!currentData.pendidikan) newErrors.pendidikan = "Pendidikan wajib diisi";
           if (!currentData.motherName) newErrors.motherName = "Nama ibu kandung wajib diisi";
           if (!currentData.citizenship) newErrors.citizenship = "Kewarganegaraan wajib diisi";
           if (!currentData.address) newErrors.address = "Alamat wajib diisi";
           if (!currentData.postalCode) newErrors.postalCode = "Kode pos wajib diisi";
           if (!currentData.statusRumah) newErrors.statusRumah = "Status tempat tinggal wajib diisi";
           
           // Address validation based on citizenship
           if (currentData.citizenship === 'Indonesia') {
             // For WNI, require Indonesian address fields
             if (!currentData.province) newErrors.province = "Provinsi wajib diisi";
             if (!currentData.city) newErrors.city = "Kota/Kabupaten wajib diisi";
           }
           // For WNA, only require address field (no additional validations)
           if (!currentData.jenisId) newErrors.jenisId = "Jenis identitas wajib diisi";
           if (currentData.jenisId === 'Lainnya' && !currentData.jenisIdCustom) {
              newErrors.jenisIdCustom = "Sebutkan jenis identitas Anda";
           }
           // Validity date validation - exclude KTP (lifetime validity)
           if (currentData.jenisId && currentData.jenisId !== 'KTP' && !currentData.berlakuId) {
              newErrors.berlakuId = "Masa berlaku identitas wajib diisi";
           }
           
           // Basic client-side validations only
           if (!newErrors.nik && (!currentData.jenisId || currentData.jenisId === 'KTP')) {
             const nikErr = validateNikBasic(currentData.nik);
             if (nikErr) newErrors.nik = nikErr;
           }
           if (!newErrors.email) {
             const emailErr = validateEmailBasic(currentData.email);
             if (emailErr) newErrors.email = emailErr;
           }
           if (!newErrors.phone) {
             const phoneErr = validatePhoneBasic(currentData.phone);
             if (phoneErr) newErrors.phone = phoneErr;
           }
        } else if (currentStep === 3) {
           // Step 3: Validate Data Pekerjaan & Keuangan
           if (!currentData.employmentStatus) newErrors.employmentStatus = "Status pekerjaan wajib diisi";
           if (!currentData.monthlyIncome) newErrors.monthlyIncome = "Penghasilan per bulan wajib diisi";
           if (!currentData.sumberDana) newErrors.sumberDana = "Sumber dana wajib diisi";
           if (currentData.sumberDana === 'Lainnya' && (!currentData.sumberDanaCustom || currentData.sumberDanaCustom.trim() === '')) {
             newErrors.sumberDanaCustom = "Sumber dana lainnya harus diisi";
           }
        } else if (currentStep === 4) {
           // Step 4: Validate Data Rekening
           if (!currentData.tujuanRekening) newErrors.tujuanRekening = "Tujuan rekening wajib diisi";
           if (currentData.tujuanRekening === 'Lainnya' && !currentData.tujuanRekeningLainnya) {
             newErrors.tujuanRekeningLainnya = "Sebutkan tujuan pembukaan rekening";
           }
           
           // Validate BO if account is for others
           if (currentData.rekeningUntukSendiri === false) {
             if (!currentData.boNama) newErrors.boNama = "Nama beneficial owner wajib diisi";
             if (!currentData.boAlamat) newErrors.boAlamat = "Alamat beneficial owner wajib diisi";
             if (!currentData.boTempatLahir) newErrors.boTempatLahir = "Tempat lahir beneficial owner wajib diisi";
             if (!currentData.boTanggalLahir) newErrors.boTanggalLahir = "Tanggal lahir beneficial owner wajib diisi";
             if (!currentData.boJenisKelamin) newErrors.boJenisKelamin = "Jenis kelamin beneficial owner wajib diisi";
             if (!currentData.boKewarganegaraan) newErrors.boKewarganegaraan = "Kewarganegaraan beneficial owner wajib diisi";
             if (!currentData.boStatusPernikahan) newErrors.boStatusPernikahan = "Status pernikahan beneficial owner wajib diisi";
             if (!currentData.boJenisId) newErrors.boJenisId = "Jenis identitas beneficial owner wajib diisi";
             if (!currentData.boNomorId) newErrors.boNomorId = "Nomor identitas beneficial owner wajib diisi";
             if (!currentData.boSumberDana) newErrors.boSumberDana = "Sumber dana beneficial owner wajib diisi";
             if (currentData.boSumberDana === 'Lainnya' && (!currentData.boSumberDanaCustom || currentData.boSumberDanaCustom.trim() === '')) {
               newErrors.boSumberDanaCustom = "Sumber dana lainnya harus diisi";
             }
             if (!currentData.boHubungan) newErrors.boHubungan = "Hubungan dengan beneficial owner wajib diisi";
             if (currentData.boHubungan === 'Lainnya' && (!currentData.boHubunganCustom || currentData.boHubunganCustom.trim() === '')) {
               newErrors.boHubunganCustom = "Hubungan lainnya harus diisi";
             }
             if (!currentData.boNomorHp) newErrors.boNomorHp = "Nomor HP beneficial owner wajib diisi";
             if (!currentData.boPekerjaan) newErrors.boPekerjaan = "Pekerjaan beneficial owner wajib diisi";
             if (!currentData.boPendapatanTahun) newErrors.boPendapatanTahun = "Pendapatan tahunan beneficial owner wajib diisi";
             if (!currentData.boPersetujuan) newErrors.boPersetujuan = "Persetujuan beneficial owner harus dicentang";
           }
        }
        // Step 5 (Review) doesn't need validation here, will be validated on submit
    
        // If there are validation errors, prevent navigation
        if (Object.keys(newErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...newErrors }));
          
          // Scroll to first error field
          const firstErrorKey = Object.keys(newErrors)[0];
          const element = document.getElementById(firstErrorKey);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus the element after scrolling
            setTimeout(() => {
              element.focus();
            }, 500);
          }
          
          // Show UI error notification instead of alert
          const errorCount = Object.keys(newErrors).length;
          const errorDiv = document.createElement('div');
          errorDiv.className = `
  fixed top-4 left-1/2 -translate-x-1/2
  w-[calc(100%-2rem)] max-w-md
  bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg
  z-50 flex items-center animate-content-enter
`;


          errorDiv.innerHTML = `
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>Terdapat field yang perlu diisi.</span>
            </div>
          `;
          document.body.appendChild(errorDiv);
          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.parentNode.removeChild(errorDiv);
            }
          }, 5000);
          return;
        }
    
        // Clear errors for current step and proceed
        setErrors({});
        
        // Show loading briefly for step transition
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
        setLoadingNext(false);
    }
  };

  const handlePrevStep = async () => {
    setLoadingPrev(true);
    
    // Show loading briefly for step transition
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
    
    setLoadingPrev(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    // Comprehensive Final Step Validation
    const newErrors: Record<string,string> = {};
    const currentData = getValues();
    
    // Personal Identity - Required Fields
    if (!currentData.fullName) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!currentData.nik) newErrors.nik = "NIK wajib diisi";
    if (!currentData.email) newErrors.email = "Email wajib diisi";
    if (!currentData.phone) newErrors.phone = "Nomor telepon wajib diisi";
    if (!currentData.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
    if (!currentData.tempatLahir) newErrors.tempatLahir = "Tempat lahir wajib diisi";
    if (!currentData.gender) newErrors.gender = "Jenis kelamin wajib diisi";
    if (!currentData.maritalStatus) newErrors.maritalStatus = "Status pernikahan wajib diisi";
    if (!currentData.agama) newErrors.agama = "Agama wajib diisi";
    if (!currentData.pendidikan) newErrors.pendidikan = "Pendidikan wajib diisi";
    if (!currentData.motherName) newErrors.motherName = "Nama ibu kandung wajib diisi";
    if (!currentData.citizenship) newErrors.citizenship = "Kewarganegaraan wajib diisi";
    
    // Identity Validity - Required for non-KTP
    if (!currentData.jenisId) newErrors.jenisId = "Jenis identitas wajib diisi";
    if (currentData.jenisId === 'Lainnya' && !currentData.jenisIdCustom) {
      newErrors.jenisIdCustom = "Sebutkan jenis identitas Anda";
    }
    if (currentData.jenisId && currentData.jenisId !== 'KTP' && !currentData.berlakuId) {
      newErrors.berlakuId = "Masa berlaku identitas wajib diisi";
    }
    
    // Address - Required Fields
    if (!currentData.address) newErrors.address = "Alamat wajib diisi";
    if (!currentData.postalCode) newErrors.postalCode = "Kode pos wajib diisi";
    if (!currentData.statusRumah) newErrors.statusRumah = "Status tempat tinggal wajib diisi";
    
    // Address validation based on citizenship
    if (currentData.citizenship === 'Indonesia') {
      // For WNI, require Indonesian address fields
      if (!currentData.province) newErrors.province = "Provinsi wajib diisi";
      if (!currentData.city) newErrors.city = "Kota/Kabupaten wajib diisi";
    }
    // For WNA, only require address field (no additional validations)
    
    // Employment - Required Fields
    if (!currentData.employmentStatus) newErrors.employmentStatus = "Status pekerjaan wajib diisi";
    if (!currentData.monthlyIncome) newErrors.monthlyIncome = "Penghasilan per bulan wajib diisi";
    if (!currentData.sumberDana) newErrors.sumberDana = "Sumber dana wajib diisi";
    if (currentData.sumberDana === 'Lainnya' && (!currentData.sumberDanaCustom || currentData.sumberDanaCustom.trim() === '')) {
      newErrors.sumberDanaCustom = "Sumber dana lainnya harus diisi";
    }
    
    // Account Configuration - Required Fields
    if (!currentData.tujuanRekening) newErrors.tujuanRekening = "Tujuan rekening wajib diisi";
    if (currentData.tujuanRekening === 'Lainnya' && !currentData.tujuanRekeningLainnya) {
      newErrors.tujuanRekeningLainnya = "Sebutkan tujuan pembukaan rekening";
    }
    
    // Card Type validation for Mutiara
    if (savingsType === 'mutiara' && !currentData.cardType) {
      newErrors.cardType = "Jenis kartu wajib dipilih untuk rekening Mutiara";
    }
    
    // Emergency Contact - Optional but all-or-nothing
    const hasEmergencyContact = currentData.kontakDaruratNama || currentData.kontakDaruratHp || currentData.kontakDaruratHubungan;
    if (hasEmergencyContact) {
      if (!currentData.kontakDaruratNama) newErrors.kontakDaruratNama = "Nama kontak darurat harus diisi jika mengisi kontak darurat";
      if (!currentData.kontakDaruratHp) newErrors.kontakDaruratHp = "Nomor HP kontak darurat harus diisi jika mengisi kontak darurat";
      if (!currentData.kontakDaruratHubungan) newErrors.kontakDaruratHubungan = "Hubungan kontak darurat harus diisi jika mengisi kontak darurat";
      if (currentData.kontakDaruratHubungan === 'Lainnya' && (!currentData.kontakDaruratHubunganLainnya || currentData.kontakDaruratHubunganLainnya.trim() === '')) {
        newErrors.kontakDaruratHubunganLainnya = "Hubungan lainnya harus diisi";
      }
    }
    
    // Customer Type Validation
    if (currentData.tipeNasabah === 'lama' && !currentData.nomorRekeningLama) {
      newErrors.nomorRekeningLama = "Nomor rekening lama harus diisi untuk nasabah lama";
    }
 
    // Terms and Conditions
    if (!currentData.agreeTerms) newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";
 
    // Beneficial Owner Approval
    if (!currentData.rekeningUntukSendiri && !currentData.boPersetujuan) {
      newErrors.boPersetujuan = "Persetujuan Beneficial Owner wajib dicentang";
    }
 
    // Basic client-side validations only (no async duplicate checks)
    if (!newErrors.nik && (!currentData.jenisId || currentData.jenisId === 'KTP')) {
      const nikErr = validateNikBasic(currentData.nik);
      if (nikErr) newErrors.nik = nikErr;
    }
    if (!newErrors.email) {
      const emailErr = validateEmailBasic(currentData.email);
      if (emailErr) newErrors.email = emailErr;
    }
    if (!newErrors.phone) {
      const phoneErr = validatePhoneBasic(currentData.phone);
      if (phoneErr) newErrors.phone = phoneErr;
    }

    // If validation errors exist, prevent submission and display all errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      setLoadingSubmit(false);
      
      // Scroll to first error field
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focus the element after scrolling
        setTimeout(() => {
          element.focus();
        }, 500);
      }
      
      // Show UI error notification instead of alert
      const errorCount = Object.keys(newErrors).length;
      const errorDiv = document.createElement('div');
      errorDiv.className = `
  fixed top-4 left-1/2 -translate-x-1/2
  w-[calc(100%-2rem)] max-w-md
  bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg
  z-50 flex items-center animate-content-enter
`;
      errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <span>Mohon lengkapi data yang masih kurang (${errorCount} kolom)</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
      return;
    }

    // ============================
    // UPLOAD FILES FIRST
    // ============================
    let currentKtpUrl = ktpUrl;


    try {
        if (ktpFile && !currentKtpUrl) {
            const formDataKtp = new FormData();
            formDataKtp.append("gambar", ktpFile);
            const resKtp = await fetch(`${apiBase}/upload`, {
                method: "POST",
                body: formDataKtp,
                credentials: "include",
            });
            if (!resKtp.ok) throw new Error("Gagal upload KTP");
            const dataKtp = await resKtp.json();
            currentKtpUrl = dataKtp.url;
            setKtpUrl(currentKtpUrl);
        }


    } catch (err) {
        alert("Gagal mengupload dokumen. Silakan coba lagi.");
        setLoadingSubmit(false);
        return;
    }

    try {
      const currentValues = getValues();
      const res = await fetch(`${apiBase}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: currentValues.phone }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setLoadingSubmit(false);
        return;
      }

      // Simpan state proses OTP
      localStorage.setItem("otpInProgress", "true");
      localStorage.setItem("pendingSubmitData", JSON.stringify(currentValues));
      localStorage.setItem("currentPhone", currentValues.phone);
      if (currentKtpUrl) localStorage.setItem("savedKtpUrl", currentKtpUrl);


      // Simpan data form sementara
      setPendingSubmitData(currentValues);
      setCurrentPhone(currentValues.phone);
      
      // Tampilkan modal OTP
      setShowOtpModal(true);

    } catch {
      alert("Gagal mengirim OTP");
    }

    setLoadingSubmit(false);
  };

  const handleOtpVerified = async () => {
    // Hapus state OTP
    localStorage.removeItem("otpInProgress");
    localStorage.removeItem("pendingSubmitData");
    localStorage.removeItem("currentPhone");
    localStorage.removeItem("savedKtpUrl");

  
    setShowOtpModal(false);
    await submitFinalForm(pendingSubmitData);
  };

  // ==============================
  // FINAL FORM SUBMIT (SETELAH OTP)
  // ==============================
  const submitFinalForm = async (data: any) => {
    setLoadingSubmit(true);
  
    // ============================
    // 1. Upload KTP
    // ============================
    // let ktpUploadedUrl = ktpUrl;
    // if (ktpFile && !ktpUploadedUrl) {
    //   try {
    //     const formDataKtp = new FormData();
    //     formDataKtp.append("gambar", ktpFile);
  
    //     const resKtp = await fetch(
    //       `${apiBase}/upload`,
    //       {
    //         method: "POST",
    //         body: formDataKtp,
    //         credentials: "include",
    //       }
    //     );
  
    //     if (!resKtp.ok) throw new Error("Gagal upload KTP");
  
    //     const dataKtp = await resKtp.json();
    //     ktpUploadedUrl = dataKtp.url;
    //     setKtpUrl(ktpUploadedUrl);
    //   } catch (err) {
    //     alert("Upload KTP gagal, coba lagi!");
    //     setLoadingSubmit(false);
    //     return;
    //   }
    // }

    // ============================
    // 3. Siapkan data submit
    // ============================
    const submitData = {
      // cdd_self fields - Personal Identity
      nama: data.fullName,
      nama_lengkap: data.fullName,
      nik: data.nik,
      no_id: data.nomorId || data.nik, // Use nomorId if provided, fallback to nik
      alias: data.alias,
      jenis_id: data.jenisId === 'Lainnya' ? data.jenisIdCustom : data.jenisId,
      jenisIdCustom: data.jenisIdCustom, // Send custom identity type separately
      berlaku_id: data.berlakuId, // Empty will become NULL in backend, displayed as "seumur hidup" in dashboard
      email: data.email,
      no_hp: data.phone,
      tanggal_lahir: data.birthDate,
      tempat_lahir: data.tempatLahir,
      
      alamat_id: data.address,
      alamat: data.address,
      alamat_jalan: data.alamatJalan,
      alamat_now: data.alamatDomisili || data.address,
      kode_pos_id: data.postalCode,
      
      provinsi: data.province,
      kota: data.city,
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      kode_pos: data.postalCode,
      
      jenis_kelamin: data.gender,
      status_kawin: data.maritalStatus,
      status_perkawinan: data.maritalStatus,
      
      kewarganegaraan: data.citizenship,
      nama_ibu_kandung: data.motherName,
      status_rumah: data.statusRumah,
      agama: data.agama,
      pendidikan: data.pendidikan,
      npwp: data.npwp,

      // Customer Type
      tipe_nasabah: data.tipeNasabah,
      nomor_rekening_lama: data.nomorRekeningLama,

      // cdd_job fields - Employment and Financial
      pekerjaan: data.employmentStatus,
      penghasilan: data.monthlyIncome,
      gaji_per_bulan: data.monthlyIncome,
      nama_perusahaan: data.tempatBekerja,
      tempat_bekerja: data.tempatBekerja,
      alamat_perusahaan: data.alamatKantor,
      alamat_kantor: data.alamatKantor,
      telepon_perusahaan: data.teleponKantor,
      jabatan: data.jabatan,
      bidang_usaha: data.bidangUsaha || 'tidak bekerja',
      sumber_dana: data.sumberDana === 'Lainnya' ? data.sumberDanaCustom : data.sumberDana,
      sumber_dana_custom: data.sumberDanaCustom,
      rata_rata_transaksi: data.rataRataTransaksi,
      


      // Account configuration fields
      // Account configuration fields
      jenis_rekening: data.jenis_rekening || (savingsType?.toLowerCase().trim() === 'simpel' ? 'SimPel' : getSavingsTypeName()),
      tabungan_tipe: data.jenis_rekening || (savingsType?.toLowerCase().trim() === 'simpel' ? 'SimPel' : getSavingsTypeName()),
      tujuan_rekening: data.tujuanRekening,
      tujuan_pembukaan: data.tujuanRekening,
      tujuan_rekening_lainnya: data.tujuanRekeningLainnya,
      nominal_setoran: data.nominalSetoran,
      jenis_kartu: savingsType?.toLowerCase().trim() === 'simpel' ? undefined : (data.cardType || data.atmPreference || getDefaultCardType()),
      card_type: savingsType?.toLowerCase().trim() === 'simpel' ? undefined : (data.cardType || data.atmPreference || getDefaultCardType()),
      
      // cdd_reference - Emergency contact
      kontak_darurat_nama: data.kontakDaruratNama,
      kontak_darurat_hp: data.kontakDaruratHp,
      kontak_darurat_alamat: data.kontakDaruratAlamat,
      kontak_darurat_hubungan: data.kontakDaruratHubungan === 'Lainnya' ? data.kontakDaruratHubunganLainnya : data.kontakDaruratHubungan,
      kontak_darurat_hubungan_custom: data.kontakDaruratHubunganLainnya,

      // Account ownership
      rekening_untuk_sendiri: data.rekeningUntukSendiri,

      // Beneficial Owner fields (only sent if account is for others, NOT for self)
      bo_nama: data.rekeningUntukSendiri === false ? data.boNama : undefined,
      bo_alamat: data.rekeningUntukSendiri === false ? data.boAlamat : undefined,
      bo_tempat_lahir: data.rekeningUntukSendiri === false ? data.boTempatLahir : undefined,
      bo_tanggal_lahir: data.rekeningUntukSendiri === false ? data.boTanggalLahir : undefined,
      bo_jenis_kelamin: data.rekeningUntukSendiri === false ? data.boJenisKelamin : undefined,
      bo_kewarganegaraan: data.rekeningUntukSendiri === false ? data.boKewarganegaraan : undefined,
      bo_status_pernikahan: data.rekeningUntukSendiri === false ? data.boStatusPernikahan : undefined,
      bo_jenis_id: data.rekeningUntukSendiri === false ? data.boJenisId : undefined,
      bo_nomor_id: data.rekeningUntukSendiri === false ? data.boNomorId : undefined,
      bo_sumber_dana: data.rekeningUntukSendiri === false ? (data.boSumberDana === 'Lainnya' ? data.boSumberDanaCustom : data.boSumberDana) : undefined,
      bo_sumber_dana_custom: data.rekeningUntukSendiri === false ? data.boSumberDanaCustom : undefined,
      bo_hubungan: data.rekeningUntukSendiri === false ? (data.boHubungan === 'Lainnya' ? data.boHubunganCustom : data.boHubungan) : undefined,
      bo_hubungan_custom: data.rekeningUntukSendiri === false ? data.boHubunganCustom : undefined,
      bo_nomor_hp: data.rekeningUntukSendiri === false ? data.boNomorHp : undefined,
      bo_pekerjaan: data.rekeningUntukSendiri === false ? data.boPekerjaan : undefined,
      bo_pendapatan_tahun: data.rekeningUntukSendiri === false ? data.boPendapatanTahun : undefined,
      bo_persetujuan: data.rekeningUntukSendiri === false ? data.boPersetujuan : undefined,

      // EDD Bank Lain (array of objects)
      edd_bank_lain: data.eddBankLain && data.eddBankLain.length > 0 ? data.eddBankLain : undefined,

      // EDD Pekerjaan Lain (array of objects)
      edd_pekerjaan_lain: data.eddPekerjaanLain && data.eddPekerjaanLain.length > 0 ? data.eddPekerjaanLain : undefined,

      // System fields
      setuju_data: data.agreeTerms ? "Ya" : "Tidak",
      savings_type: savingsType,
      savings_type_name: getSavingsTypeName(),
      cabang_pengambilan: data.cabang_pengambilan, 
      cabang_id: data.cabang_pengambilan,

    };
  


    // ============================
    // 4. Submit ke backend
    // ============================
    try {
      const response = await fetch(
        `${apiBase}/api/pengajuan`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
          credentials: "include",
        }
      );
  
      let result;
      try {
        result = await response.json();
      } catch {
        alert(
          `⚠️ Gagal menyimpan data:\nServer mengembalikan response tidak valid.`
        );
        setLoadingSubmit(false);
        return;
      }
  
      if (response.ok && result.success) {
        setReferenceCode(result.kode_referensi ?? null);
        setSubmitResponse(result);
        setSubmitted(true);
        setCurrentStep(6); // Move to success step (step 6)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const errorMessage =
          result.message ||
          result.error?.detail ||
          `HTTP ${response.status}: ${response.statusText}`;
        alert(`⚠️ Gagal menyimpan data:\n\n${errorMessage}`);
      }
    } catch (err: any) {
      alert(`❌ Terjadi kesalahan:\n\n${err.message}`);
    }
  
    setLoadingSubmit(false);
  };

  const renderSuccess = () => {
    // Get selected branch name
    const currentFormData = getValues();
    const selectedBranch = branches.find(b => b.id.toString() === currentFormData.cabang_pengambilan);
    const branchName = selectedBranch?.nama_cabang || submitResponse?.data?.nama_cabang || 'cabang yang dipilih';
    
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-3xl mb-8 shadow-lg">
          <CheckCircle className="h-14 w-14 text-emerald-700" />
        </div>
        <h1 className="text-emerald-900 mb-6 text-4xl">
          Pendaftaran Berhasil!
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Terima kasih telah mendaftar {getSavingsTypeName()}. Kami akan memproses aplikasi Anda dalam 1-2 hari kerja.
        </p>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-8 mb-8 text-left shadow-inner">
          <h3 className="text-emerald-900 mb-5 text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Langkah Selanjutnya:
          </h3>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Kami akan mengirimkan pesan konfirmasi melalui whatsapp</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Tim verifikasi akan memeriksa dokumen Anda</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Setelah disetujui mohon datang pada <strong>{branchName}</strong></span>
            </li>
          </ul>
        </div>
        <div className="space-y-3 bg-white p-6 rounded-2xl shadow-md mb-8">
          <p className="text-sm text-gray-600">
            Nomor Referensi:
          </p>
          <p className="text-2xl font-mono text-emerald-700">
            {referenceCode ?? `BKU-2025-${Math.floor(Math.random() * 100000)}`}
          </p>
          <p className="text-sm text-gray-600">
            Simpan nomor ini untuk keperluan tracking pengajuan anda
          </p>
          <div className="mt-4">
            <Button 
              onClick={() => navigate(`/status/${referenceCode}`)}
              variant="outline"
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 px-4 py-2 text-sm"
            >
              Cek Status Pengajuan
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-emerald-500/30 transition-all"
        >
          Kembali ke Beranda
        </Button>
      </div>
    );
  };

  const renderForm = () => {
    // NOTE: Child components will now use useFormContext to access values/control
    // We pass minimal props to avoid re-renders
    const commonProps: any = {
      setFormData,
      errors,
      setErrors,
      getFieldClass,
      ktpFile,
      setKtpFile,
      ktpPreview,
      setKtpPreview,
      ktpUrl,
      setKtpUrl,

      loadingSubmit,
      handleSubmit,
      savingsType,
      getSavingsTypeName,
      branches,
      currentStep,
      control, // Passing control for direct use in child components
    };

    if (savingsType === 'simpel') {
      return <FormSimpel {...commonProps} />;
    }else if (savingsType === 'mutiara') {
      return <FormMutiara {...commonProps} />;
    // }else if (savingsType === 'tabunganku') {
    //   return <FormTabunganku {...commonProps} />;
    } 
    else {
      // Default for individu, mutiara, promosi
      return <FormMutiara {...commonProps} />;
    }
  };

  const steps = [
  { number: 1, title: "Pilih Cabang", icon: Building2 },
  { number: 2, title: "Data Diri", icon: User },
  { number: 3, title: "Pekerjaan", icon: FileText },
  { number: 4, title: "Rekening", icon: FileText },
  { number: 5, title: "Review", icon: Check },
  { number: 6, title: "Selesai", icon: CircleCheckBig },
];


  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-slate-50 font-sans animate-page-enter">
        {/* Header content ... truncated for brevity but stays exactly the same ... */}
        {/* ... */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/banksleman.png" 
                  alt="Bank Sleman Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <div className="text-sm font-medium text-slate-600 hidden md:block">
                Pembukaan Rekening Online
              </div>
            </div>
          </div>
        </header>

        {/* Stepper */}
        <div className="bg-white border-b border-slate-200 py-6">
          <div className="max-w-3xl mx-auto px-6">
            
            {/* Mobile Stepper (< md) */}
            <div className="md:hidden">
              <div className="flex items-center justify-center gap-4 relative">
                {steps.filter(step => step.number >= currentStep - 1 && step.number <= currentStep + 1).map((step, index, array) => {
                  const Icon = step.icon;
                  const isActive = step.number === currentStep;
                  const isCompleted = step.number < currentStep;

                  return (
                    <div key={step.number} className="flex flex-col items-center gap-2 bg-white px-2 z-10">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110" 
                            : isCompleted 
                              ? "bg-green-100 text-green-600" 
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <span className={`text-xs font-bold whitespace-nowrap ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {steps.map(s => (
                  <div key={s.number} className={`h-1.5 rounded-full transition-all ${s.number === currentStep ? 'w-6 bg-green-500' : s.number < currentStep ? 'w-1.5 bg-green-300' : 'w-1.5 bg-slate-200'}`} />
                ))}
              </div>
            </div>

            {/* Desktop Stepper (>= md) */}
            <div className="hidden md:flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-10"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              />
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.number === currentStep;
                const isCompleted = step.number < currentStep;
                return (
                  <div key={step.number} className="flex flex-col items-center gap-2 bg-white px-2">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-110" 
                          : isCompleted 
                            ? "bg-green-100 text-green-600" 
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-bold ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <section className="py-6 sm:py-10 bg-slate-50 min-h-screen">
  <div className="max-w-3xl mx-auto px-4">
    {/* Header - Lebih Deskriptif & Formal */}
  <div className="mb-2 text-center">
  {/* <span className="inline-block text-xs px-3 py-1 rounded-full text-slate-600 mb-3">
    Langkah {currentStep} dari {totalSteps}
  </span> */}
  {/* <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
    {steps[currentStep - 1].title}
  </h2> */}
</div>

    {/* Form Content */}
    <div className="w-full">
      {currentStep === 6 ? renderSuccess() : renderForm()}

      {/* Navigasi Simetris */}
      {currentStep < 6 && (
        <div className="mt-10 flex flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || loadingPrev}
            className="flex-1 h-12 rounded-lg border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            {loadingPrev ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </>
            )}
          </Button>

          <div className="flex-1">
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loadingNext}
                className="w-full bg-green-700 hover:bg-green-800 text-white h-12 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {loadingNext ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Lanjutkan</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loadingSubmit}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 rounded-lg font-bold shadow-sm transition-all flex items-center justify-center"
              >
                {loadingSubmit ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Kirim Permohonan'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>

    <OtpModal
      open={showOtpModal}
      onClose={() => setShowOtpModal(false)}
      phone={currentPhone}
      onVerified={handleOtpVerified}
    />
  </div>
</section>
        <ScrollToTop />
      </div>
    </FormProvider>
  );
}
