import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, CheckCircle, Sparkles, ChevronRight, User, Building2, FileText, Check, CircleCheckBig, Loader2 } from 'lucide-react';
import OtpModal from './OtpModal';
import ScrollToTop from './ScrollToTop';
import FormSimpel from './account-forms/FormSimpel';
import FormBusiness from './account-forms/FormReguler';
import type { AccountFormData } from './account-forms/types';
import { useNavigate } from 'react-router-dom';
import FormArofah from './account-forms/FormArofah';
import FormTamasya from './account-forms/FormTamasyaPlus';
import FormTabunganku from './account-forms/FormTabunganKu';
import FormPensiun from './account-forms/FormPensiun';
import FormReguler from './account-forms/FormReguler';
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
    return errors[name]
      ? 'mt-2 border-red-500 focus:border-red-500 focus:ring-red-500 rounded'
      : 'mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded';
  };

  // Ensure page starts at the top when entering this screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [formData, setFormData] = useState<AccountFormData>({
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
});


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
      setFormData(parsed);
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
      setFormData((prev) => ({ ...prev, cardType: getDefaultCardType() }));
    } else {
       // Reset logic for mutiara if accidentally switched
       setFormData((prev) => ({ ...prev, cardType: '' })); 
    }
  }, [savingsType]);

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
        
        if (currentStep === 1) {
           // Step 1: Validate Branch Selection
           if (!formData.cabang_pengambilan) {
              newErrors.cabang_pengambilan = "Silakan pilih cabang pengambilan";
           } else {
              const selectedBranch = branches.find(b => b.id.toString() === formData.cabang_pengambilan.toString());
              if (selectedBranch && !selectedBranch.is_active) {
                newErrors.cabang_pengambilan = "Cabang sedang dalam perbaikan, silahkan pilih cabang lain";
              }
           }
        } else if (currentStep === 2) {
           // Step 2: Validate Data Diri Nasabah
           if (!formData.fullName) newErrors.fullName = "Nama lengkap wajib diisi";
           if (!formData.nik) newErrors.nik = "NIK wajib diisi";
           if (!formData.email) newErrors.email = "Email wajib diisi";
           if (!formData.phone) newErrors.phone = "Nomor telepon wajib diisi";
           if (!formData.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
           if (!formData.tempatLahir) newErrors.tempatLahir = "Tempat lahir wajib diisi";
           if (!formData.gender) newErrors.gender = "Jenis kelamin wajib diisi";
           if (!formData.maritalStatus) newErrors.maritalStatus = "Status pernikahan wajib diisi";
           if (!formData.agama) newErrors.agama = "Agama wajib diisi";
           if (!formData.pendidikan) newErrors.pendidikan = "Pendidikan wajib diisi";
           if (!formData.motherName) newErrors.motherName = "Nama ibu kandung wajib diisi";
           if (!formData.citizenship) newErrors.citizenship = "Kewarganegaraan wajib diisi";
           if (!formData.address) newErrors.address = "Alamat wajib diisi";
           if (!formData.postalCode) newErrors.postalCode = "Kode pos wajib diisi";
           if (!formData.statusRumah) newErrors.statusRumah = "Status tempat tinggal wajib diisi";
           
           // Address validation based on citizenship
           if (formData.citizenship === 'Indonesia') {
             // For WNI, require Indonesian address fields
             if (!formData.province) newErrors.province = "Provinsi wajib diisi";
             if (!formData.city) newErrors.city = "Kota/Kabupaten wajib diisi";
           }
           // For WNA, only require address field (no additional validations)
           if (!formData.jenisId) newErrors.jenisId = "Jenis identitas wajib diisi";
           if (formData.jenisId === 'Lainnya' && !formData.jenisIdCustom) {
              newErrors.jenisIdCustom = "Sebutkan jenis identitas Anda";
           }
           // Validity date validation - exclude KTP (lifetime validity)
           if (formData.jenisId && formData.jenisId !== 'KTP' && !formData.berlakuId) {
              newErrors.berlakuId = "Masa berlaku identitas wajib diisi";
           }
           
           // Basic client-side validations only
           if (!newErrors.nik && (!formData.jenisId || formData.jenisId === 'KTP')) {
             const nikErr = validateNikBasic(formData.nik);
             if (nikErr) newErrors.nik = nikErr;
           }
           if (!newErrors.email) {
             const emailErr = validateEmailBasic(formData.email);
             if (emailErr) newErrors.email = emailErr;
           }
           if (!newErrors.phone) {
             const phoneErr = validatePhoneBasic(formData.phone);
             if (phoneErr) newErrors.phone = phoneErr;
           }
        } else if (currentStep === 3) {
           // Step 3: Validate Data Pekerjaan & Keuangan
           if (!formData.employmentStatus) newErrors.employmentStatus = "Status pekerjaan wajib diisi";
           if (!formData.monthlyIncome) newErrors.monthlyIncome = "Penghasilan per bulan wajib diisi";
           if (!formData.sumberDana) newErrors.sumberDana = "Sumber dana wajib diisi";
           if (formData.sumberDana === 'Lainnya' && (!formData.sumberDanaCustom || formData.sumberDanaCustom.trim() === '')) {
             newErrors.sumberDanaCustom = "Sumber dana lainnya harus diisi";
           }
        } else if (currentStep === 4) {
           // Step 4: Validate Data Rekening
           if (!formData.tujuanRekening) newErrors.tujuanRekening = "Tujuan rekening wajib diisi";
           if (formData.tujuanRekening === 'Lainnya' && !formData.tujuanRekeningLainnya) {
             newErrors.tujuanRekeningLainnya = "Sebutkan tujuan pembukaan rekening";
           }
           
           // Validate BO if account is for others
           if (formData.rekeningUntukSendiri === false) {
             if (!formData.boNama) newErrors.boNama = "Nama beneficial owner wajib diisi";
             if (!formData.boAlamat) newErrors.boAlamat = "Alamat beneficial owner wajib diisi";
             if (!formData.boTempatLahir) newErrors.boTempatLahir = "Tempat lahir beneficial owner wajib diisi";
             if (!formData.boTanggalLahir) newErrors.boTanggalLahir = "Tanggal lahir beneficial owner wajib diisi";
             if (!formData.boJenisKelamin) newErrors.boJenisKelamin = "Jenis kelamin beneficial owner wajib diisi";
             if (!formData.boKewarganegaraan) newErrors.boKewarganegaraan = "Kewarganegaraan beneficial owner wajib diisi";
             if (!formData.boStatusPernikahan) newErrors.boStatusPernikahan = "Status pernikahan beneficial owner wajib diisi";
             if (!formData.boJenisId) newErrors.boJenisId = "Jenis identitas beneficial owner wajib diisi";
             if (!formData.boNomorId) newErrors.boNomorId = "Nomor identitas beneficial owner wajib diisi";
             if (!formData.boSumberDana) newErrors.boSumberDana = "Sumber dana beneficial owner wajib diisi";
             if (formData.boSumberDana === 'Lainnya' && (!formData.boSumberDanaCustom || formData.boSumberDanaCustom.trim() === '')) {
               newErrors.boSumberDanaCustom = "Sumber dana lainnya harus diisi";
             }
             if (!formData.boHubungan) newErrors.boHubungan = "Hubungan dengan beneficial owner wajib diisi";
             if (formData.boHubungan === 'Lainnya' && (!formData.boHubunganCustom || formData.boHubunganCustom.trim() === '')) {
               newErrors.boHubunganCustom = "Hubungan lainnya harus diisi";
             }
             if (!formData.boNomorHp) newErrors.boNomorHp = "Nomor HP beneficial owner wajib diisi";
             if (!formData.boPekerjaan) newErrors.boPekerjaan = "Pekerjaan beneficial owner wajib diisi";
             if (!formData.boPendapatanTahun) newErrors.boPendapatanTahun = "Pendapatan tahunan beneficial owner wajib diisi";
             if (!formData.boPersetujuan) newErrors.boPersetujuan = "Persetujuan beneficial owner harus dicentang";
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
    
    // Personal Identity - Required Fields
    if (!formData.fullName) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!formData.nik) newErrors.nik = "NIK wajib diisi";
    if (!formData.email) newErrors.email = "Email wajib diisi";
    if (!formData.phone) newErrors.phone = "Nomor telepon wajib diisi";
    if (!formData.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
    if (!formData.tempatLahir) newErrors.tempatLahir = "Tempat lahir wajib diisi";
    if (!formData.gender) newErrors.gender = "Jenis kelamin wajib diisi";
    if (!formData.maritalStatus) newErrors.maritalStatus = "Status pernikahan wajib diisi";
    if (!formData.agama) newErrors.agama = "Agama wajib diisi";
    if (!formData.pendidikan) newErrors.pendidikan = "Pendidikan wajib diisi";
    if (!formData.motherName) newErrors.motherName = "Nama ibu kandung wajib diisi";
    if (!formData.citizenship) newErrors.citizenship = "Kewarganegaraan wajib diisi";
    
    // Identity Validity - Required for non-KTP
    if (!formData.jenisId) newErrors.jenisId = "Jenis identitas wajib diisi";
    if (formData.jenisId === 'Lainnya' && !formData.jenisIdCustom) {
      newErrors.jenisIdCustom = "Sebutkan jenis identitas Anda";
    }
    if (formData.jenisId && formData.jenisId !== 'KTP' && !formData.berlakuId) {
      newErrors.berlakuId = "Masa berlaku identitas wajib diisi";
    }
    
    // Address - Required Fields
    if (!formData.address) newErrors.address = "Alamat wajib diisi";
    if (!formData.postalCode) newErrors.postalCode = "Kode pos wajib diisi";
    if (!formData.statusRumah) newErrors.statusRumah = "Status tempat tinggal wajib diisi";
    
    // Address validation based on citizenship
    if (formData.citizenship === 'Indonesia') {
      // For WNI, require Indonesian address fields
      if (!formData.province) newErrors.province = "Provinsi wajib diisi";
      if (!formData.city) newErrors.city = "Kota/Kabupaten wajib diisi";
    }
    // For WNA, only require address field (no additional validations)
    
    // Employment - Required Fields
    if (!formData.employmentStatus) newErrors.employmentStatus = "Status pekerjaan wajib diisi";
    if (!formData.monthlyIncome) newErrors.monthlyIncome = "Penghasilan per bulan wajib diisi";
    if (!formData.sumberDana) newErrors.sumberDana = "Sumber dana wajib diisi";
    if (formData.sumberDana === 'Lainnya' && (!formData.sumberDanaCustom || formData.sumberDanaCustom.trim() === '')) {
      newErrors.sumberDanaCustom = "Sumber dana lainnya harus diisi";
    }
    
    // Account Configuration - Required Fields
    if (!formData.tujuanRekening) newErrors.tujuanRekening = "Tujuan rekening wajib diisi";
    if (formData.tujuanRekening === 'Lainnya' && !formData.tujuanRekeningLainnya) {
      newErrors.tujuanRekeningLainnya = "Sebutkan tujuan pembukaan rekening";
    }
    
    // Card Type validation for Mutiara
    if (savingsType === 'mutiara' && !formData.cardType) {
      newErrors.cardType = "Jenis kartu wajib dipilih untuk rekening Mutiara";
    }
    
    // Emergency Contact - Optional but all-or-nothing
    const hasEmergencyContact = formData.kontakDaruratNama || formData.kontakDaruratHp || formData.kontakDaruratHubungan;
    if (hasEmergencyContact) {
      if (!formData.kontakDaruratNama) newErrors.kontakDaruratNama = "Nama kontak darurat harus diisi jika mengisi kontak darurat";
      if (!formData.kontakDaruratHp) newErrors.kontakDaruratHp = "Nomor HP kontak darurat harus diisi jika mengisi kontak darurat";
      if (!formData.kontakDaruratHubungan) newErrors.kontakDaruratHubungan = "Hubungan kontak darurat harus diisi jika mengisi kontak darurat";
      if (formData.kontakDaruratHubungan === 'Lainnya' && (!formData.kontakDaruratHubunganLainnya || formData.kontakDaruratHubunganLainnya.trim() === '')) {
        newErrors.kontakDaruratHubunganLainnya = "Hubungan lainnya harus diisi";
      }
    }
    
    // Customer Type Validation
    if (formData.tipeNasabah === 'lama' && !formData.nomorRekeningLama) {
      newErrors.nomorRekeningLama = "Nomor rekening lama harus diisi untuk nasabah lama";
    }

    // Terms and Conditions
    if (!formData.agreeTerms) newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";

    // Basic client-side validations only (no async duplicate checks)
    if (!newErrors.nik && (!formData.jenisId || formData.jenisId === 'KTP')) {
      const nikErr = validateNikBasic(formData.nik);
      if (nikErr) newErrors.nik = nikErr;
    }
    if (!newErrors.email) {
      const emailErr = validateEmailBasic(formData.email);
      if (emailErr) newErrors.email = emailErr;
    }
    if (!newErrors.phone) {
      const phoneErr = validatePhoneBasic(formData.phone);
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
          <span>Formulir memerlukan persetujuan</span>
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
      const res = await fetch(`${apiBase}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        setLoadingSubmit(false);
        return;
      }

      // Simpan state proses OTP
      localStorage.setItem("otpInProgress", "true");
      localStorage.setItem("pendingSubmitData", JSON.stringify(formData));
      localStorage.setItem("currentPhone", formData.phone);
      if (currentKtpUrl) localStorage.setItem("savedKtpUrl", currentKtpUrl);


      // Simpan data form sementara
      setPendingSubmitData(formData);
      setCurrentPhone(formData.phone);
      
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
    const selectedBranch = branches.find(b => b.id.toString() === formData.cabang_pengambilan);
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
    const commonProps = {
      formData,
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
      currentStep, // Pass current step
    };

    if (savingsType === 'simpel') {
      return <FormSimpel {...commonProps} />;
    } else if (savingsType === 'regular') {
      return <FormBusiness {...commonProps} />;
    }else if (savingsType === 'mutiara') {
      return <FormMutiara {...commonProps} />;
    }else if (savingsType === 'arofah') {
      return <FormArofah {...commonProps} />;
    }else if (savingsType === 'tamasya') {
      return <FormTamasya {...commonProps} />;
    }else if (savingsType === 'tabunganku') {
      return <FormTabunganku {...commonProps} />;
    }else if (savingsType === 'pensiun') {
      return <FormPensiun {...commonProps} />;
    }else if (savingsType === 'regular') {
      return <FormReguler {...commonProps} />;
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
    <div className="min-h-screen bg-slate-50 font-sans animate-page-enter">
      {/* Header */}
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

                // Adjust Progress Bar for adjacent steps if needed, 
                // but simpler to just show the nodes for mobile to avoid layout shifts.
                // Or maybe just small connecting lines between them? 
                // Let's keep it simple first as requested: "nama step dan highlight".
                
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
            {/* Simple progress indicator dots for total context */}
            <div className="flex justify-center gap-1 mt-4">
               {steps.map(s => (
                 <div key={s.number} className={`h-1.5 rounded-full transition-all ${s.number === currentStep ? 'w-6 bg-green-500' : s.number < currentStep ? 'w-1.5 bg-green-300' : 'w-1.5 bg-slate-200'}`} />
               ))}
            </div>
          </div>

          {/* Desktop Stepper (>= md) */}
          <div className="hidden md:flex items-center justify-between relative">
            {/* Progress Bar Background */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10" />
            
            {/* Active Progress Bar */}
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
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
             {currentStep < 4 && (
               <Button
                variant="ghost"
                onClick={handlePrevStep}
                disabled={loadingPrev}
                className="pl-0 text-slate-500 hover:text-blue-700 hover:bg-transparent disabled:opacity-50"
              >
                {loadingPrev ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentStep === 1 ? "Kembali" : "Sebelumnya"}
                  </>
                )}
              </Button>
             )}
            <div className="text-right ml-auto">
               <h2 className="text-2xl font-bold text-slate-900">{steps[currentStep-1].title}</h2>
               <p className="text-slate-500 text-sm">Langkah {currentStep} dari {totalSteps}</p>
            </div>
          </div>

          <Card className="bg-white p-8 md:p-10 border-0 shadow-sm rounded-md w-full animate-scale-in">
            {currentStep === 6 ? renderSuccess() : renderForm()}
            
            {/* Navigation Buttons */}
            {currentStep < 6 && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">

                {/* ✅ BACK BUTTON (KIRI) */}
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1 || loadingPrev}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-sm text-lg shadow-sm transition-all disabled:opacity-50"
                >
                  {loadingPrev ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    'Kembali'
                  )}
                </Button>

                {/* ✅ NEXT / SUBMIT BUTTON (KANAN) */}
                {currentStep < 5 ? (
                  <Button 
                    type="button" 
                    onClick={handleNextStep}
                    disabled={loadingNext}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm text-lg shadow-sm hover:shadow-green-300/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loadingNext ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Lanjut <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                ) : currentStep === 5 ? (
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={loadingSubmit}
                    className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold px-6 py-2 rounded-sm text-lg shadow-sm transition-all disabled:opacity-50"
                  >
                    {loadingSubmit ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Mengirim...
                      </>
                    ) : 'Kirim Permohonan'}
                  </Button>
                ) : null}
              </div>
            )}

            <OtpModal
              open={showOtpModal}
              onClose={() => setShowOtpModal(false)}
              phone={currentPhone}
              onVerified={handleOtpVerified}
            />
          </Card>
        </div>
      </section>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
