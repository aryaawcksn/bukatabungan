import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, CheckCircle, Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { Upload } from "./Upload"; 
interface AccountFormProps {
  savingsType: string;
  onBack: () => void;
}

export default function AccountForm({ savingsType, onBack }: AccountFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);
  const [ktpUrl, setKtpUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [loadingKtp, setLoadingKtp] = useState(false);
  const [loadingSelfie, setLoadingSelfie] = useState(false);
  const [fotoKtp, setFotoKtp] = useState("");
  const [fotoSelfie, setFotoSelfie] = useState("");

  // Ensure page starts at the top when entering this screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const [formData, setFormData] = useState({
    fullName: '',
    nik: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    province: '',
    city: '',
    postalCode: '',
    occupation: '',
    monthlyIncome: '',
    cabang_pengambilan: 'Sleman',
    cardType: '', // kept in state but will be auto-filled based on savingsType
    agreeTerms: false
  });

  // Map default jenis_kartu: samakan dengan savingsType
  const getDefaultCardType = () => {
    return savingsType;
  };

  // Isi otomatis cardType saat savingsType berubah
  useEffect(() => {
    setFormData((prev) => ({ ...prev, cardType: getDefaultCardType() }));
  }, [savingsType]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Siapkan data yang akan dikirim ke backend
 const submitData = {
  nama_lengkap: formData.fullName,
  nik: formData.nik,
  email: formData.email,
  no_hp: formData.phone,
  tanggal_lahir: formData.birthDate,
  alamat: formData.address,
  provinsi: formData.province,
  kota: formData.city,
  kode_pos: formData.postalCode,
  pekerjaan: formData.occupation,
  penghasilan: formData.monthlyIncome,
  jenis_kartu: formData.cardType || getDefaultCardType(),
  card_type: formData.cardType || getDefaultCardType(),
  savings_type: savingsType,
  savings_type_name: getSavingsTypeName(),
  cabang_pengambilan: formData.cabang_pengambilan || '',

  // 🟢 Tambahkan dua ini supaya backend tahu URL hasil upload
  foto_ktp: ktpUrl,
  foto_selfie: selfieUrl,
};

  try {
    const response = await fetch("http://localhost:5000/api/pengajuan", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(submitData),
});

    // Parse hasil respons JSON
    const result = await response.json();
    console.log("Response dari server:", result);

    if (response.ok && result.success) {
      setReferenceCode(result.kode_referensi ?? null);
      setSubmitted(true);
    } else {
      alert("⚠️ Gagal menyimpan data: " + (result.message || "Terjadi kesalahan"));
    }
  } catch (err) {
    console.error("Error saat submit:", err);
    alert("❌ Terjadi kesalahan koneksi ke server");
  }
};

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

   const uploadToServer = async (
    file: File,
    setUrl: (url: string | null) => void,
    setLoading: (loading: boolean) => void
  ) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("gambar", file);

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal upload ke server");
      const data = await res.json();
      setUrl(data.url);
    } catch (err) {
      console.error("Upload gagal:", err);
      alert("Upload gagal, coba lagi!");
    } finally {
      setLoading(false);
    }
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
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Login
            </Button>
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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Data Pribadi */}
            <div>
              <h3 className="text-emerald-900 mb-6 text-2xl">Data Pribadi</h3>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="fullName" className="text-gray-700">Nama Lengkap (Sesuai KTP)</Label>
                  <Input 
                    id="fullName" 
                    required
                    placeholder="Masukkan nama lengkap"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                  />
                </div>

                <div>
                  <Label htmlFor="nik" className="text-gray-700">NIK (Nomor Induk Kependudukan)</Label>
                  <Input 
                    id="nik" 
                    required
                    placeholder="16 digit NIK"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({...formData, nik: e.target.value})}
                    className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700">Nomor Telepon</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="birthDate" className="text-gray-700">Tanggal Lahir</Label>
                  <Input 
                    id="birthDate" 
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Alamat */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-emerald-900 mb-6 text-2xl">Alamat</h3>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="address" className="text-gray-700">Alamat Lengkap</Label>
                  <Textarea 
                    id="address"
                    required
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  <div>
                    <Label htmlFor="province" className="text-gray-700">Provinsi</Label>
                    <Input 
                      id="province"
                      required
                      placeholder="Nama Provinsi"
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                      className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-gray-700">Kota/Kabupaten</Label>
                    <Input 
                      id="city"
                      required
                      placeholder="Nama Kota"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode" className="text-gray-700">Kode Pos</Label>
                    <Input 
                      id="postalCode"
                      required
                      placeholder="12345"
                      maxLength={5}
                      value={formData.postalCode}
                      onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
                    />
                  </div>
                </div>

                
              </div>
            </div>

            {/* Informasi Pekerjaan */}
            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-emerald-900 mb-6 text-2xl">Informasi Pekerjaan</h3>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="occupation" className="text-gray-700">Pekerjaan</Label>
                  <Select 
                    value={formData.occupation}
                    onValueChange={(value) => setFormData({...formData, occupation: value})}
                  >
                    <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded">
                      <SelectValue placeholder="Pilih pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pegawai">Pegawai Swasta</SelectItem>
                      <SelectItem value="pns">PNS/TNI/Polri</SelectItem>
                      <SelectItem value="wiraswasta">Wiraswasta</SelectItem>
                      <SelectItem value="profesional">Profesional</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="monthlyIncome" className="text-gray-700">Penghasilan per Bulan</Label>
                  <Select
                    value={formData.monthlyIncome}
                    onValueChange={(value) => setFormData({...formData, monthlyIncome: value})}
                  >
                    <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded">
                      <SelectValue placeholder="Pilih range penghasilan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below5">&lt; Rp 5.000.000</SelectItem>
                      <SelectItem value="5-10jt">Rp 5.000.000 - Rp 10.000.000</SelectItem>
                      <SelectItem value="10-20jt">Rp 10.000.000 - Rp 20.000.000</SelectItem>
                      <SelectItem value="above20">&gt; Rp 20.000.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Upload Dokumen */}
            <div className="pt-6 border-t border-gray-100">
  <h3 className="text-emerald-900 mb-6 text-2xl">Upload Dokumen</h3>

  <div className="space-y-6">
    {/* ===== Upload Foto KTP ===== */}
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-all hover:bg-emerald-50/50">
      {/* Upload hanya muncul jika belum ada file */}
      {!ktpUrl && (
        <Upload
          label="Upload Foto KTP"
          description="Format: JPG, PNG (Max. 2MB)"
          onChange={(file) => uploadToServer(file, setKtpUrl, setLoadingKtp)}
        />
      )}

      {loadingKtp && (
        <p className="text-xs text-gray-500 mt-2">Uploading...</p>
      )}

      {/* Preview muncul setelah upload */}
      {ktpUrl && (
        <div className="mt-4">
          <img
            src={ktpUrl}
            alt="KTP Preview"
            className="mx-auto rounded-xl shadow-md max-h-48"
          />
          <button
            onClick={() => setKtpUrl("")}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Ganti Foto
          </button>
        </div>
      )}
    </div>

    {/* ===== Upload Selfie dengan KTP ===== */}
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-all hover:bg-emerald-50/50">
      {!selfieUrl && (
        <Upload
          label="Upload Selfie dengan KTP"
          description="Format: JPG, PNG (Max. 2MB)"
          onChange={(file) =>
            uploadToServer(file, setSelfieUrl, setLoadingSelfie)
          }
        />
      )}

      {loadingSelfie && (
        <p className="text-xs text-gray-500 mt-2">Uploading...</p>
      )}

      {selfieUrl && (
        <div className="mt-4">
          <img
            src={selfieUrl}
            alt="Selfie Preview"
            className="mx-auto rounded-xl shadow-md max-h-48"
          />
          <button
            onClick={() => setSelfieUrl("")}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Ganti Foto
          </button>
        </div>
      )}
    </div>
  </div>
</div>

            {/* Pilihan Kartu: dihapus, kini otomatis berdasarkan jenis tabungan */}
            <div>
              <h3 className="text-emerald-900 mb-6 text-2xl">Pilih Cabang</h3>
                  <Label htmlFor="cabang_pengambilan" className="text-gray-700">Pilih Cabang Pengambilan</Label>
                  <Select
                    value={formData.cabang_pengambilan}
                    onValueChange={(value) => setFormData({...formData, cabang_pengambilan: value})}
                  >
                    <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded">
                      <SelectValue placeholder="Pilih cabang pengambilan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sleman">Cabang Sleman</SelectItem>
                      <SelectItem value="Godean">Cabang Godean</SelectItem>
                      <SelectItem value="Turi">Cabang Turi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-4 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-inner">
              <Checkbox 
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                required
                className="mt-1"
              />
              <div>
                <Label htmlFor="terms" className="cursor-pointer text-gray-800">
                  Saya menyetujui <a href="#" className="text-emerald-700 hover:underline">Syarat dan Ketentuan</a> serta <a href="#" className="text-emerald-700 hover:underline">Kebijakan Privasi</a>
                </Label>
                <p className="text-xs text-gray-600 mt-2">
                  Dengan mencentang kotak ini, saya menyatakan bahwa semua data yang saya berikan adalah benar dan saya bertanggung jawab penuh atas kebenaran data tersebut.
                </p>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 py-7 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Kirim Permohonan Pembukaan Rekening
            </Button>
          </form>
        </Card>
        </div>
      </section>
    </div>
  );
}
