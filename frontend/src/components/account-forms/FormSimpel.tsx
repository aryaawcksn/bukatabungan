import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Upload } from "../Upload";
import type { AccountFormProps } from './types';
import TermsModal from '../TermsModal';

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
  ktpFile,
  setKtpFile,
  ktpPreview,
  setKtpPreview,
  ktpUrl,
  setKtpUrl,

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* STEP 1: PILIH CABANG */}
      {currentStep === 1 && (
        <div>
          <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Pilih Lokasi Cabang</h3>
          <p className="text-slate-500 mb-6">Silakan pilih kantor cabang Bank Sleman terdekat untuk pengambilan buku tabungan SimPel.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <Label htmlFor="cabang_pengambilan" className="text-gray-700 font-semibold mb-2 block">Kantor Cabang</Label>
            {errors.cabang_pengambilan && <p className="text-sm text-red-600 mb-1">{errors.cabang_pengambilan}</p>}
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
              <SelectTrigger className={`h-12 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-md ${errors.cabang_pengambilan ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Pilih cabang pengambilan" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch: any) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.nama_cabang} {!branch.is_active ? '(Tidak tersedia)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* STEP 2: upload KTP*/}
      {currentStep === 2 && (
  <div className="space-y-8">

    {/* Illustration */}
    <div className="flex justify-center">
      <img
        src="../kia.png" // ganti dengan path ilustrasi KTP benar & salah
        alt="Ilustrasi KTP Benar dan Salah"
        className="w-full max-w-md h-auto rounded-md shadow-sm"
      />
    </div>

    {/* Upload Section */}
    <div>
      <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Upload KIA</h3>
      <div className="grid md:grid-cols-1 gap-6">
        {/* ===== Upload Foto KTP ===== */}
        <div>
          {errors.ktp && <p className="text-red-600 text-sm mb-1">{errors.ktp}</p>}
          {!ktpFile && !ktpPreview ? (
            <Upload
              label="Foto KIA"
              description="Format: JPG, PNG (Max. 2MB)"
              onChange={(file) => {
                setKtpFile(file);
                setKtpPreview(URL.createObjectURL(file));
                setKtpUrl(null);
                setErrors(prev => ({ ...prev, ktp: "" })); 
              }}
            />
          ) : (
            <div className="mt-2 relative group">
              <img
                src={ktpPreview || ktpUrl!}
                alt="KIA Preview"
                className="w-full h-48 object-cover rounded-md shadow-md"
              />
              <button
                type="button"
                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md font-medium"
                onClick={() => {
                  setKtpFile(null);
                  setKtpPreview(null);
                  setKtpUrl(null);
                }}
              >
                Ganti Foto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}


      {/* STEP 3: DATA PEKERJAAN & ALAMAT */}
      {currentStep === 3 && (
        <div className="space-y-8">
          
          {/* Alamat */}
          <div>
            <div className="space-y-5">

              <div className="border-t border-slate-100 pt-8">
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Isi Data diri</h3>
            <div className="space-y-5">

              {/* Nama Lengkap */}
              <div>
                <Label htmlFor="fullName" className="text-gray-700">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-300 focus:ring-blue-300"
                />
              </div>

              {/* NIK */}
              <div>
                <Label htmlFor="nik" className="text-gray-700">NIK / KIA</Label>
                {errors.nik && <p className="text-sm text-red-600 mb-1">{errors.nik}</p>}
                <Input
                  id="nik"
                  required
                  placeholder="16 digit"
                  maxLength={16}
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  onBlur={async (e) => {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    const err = await validateNikAsync(val);
                    setErrors(prev => {
                      const next = { ...prev };
                      if (err) next.nik = err;
                      else delete next.nik;
                      return next;
                    });
                  }}
                  className={`${getFieldClass('nik')} h-12 rounded-md`}
                />
              </div>

              {/* Gender + Marital Status */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Jenis Kelamin</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  {errors.email && <p className="text-sm text-red-600 mb-1">{errors.email}</p>}
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={async (e) => {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      const err = await validateEmailAsync(val);
                      setErrors(prev => {
                        const next = { ...prev };
                        if (err) next.email = err;
                        else delete next.email;
                        return next;
                      });
                    }}
                    className={`${getFieldClass('email')} h-12 rounded-md`}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700">Nomor Telepon (WA Aktif)</Label>
                  {errors.phone && <p className="text-sm text-red-600 mb-1">{errors.phone}</p>}
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={async (e) => {
                      const val = (e.currentTarget as HTMLInputElement).value;
                      const err = await validatePhoneAsync(val);
                      setErrors(prev => {
                        const next = { ...prev };
                        if (err) next.phone = err;
                        else delete next.phone;
                        return next;
                      });
                    }}
                    className={`${getFieldClass('phone')} h-12 rounded-md`}
                  />
                </div>
              </div>

              {/* Tanggal Lahir */}
              <div>
                <Label htmlFor="birthDate" className="text-gray-700">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="mt-2 h-12 rounded-md"
                />
              </div>

              <div className="grid md:grid-cols-1 gap-5">
                <div>
  <Label className="text-gray-700">Kewarganegaraan</Label>

  {/* Radio options */}
  <div className="flex items-center gap-6 mt-2">
  {/* INDONESIA */}
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="radio"
      name="citizenship"
      value="Indonesia"
      checked={formData.citizenship === "Indonesia"}
      onChange={(e) =>
        setFormData({ ...formData, citizenship: e.target.value })
      }
      className="hidden"
    />

    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition
        ${
          formData.citizenship === "Indonesia"
            ? "border-blue-500"
            : "border-gray-300"
        }
      `}
    >
      {formData.citizenship === "Indonesia" && (
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
      )}
    </span>

    <span className="text-sm text-gray-700">Indonesia</span>
  </label>

  {/* LAINNYA */}
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="radio"
      name="citizenship"
      value="Other"
      checked={formData.citizenship !== "Indonesia" && formData.citizenship !== ""}
      onChange={() =>
        setFormData({ ...formData, citizenship: "" })
      }
      className="hidden"
    />

    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition
        ${
          formData.citizenship !== "Indonesia" && formData.citizenship !== ""
            ? "border-blue-500"
            : "border-gray-300"
        }
      `}
    >
      {formData.citizenship !== "Indonesia" && formData.citizenship !== "" && (
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
      )}
    </span>

    <span className="text-sm text-gray-700">Lainnya</span>
  </label>

  {/* INPUT CUSTOM */}
  {formData.citizenship !== "Indonesia" && (
    <input
      type="text"
      placeholder="Ketik kewarganegaraan lain"
      value={formData.citizenship}
      onChange={(e) =>
        setFormData({ ...formData, citizenship: e.target.value })
      }
      className="border border-gray-300 rounded-md px-3 py-2 text-sm h-10"
    />
  )}
</div>

</div>


                <div>
                  <Label htmlFor="motherName" className="text-gray-700">Nama Ibu Kandung</Label>
                  <Input
                    id="motherName"
                    required
                    placeholder="Masukkan nama ibu kandung"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                  <Label htmlFor="kontakDaruratNama" className="text-gray-700">Nama Kontak Darurat</Label>
                  <Input
                    id="kontakDaruratNama"
                    required
                    placeholder="Nama kerabat dekat"
                    value={formData.kontakDaruratNama}
                    onChange={(e) => setFormData({ ...formData, kontakDaruratNama: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="kontakDaruratHp" className="text-gray-700">Nomor Kontak Darurat</Label>
                  <Input
                    id="kontakDaruratHp"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.kontakDaruratHp}
                    onChange={(e) => setFormData({ ...formData, kontakDaruratHp: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>

            </div>
          </div>

              <div>
                              <Label htmlFor="address" className="text-gray-700">Alamat Lengkap</Label>
                              <Textarea
                                id="address"
                                required
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="mt-2"
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
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-gray-700">Kota/Kabupaten</Label>
                  <Input
                    id="city"
                    required
                    placeholder="Nama Kota"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-2 h-12 rounded-md"
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
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Sekolah */}
          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Informasi Sekolah</h3>
            <div className="space-y-5">
              
              <div>
                <Label htmlFor="tempatBekerja" className="text-gray-700">Nama Sekolah / Instansi</Label>
                <Input
                  id="tempatBekerja"
                  placeholder="Nama sekolah"
                  value={formData.tempatBekerja}
                  onChange={(e) => setFormData({ ...formData, tempatBekerja: e.target.value })}
                  className="mt-2 h-12 rounded-md"
                />
              </div>

              <div>
                <Label htmlFor="alamatKantor" className="text-gray-700">Alamat Sekolah</Label>
                <Textarea
                  id="alamatKantor"
                  placeholder="Alamat lengkap sekolah"
                  value={formData.alamatKantor}
                  onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
                  className="mt-2 rounded-md"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
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
                      <SelectItem value="orang-tua">Orang Tua</SelectItem>
                      <SelectItem value="beasiswa">Beasiswa</SelectItem>
                      <SelectItem value="tabungan-pribadi">Tabungan Pribadi</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <SelectItem value="tabungan-pendidikan">Tabungan Pendidikan</SelectItem>
                      <SelectItem value="transaksi">Transaksi Sehari-hari</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-4 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-inner border border-green-100">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
              required
              className="mt-1"
            />
            <div>
              <Label htmlFor="terms" className="cursor-pointer text-gray-800 font-medium">
                Saya menyetujui <button type="button" onClick={() => setShowTermsModal(true)} className="text-emerald-700 hover:underline font-bold">Syarat dan Ketentuan</button>
              </Label>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Dengan mencentang kotak ini, saya menyatakan bahwa semua data yang saya berikan adalah benar dan saya bertanggung jawab penuh atas kebenaran data tersebut.
              </p>
            </div>
          </div>

          <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
      )}
    </div>
  );
}
