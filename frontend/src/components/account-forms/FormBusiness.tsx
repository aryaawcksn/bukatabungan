import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Upload } from "../Upload";
import type { AccountFormProps } from './types';
import TermsModal from '../TermsModal';

interface FormBusinessProps extends AccountFormProps {
  currentStep?: number;
}

export default function FormBusiness({
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
}: FormBusinessProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* STEP 1: PILIH CABANG */}
      {currentStep === 1 && (
        <div>
          <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Pilih Lokasi Cabang</h3>
          <p className="text-slate-500 mb-6">Silakan pilih kantor cabang Bank Sleman terdekat untuk pengambilan buku tabungan dan kartu debit bisnis Anda.</p>
          
          <div className="bg-slate-50 p-6 rounded-md border border-slate-100">
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
              <SelectTrigger className={`h-12 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 ${errors.cabang_pengambilan ? 'border-red-500' : ''}`}>
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
            <p className="text-xs text-slate-500 mt-3">
              *Pastikan Anda dapat mengunjungi cabang ini pada jam operasional.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: DATA DIRI & UPLOAD */}
      {currentStep === 2 && (
        <div className="space-y-8">
          
          {/* Upload Section */}
          <div>
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Dokumen Identitas Penanggung Jawab</h3>
            <div className="grid md:grid-cols-1 gap-6">
              {/* ===== Upload Foto KTP ===== */}
              <div>
                {errors.ktp && <p className="text-red-600 text-sm mb-1">{errors.ktp}</p>}
                {!ktpFile && !ktpPreview ? (
                  <Upload
                    label="Foto KTP Penanggung Jawab"
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
                      alt="KTP Preview"
                      className="w-full h-48 object-cover shadow-md"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-medium"
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

          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Data Penanggung Jawab</h3>
            <div className="space-y-5">

              {/* Nama Lengkap */}
              <div>
                <Label htmlFor="fullName" className="text-gray-700">Nama Lengkap (Sesuai KTP)</Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2 h-12"
                />
              </div>

              {/* NIK */}
              <div>
                <Label htmlFor="nik" className="text-gray-700">NIK</Label>
                {errors.nik && <p className="text-sm text-red-600 mb-1">{errors.nik}</p>}
                <Input
                  id="nik"
                  required
                  placeholder="16 digit NIK"
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
                  className={`${getFieldClass('nik')} h-12`}
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
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-700">Jabatan</Label>
                  <Input
                    placeholder="Contoh: Direktur / Pemilik"
                    value={formData.employmentStatus} // Using employmentStatus to store Jabatan for business
                    onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email Bisnis</Label>
                  {errors.email && <p className="text-sm text-red-600 mb-1">{errors.email}</p>}
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="email@bisnis.com"
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
                    className={`${getFieldClass('email')} h-12`}
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
                    className={`${getFieldClass('phone')} h-12`}
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
                  className="mt-2 h-12"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="citizenship" className="text-gray-700">Kewarganegaraan</Label>
                  <Input
                    id="citizenship"
                    required
                    placeholder="Contoh: Indonesia"
                    value={formData.citizenship}
                    onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>

                <div>
                  <Label htmlFor="motherName" className="text-gray-700">Nama Ibu Kandung</Label>
                  <Input
                    id="motherName"
                    required
                    placeholder="Masukkan nama ibu kandung"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="mt-2 h-12"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DATA USAHA & ALAMAT */}
      {currentStep === 3 && (
        <div className="space-y-8">
          
          {/* Alamat */}
          <div>
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Alamat Usaha</h3>
            <div className="space-y-5">
              <div>
                <Label htmlFor="address" className="text-gray-700">Alamat Lengkap Usaha</Label>
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
                    className="mt-2 h-12"
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
                    className="mt-2 h-12"
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
                    className="mt-2 h-12"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Usaha */}
          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Informasi Usaha</h3>
            <div className="space-y-5">
              
              <div>
                <Label htmlFor="tempatBekerja" className="text-gray-700">Nama Usaha / Perusahaan</Label>
                <Input
                  id="tempatBekerja"
                  placeholder="Nama usaha"
                  value={formData.tempatBekerja}
                  onChange={(e) => setFormData({ ...formData, tempatBekerja: e.target.value })}
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="alamatKantor" className="text-gray-700">Bidang Usaha</Label>
                <Input
                  id="alamatKantor"
                  placeholder="Contoh: Perdagangan, Jasa, Manufaktur"
                  value={formData.alamatKantor} // Using alamatKantor to store Bidang Usaha temporarily or add new field
                  onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
                  className="mt-2 h-12"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="monthlyIncome" className="text-gray-700">Omset per Bulan</Label>
                  <Select
                    value={formData.monthlyIncome}
                    onValueChange={(value) => setFormData({ ...formData, monthlyIncome: value })}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Pilih omset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below10">&lt; Rp 10.000.000</SelectItem>
                      <SelectItem value="10-50jt">Rp 10.000.000 - Rp 50.000.000</SelectItem>
                      <SelectItem value="50-100jt">Rp 50.000.000 - Rp 100.000.000</SelectItem>
                      <SelectItem value="above100">&gt; Rp 100.000.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tujuanRekening" className="text-gray-700">Tujuan Pembukaan Rekening</Label>
                  <Select
                    value={formData.tujuanRekening}
                    onValueChange={(value) => setFormData({ ...formData, tujuanRekening: value })}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Pilih tujuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operasional">Operasional Usaha</SelectItem>
                      <SelectItem value="investasi">Investasi Bisnis</SelectItem>
                      <SelectItem value="simpanan">Simpanan Usaha</SelectItem>
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
