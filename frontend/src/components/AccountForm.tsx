import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, CheckCircle, Sparkles, Phone, Mail, MapPin } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    // Run server-side uniqueness checks for nik/email/phone (emergency phone is excluded)
    const nikErr = await validateNikAsync(formData.nik);
    const emailErr = await validateEmailAsync(formData.email);
    const phoneErr = await validatePhoneAsync(formData.phone);
    const newErrors: Record<string,string> = {};
    if (nikErr) newErrors.nik = nikErr;
    if (emailErr) newErrors.email = emailErr;
    if (phoneErr) newErrors.phone = phoneErr;
    if (!ktpFile && !ktpUrl) newErrors.ktp = "Silakan upload foto KTP!";
    if (!selfieFile && !selfieUrl) newErrors.selfie = "Silakan upload selfie dengan KTP!";

    // Validate Branch
    if (formData.cabang_pengambilan) {
      const selectedBranch = branches.find(b => b.id.toString() === formData.cabang_pengambilan.toString());
      if (selectedBranch && !selectedBranch.is_active) {
        newErrors.cabang_pengambilan = "Cabang sedang dalam perbaikan, silahkan pilih cabang lain";
      }
    } else {
       newErrors.cabang_pengambilan = "Silakan pilih cabang pengambilan";
    }
   
    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      setLoadingSubmit(false);
      // focus the first invalid field
      const first = Object.keys(newErrors)[0];
      const el = first ? document.getElementById(first) : null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { (el as HTMLElement).focus(); } catch {}
      }
      return;
    }else {
    // hapus error jika semua valid
    setErrors(prev => ({ ...prev, ktp: "", selfie: "" }));
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
      branches, // Pass branches to sub-forms
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(0274) 868051</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Jl. Kragilan No.1 Sinduharjo, Sleman</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@banksleman.co.id</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <img 
                src="/banksleman.png" 
                alt="Bank Sleman Logo" 
                className="w-40 h-auto -mt-3"
              />
            </div>
            <nav className="hidden lg:flex gap-8">
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">HOME</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">PROFIL</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">PRODUK & LAYANAN</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">E-BANKING</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">INFO</a>
              <a href="#" className="text-gray-700 hover:text-emerald-600 transition-colors">HUBUNGI KAMI</a>
            </nav>
           
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section 
        className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 py-20 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1726406569540-eb2c5bc000b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBwYXR0ZXJuJTIwZGFya3xlbnwxfHx8fDE3NjI3MzY2MjN8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90"></div>
        
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-white mb-4 text-5xl md:text-6xl">
              Formulir Pembukaan {getSavingsTypeName()}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-300">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <span>/</span>
              <a href="#" className="hover:text-white transition-colors">Produk</a>
              <span>/</span>
              <span className="text-emerald-400">{getSavingsTypeName()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
         <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 hover:bg-gray-100 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Prosedur
        </Button>
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">
              Lengkapi data berikut untuk membuka rekening Anda
            </p>
          </div>

        <Card className="bg-white p-10 border-0 shadow-xl rounded-2xl w-full max-w-4xl mx-auto">
          {renderForm()}
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
