import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, CheckCircle, Sparkles, Phone, Mail, MapPin, ChevronRight, User, Building2, FileText, Check, CircleCheckBig } from 'lucide-react';
import OtpModal from './OtpModal';
import FormSimpel from './account-forms/FormSimpel';
import FormBusiness from './account-forms/FormBusiness';
import FormIndividu from './account-forms/FormIndividu';
import type { AccountFormData } from './account-forms/types';

interface AccountFormProps {
  savingsType: string;
  onBack: () => void;
}

export default function AccountForm({ savingsType, onBack }: AccountFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [ktpUrl, setKtpUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentPhone, setCurrentPhone] = useState("");
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null); // simpan data sebelum OTP

  // Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Validation errors (simple server-backed uniqueness + basic client hints)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const apiBase = "https://bukatabungan-production.up.railway.app";

  const validateNikAsync = async (nik: string) => {
    if (!nik) return 'NIK wajib diisi';
    // basic client-side checks
    if (!/^\d{16}$/.test(nik)) return 'NIK harus 16 digit';
    try {
      const res = await fetch(`${apiBase}/api/check-nik?nik=${encodeURIComponent(nik)}`, {
        credentials: "include", // ✅ di sini
      });
      if (!res.ok) return 'Gagal memeriksa NIK';
      const data = await res.json();
      if (data.exists) {
        const s = data.status;
        if (s === 'approved') return 'NIK Sudah Digunakan';
        if (s === 'pending') return 'NIK sudah memiliki pengajuan pending (hanya 1 pengajuan pending per NIK)';
        return 'NIK tidak tersedia';
      }
      return '';
    } catch (err) {
      return 'Gagal memeriksa NIK';
    }
  };

  const validateEmailAsync = async (email: string) => {
    if (!email) return 'Email wajib diisi';
    try {
      const res = await fetch(`${apiBase}/api/check-nik?email=${encodeURIComponent(email)}`, {
        credentials: "include", // ✅ di sini
      });
      if (!res.ok) return 'Gagal memeriksa Email';
      const data = await res.json();
      if (data.exists) return 'Email Sudah Digunakan';
      return '';
    } catch (err) {
      return 'Gagal memeriksa Email';
    }
  };

 const validatePhoneAsync = async (phone: string) => {
  if (!phone) return 'Nomor telepon wajib diisi';
  try {
    const res = await fetch(`${apiBase}/api/check-nik?phone=${encodeURIComponent(phone)}`, {
      credentials: "include", // ✅ di sini
    });
    if (!res.ok) return 'Gagal memeriksa No HP';
    const data = await res.json();
    if (data.exists) return 'No HP Sudah Digunakan';
    return '';
  } catch (err) {
    return 'Gagal memeriksa No HP';
  }
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
    address: '',
    province: '',
    city: '',
    postalCode: '',
    monthlyIncome: '',
    cabang_pengambilan: '',
    cardType: '',
    agreeTerms: false,
    jenis_rekening: '',

    gender: '',
    maritalStatus: '',
    citizenship: '',
    motherName: '',

    tempatBekerja: '',
    alamatKantor: '',
    sumberDana: '',
    tujuanRekening: '',
    kontakDaruratNama: '',
    kontakDaruratHp: '',
    employmentStatus: '',
  });

  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://bukatabungan-production.up.railway.app/api/cabang")
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
    const savedSelfieUrl = localStorage.getItem("savedSelfieUrl");
  
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);
      setPendingSubmitData(parsed);
    }
    if (savedPhone) {
      setCurrentPhone(savedPhone);
    }
    if (savedKtpUrl) setKtpUrl(savedKtpUrl);
    if (savedSelfieUrl) setSelfieUrl(savedSelfieUrl);
  
    // Buka modal OTP
    setShowOtpModal(true);
  }, []);

  // Map default jenis_kartu: samakan dengan savingsType
  const getDefaultCardType = () => {
    return savingsType;
  };

  // Isi otomatis cardType saat savingsType berubah
  useEffect(() => {
    setFormData((prev) => ({ ...prev, cardType: getDefaultCardType() }));
  }, [savingsType]);

  const getSavingsTypeName = () => {
    switch (savingsType) {
      case 'mutiara':
        return 'Tabungan Mutiara';
      case 'bisnis':
        return 'Tabungan Bank Sleman';
      case 'simpel':
        return 'Tabungan Simpel';
      case 'individu':
        return 'Tabungan Individu';
      case 'promosi':
        return 'Tabungan Promosi';
      default:
        return 'Tabungan';
    }
  };

  const handleNextStep = async () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
       // Validate Branch
       if (!formData.cabang_pengambilan) {
          newErrors.cabang_pengambilan = "Silakan pilih cabang pengambilan";
       } else {
          const selectedBranch = branches.find(b => b.id.toString() === formData.cabang_pengambilan.toString());
          if (selectedBranch && !selectedBranch.is_active) {
            newErrors.cabang_pengambilan = "Cabang sedang dalam perbaikan, silahkan pilih cabang lain";
          }
       }
    } else if (currentStep === 2) {
       // Validate Personal Data & Uploads
       if (!formData.fullName) newErrors.fullName = "Nama lengkap wajib diisi";
       if (!formData.nik) newErrors.nik = "NIK wajib diisi";
       if (!formData.email) newErrors.email = "Email wajib diisi";
       if (!formData.phone) newErrors.phone = "Nomor telepon wajib diisi";
       if (!formData.birthDate) newErrors.birthDate = "Tanggal lahir wajib diisi";
       if (!formData.gender) newErrors.gender = "Jenis kelamin wajib diisi";
       if (!formData.citizenship) newErrors.citizenship = "Kewarganegaraan wajib diisi";
       if (!formData.motherName) newErrors.motherName = "Nama ibu kandung wajib diisi";
       
       if (!ktpFile && !ktpUrl) newErrors.ktp = "Silakan upload foto KTP!";
       if (!selfieFile && !selfieUrl) newErrors.selfie = "Silakan upload selfie dengan KTP!";

       // Async validations
       if (!newErrors.nik) {
          const nikErr = await validateNikAsync(formData.nik);
          if (nikErr) newErrors.nik = nikErr;
       }
       if (!newErrors.email) {
          const emailErr = await validateEmailAsync(formData.email);
          if (emailErr) newErrors.email = emailErr;
       }
       if (!newErrors.phone) {
          const phoneErr = await validatePhoneAsync(formData.phone);
          if (phoneErr) newErrors.phone = phoneErr;
       }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      // focus first error
      const first = Object.keys(newErrors)[0];
      const el = document.getElementById(first);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Clear errors for current step fields
    setErrors({});
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    
    // Final Step Validation
    const newErrors: Record<string,string> = {};
    if (!formData.address) newErrors.address = "Alamat wajib diisi";
    if (!formData.province) newErrors.province = "Provinsi wajib diisi";
    if (!formData.city) newErrors.city = "Kota/Kabupaten wajib diisi";
    if (!formData.postalCode) newErrors.postalCode = "Kode pos wajib diisi";
    if (!formData.employmentStatus) newErrors.employmentStatus = "Status pekerjaan wajib diisi";
    if (!formData.sumberDana) newErrors.sumberDana = "Sumber dana wajib diisi";
    if (!formData.tujuanRekening) newErrors.tujuanRekening = "Tujuan rekening wajib diisi";
    if (!formData.agreeTerms) newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      setLoadingSubmit(false);
      const first = Object.keys(newErrors)[0];
      const el = document.getElementById(first);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // ============================
    // UPLOAD FILES FIRST
    // ============================
    let currentKtpUrl = ktpUrl;
    let currentSelfieUrl = selfieUrl;

    try {
        if (ktpFile && !currentKtpUrl) {
            const formDataKtp = new FormData();
            formDataKtp.append("gambar", ktpFile);
            const resKtp = await fetch("https://bukatabungan-production.up.railway.app/upload", {
                method: "POST",
                body: formDataKtp,
                credentials: "include",
            });
            if (!resKtp.ok) throw new Error("Gagal upload KTP");
            const dataKtp = await resKtp.json();
            currentKtpUrl = dataKtp.url;
            setKtpUrl(currentKtpUrl);
        }

        if (selfieFile && !currentSelfieUrl) {
            const formDataSelfie = new FormData();
            formDataSelfie.append("gambar", selfieFile);
            const resSelfie = await fetch("https://bukatabungan-production.up.railway.app/upload", {
                method: "POST",
                body: formDataSelfie,
                credentials: "include",
            });
            if (!resSelfie.ok) throw new Error("Gagal upload Selfie");
            const dataSelfie = await resSelfie.json();
            currentSelfieUrl = dataSelfie.url;
            setSelfieUrl(currentSelfieUrl);
        }
    } catch (err) {
        alert("Gagal mengupload dokumen. Silakan coba lagi.");
        setLoadingSubmit(false);
        return;
    }

   try {
      const res = await fetch("https://bukatabungan-production.up.railway.app/otp/send", {
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
      if (currentSelfieUrl) localStorage.setItem("savedSelfieUrl", currentSelfieUrl);

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
    localStorage.removeItem("savedSelfieUrl");
  
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
    let ktpUploadedUrl = ktpUrl;
    if (ktpFile && !ktpUploadedUrl) {
      try {
        const formDataKtp = new FormData();
        formDataKtp.append("gambar", ktpFile);
  
        const resKtp = await fetch(
          "https://bukatabungan-production.up.railway.app/upload",
          {
            method: "POST",
            body: formDataKtp,
            credentials: "include",
          }
        );
  
        if (!resKtp.ok) throw new Error("Gagal upload KTP");
  
        const dataKtp = await resKtp.json();
        ktpUploadedUrl = dataKtp.url;
        setKtpUrl(ktpUploadedUrl);
      } catch (err) {
        alert("Upload KTP gagal, coba lagi!");
        setLoadingSubmit(false);
        return;
      }
    }
  
    // ============================
    // 2. Upload Selfie
    // ============================
    let selfieUploadedUrl = selfieUrl;
    if (selfieFile && !selfieUploadedUrl) {
      try {
        const formDataSelfie = new FormData();
        formDataSelfie.append("gambar", selfieFile);
  
        const resSelfie = await fetch(
          "https://bukatabungan-production.up.railway.app/upload",
          {
            method: "POST",
            body: formDataSelfie,
            credentials: "include",
          }
        );
  
        if (!resSelfie.ok) throw new Error("Gagal upload selfie");
  
        const dataSelfie = await resSelfie.json();
        selfieUploadedUrl = dataSelfie.url;
        setSelfieUrl(selfieUploadedUrl);
      } catch (err) {
        alert("Upload selfie gagal, coba lagi!");
        setLoadingSubmit(false);
        return;
      }
    }
  
    // ============================
    // 3. Siapkan data submit
    // ============================
    const submitData = {
      nama_lengkap: data.fullName,
      nik: data.nik,
      email: data.email,
      no_hp: data.phone,
      tanggal_lahir: data.birthDate,
      alamat: data.address,
      provinsi: data.province,
      kota: data.city,
      kode_pos: data.postalCode,
      jenis_rekening: data.jenis_rekening,
      penghasilan: data.monthlyIncome,
      jenis_kelamin: data.gender,
      status_perkawinan: data.maritalStatus,
      kewarganegaraan: data.citizenship,
      nama_ibu_kandung: data.motherName,
      tempat_bekerja: data.tempatBekerja,
      alamat_kantor: data.alamatKantor,
      sumber_dana: data.sumberDana,
      tujuan_rekening: data.tujuanRekening,
      kontak_darurat_nama: data.kontakDaruratNama,
      kontak_darurat_hp: data.kontakDaruratHp,
      pekerjaan: data.employmentStatus,
      setuju_data: data.agreeTerms ? "Ya" : "Tidak",
      jenis_kartu: data.cardType || getDefaultCardType(),
      card_type: data.cardType || getDefaultCardType(),
      savings_type: savingsType,
      savings_type_name: getSavingsTypeName(),
      cabang_pengambilan: data.cabang_pengambilan, // This will now be the ID
      cabang_id: data.cabang_pengambilan, // Send ID explicitly
      foto_ktp: ktpUploadedUrl,
      foto_selfie: selfieUploadedUrl,
    };
  
    // ============================
    // 4. Submit ke backend
    // ============================
    try {
      const response = await fetch(
        "https://bukatabungan-production.up.railway.app/api/pengajuan",
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
        setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Card className="max-w-2xl mx-4 p-12 text-center border-0 shadow-2xl rounded-3xl bg-white">
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
                <span>Kami akan mengirimkan email konfirmasi ke alamat email Anda</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Tim verifikasi akan memeriksa dokumen Anda</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Anda akan menerima nomor virtual account untuk setoran awal</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Setelah setoran diterima, rekening Anda akan aktif</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Kartu debit akan dikirim ke alamat Anda dalam 7-10 hari kerja</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3 bg-white p-6 rounded-2xl shadow-md">
            <p className="text-sm text-gray-600">
              Nomor Referensi:
            </p>
            <p className="text-2xl font-mono text-emerald-700">
              {referenceCode ?? `BKU-2025-${Math.floor(Math.random() * 100000)}`}
            </p>
            <p className="text-sm text-gray-600">
              Simpan nomor ini untuk keperluan tracking aplikasi Anda
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const renderForm = () => {
    const commonProps = {
      formData,
      setFormData,
      errors,
      setErrors,
      validateNikAsync,
      validateEmailAsync,
      validatePhoneAsync,
      getFieldClass,
      ktpFile,
      setKtpFile,
      ktpPreview,
      setKtpPreview,
      ktpUrl,
      setKtpUrl,
      selfieFile,
      setSelfieFile,
      selfiePreview,
      setSelfiePreview,
      selfieUrl,
      setSelfieUrl,
      loadingSubmit,
      handleSubmit,
      savingsType,
      getSavingsTypeName,
      branches,
      currentStep, // Pass current step
    };

    if (savingsType === 'simpel') {
      return <FormSimpel {...commonProps} />;
    } else if (savingsType === 'bisnis') {
      return <FormBusiness {...commonProps} />;
    } else {
      // Default for individu, mutiara, promosi
      return <FormIndividu {...commonProps} />;
    }
  };

  const steps = [
    { number: 1, title: "Pilih Cabang", icon: Building2 },
    { number: 2, title: "Data Diri", icon: User },
    { number: 3, title: "Data Pekerjaan", icon: FileText },
    { number: 4, title: "Selesai", icon: CircleCheckBig },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
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
          <div className="flex items-center justify-between relative">
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
             <Button
              variant="ghost"
              onClick={handlePrevStep}
              className="pl-0 text-slate-500 hover:text-blue-700 hover:bg-transparent"

            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Kembali" : "Sebelumnya"}
            </Button>
            <div className="text-right">
               <h2 className="text-2xl font-bold text-slate-900">{steps[currentStep-1].title}</h2>
               <p className="text-slate-500 text-sm">Langkah {currentStep} dari {totalSteps}</p>
            </div>
          </div>

          <Card className="bg-white p-8 md:p-10 border-0 shadow-sm rounded-md w-full">
            {renderForm()}
            
            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">

  {/* ✅ BACK BUTTON (KIRI) */}
  <Button
    type="button"
    onClick={handlePrevStep}
    disabled={currentStep === 1}
    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-2 rounded-sm text-lg shadow-sm transition-all disabled:opacity-50"
  >
    Kembali
  </Button>

  {/* ✅ NEXT / SUBMIT BUTTON (KANAN) */}
  {currentStep < totalSteps ? (
    <Button 
      type="button" 
      onClick={handleNextStep}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-sm text-lg shadow-sm hover:shadow-green-300/20 transition-all"
    >
      Lanjut <ChevronRight className="ml-2 h-5 w-5" />
    </Button>
  ) : (
    <Button 
      type="button" 
      onClick={handleSubmit}
      disabled={loadingSubmit}
      className="bg-yellow-500 hover:bg-yellow-400 text-green-900 font-bold px-6 py-2 rounded-sm text-lg shadow-sm transition-all disabled:opacity-50"
    >
      {loadingSubmit ? 'Mengirim...' : 'Kirim Permohonan'}
    </Button>
  )}

</div>


            <OtpModal
              open={showOtpModal}
              onClose={() => setShowOtpModal(false)}
              phone={currentPhone}
              onVerified={handleOtpVerified}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}
