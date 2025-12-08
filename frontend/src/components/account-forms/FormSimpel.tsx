import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
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
    
  </div>
)}


      {/* STEP 3: DATA LENGKAP */}
      {currentStep === 3 && (
        <div className="space-y-8">
          
          {/* Personal Data */}
          <div>
            <div className="border-t border-slate-100 pt-8">
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Data Diri Lengkap</h3>
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
                  className="mt-2 h-12 rounded-md"
                />
              </div>

               {/* NIK & NPWP */}
               <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="nik" className="text-gray-700">NIK / KIA</Label>
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
                      if(err) setErrors(prev => ({...prev, nik: err}));
                    }}
                    className={`${getFieldClass('nik')} h-12 rounded-md`}
                  />
                  {errors.nik && <p className="text-sm text-red-600 mt-1">{errors.nik}</p>}
                </div>
                <div>
                  <Label htmlFor="npwp" className="text-gray-700">NPWP (Opsional)</Label>
                  <Input
                    id="npwp"
                    placeholder="Nomor NPWP"
                    value={formData.npwp}
                    onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                  <Label htmlFor="tempatLahir" className="text-gray-700">Tempat Lahir</Label>
                  <Input
                    id="tempatLahir"
                    required
                    placeholder="Kota Kelahiran"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
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
              </div>

              {/* Gender + Marital + Agama */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label className="text-gray-700">Jenis Kelamin</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Status Pernikahan</Label>
                  <Select
                    value={formData.maritalStatus}
                    onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Pilih..." />
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
                  <Label className="text-gray-700">Agama</Label>
                  <Select
                    value={formData.agama}
                    onValueChange={(value) => setFormData({ ...formData, agama: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Kristen">Kristen</SelectItem>
                      <SelectItem value="Katolik">Katolik</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Budha">Budha</SelectItem>
                      <SelectItem value="Konghucu">Konghucu</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Pendidikan + Nama Ibu */}
               <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Pendidikan Terakhir</Label>
                  <Select
                    value={formData.pendidikan}
                    onValueChange={(value) => setFormData({ ...formData, pendidikan: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Pilih..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SD">SD</SelectItem>
                      <SelectItem value="SMP">SMP</SelectItem>
                      <SelectItem value="SMA">SMA</SelectItem>
                      <SelectItem value="Diploma">Diploma (D3)</SelectItem>
                      <SelectItem value="Sarjana">Sarjana (S1)</SelectItem>
                      <SelectItem value="Magister">Magister (S2)</SelectItem>
                      <SelectItem value="Doktor">Doktor (S3)</SelectItem>
                      <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="motherName" className="text-gray-700">Nama Ibu Kandung</Label>
                  <Input
                    id="motherName"
                    required
                    placeholder="Nama sesuai KK"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>


              {/* Email + Phone */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
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
                      if(err) setErrors(prev => ({...prev, email: err}));
                    }}
                    className={`${getFieldClass('email')} h-12 rounded-md`}
                  />
                   {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700">Nomor Telepon (WA Aktif)</Label>
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
                      if(err) setErrors(prev => ({...prev, phone: err}));
                    }}
                    className={`${getFieldClass('phone')} h-12 rounded-md`}
                  />
                  {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>
              
              {/* Kewarganegaraan */}
              <div>
                 <Label className="text-gray-700">Kewarganegaraan</Label>
                  <div className="flex items-center gap-6 mt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="citizenship" value="Indonesia" checked={formData.citizenship === "Indonesia"} onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })} className="hidden" />
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.citizenship === "Indonesia" ? "border-blue-500" : "border-gray-300"}`}>
                      {formData.citizenship === "Indonesia" && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </span>
                    <span className="text-sm text-gray-700">Indonesia</span>
                  </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="citizenship" value="Other" checked={formData.citizenship !== "Indonesia" && formData.citizenship !== ""} onChange={() => setFormData({ ...formData, citizenship: "" })} className="hidden" />
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${formData.citizenship !== "Indonesia" && formData.citizenship !== "" ? "border-blue-500" : "border-gray-300"}`}>
                      {formData.citizenship !== "Indonesia" && formData.citizenship !== "" && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </span>
                    <span className="text-sm text-gray-700">Lainnya</span>
                  </label>
                  {formData.citizenship !== "Indonesia" && (
                    <input type="text" placeholder="Ketik kewarganegaraan lain" value={formData.citizenship} onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm h-10" />
                  )}
                </div>
              </div>
              
              {/* Kontak Darurat */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-emerald-800 mb-3">Kontak Darurat</h4>
                  <div className="grid md:grid-cols-3 gap-5">
                     <div>
                      <Label htmlFor="kontakDaruratNama" className="text-gray-700">Nama</Label>
                      <Input
                        id="kontakDaruratNama"
                        required
                        value={formData.kontakDaruratNama}
                        onChange={(e) => setFormData({ ...formData, kontakDaruratNama: e.target.value })}
                        className="mt-2 h-10 rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kontakDaruratHubungan" className="text-gray-700">Hubungan</Label>
                       <Select
                        value={formData.kontakDaruratHubungan}
                        onValueChange={(value) => setFormData({ ...formData, kontakDaruratHubungan: value })}
                      >
                        <SelectTrigger className="mt-2 h-10 rounded-md">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                         <SelectContent>
                          <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                          <SelectItem value="Suami/Istri">Suami/Istri</SelectItem>
                          <SelectItem value="Anak">Anak</SelectItem>
                          <SelectItem value="Saudara Kandung">Saudara Kandung</SelectItem>
                          <SelectItem value="Kerabat Lain">Kerabat Lain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="kontakDaruratHp" className="text-gray-700">Nomor HP</Label>
                      <Input
                        id="kontakDaruratHp"
                        required
                        value={formData.kontakDaruratHp}
                        onChange={(e) => setFormData({ ...formData, kontakDaruratHp: e.target.value })}
                        className="mt-2 h-10 rounded-md"
                      />
                    </div>
                  </div>
              </div>


            </div>
          </div>

              <div>
                 <div className="mb-4">
                 <h4 className="font-bold text-lg text-emerald-900 mb-2">Alamat Sesuai Identitas</h4>
                                <Label htmlFor="address" className="text-gray-700">Alamat Lengkap (Jalan, RT/RW)</Label>
                                <Textarea
                                  id="address"
                                  required
                                  rows={2}
                                  value={formData.address}
                                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                  className="mt-2"
                                />
                 </div>

              <div className="grid md:grid-cols-3 gap-5 mb-4">
                <div>
                  <Label htmlFor="province" className="text-gray-700">Provinsi</Label>
                  <Input
                    id="province"
                    required
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
                    maxLength={5}
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                 <div>
                    <Label className="text-gray-700">Status Tempat Tinggal</Label>
                     <Select
                        value={formData.statusRumah}
                        onValueChange={(value) => setFormData({ ...formData, statusRumah: value })}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-md">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                          <SelectItem value="Milik Orang Tua">Milik Orang Tua</SelectItem>
                          <SelectItem value="Sewa/Kontrak">Sewa/Kontrak</SelectItem>
                          <SelectItem value="Dinas">Rumah Dinas</SelectItem>
                        </SelectContent>
                      </Select>
                 </div>
                 
                 <div>
                    <Label className="text-gray-700">Alamat Domisili</Label>
                    <Input
                       placeholder="Sama dengan KTP (kosongkan jika sama)"
                       value={formData.alamatDomisili}
                       onChange={(e) => setFormData({...formData, alamatDomisili: e.target.value})}
                       className="mt-2 h-12 rounded-md"
                    />
                 </div>
              </div>
              
            </div>
          </div>

          {/* Informasi Pekerjaan */}
          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-emerald-900 mb-6 text-2xl font-bold">Data Pekerjaan & Keuangan</h3>
            <div className="space-y-5">
              
               <div className="grid md:grid-cols-2 gap-5">
                <div>
                   <Label className="text-gray-700">Pekerjaan</Label>
                   <Select
                    value={formData.employmentStatus}
                    onValueChange={(value) => setFormData({ ...formData, employmentStatus: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Pilih Pekerjaan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pelajar-mahasiswa">Pelajar / Mahasiswa</SelectItem>
                      <SelectItem value="karyawan-swasta">Karyawan Swasta</SelectItem>
                      <SelectItem value="pns">PNS / TNI / Polri</SelectItem>
                      <SelectItem value="wiraswasta">Wiraswasta</SelectItem>
                      <SelectItem value="ibu-rumah-tangga">Ibu Rumah Tangga</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700">Penghasilan / Gaji per Bulan</Label>
                   <Select
                    value={formData.monthlyIncome}
                    onValueChange={(value) => setFormData({ ...formData, monthlyIncome: value })}
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-md">
                      <SelectValue placeholder="Range Penghasilan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="< 3 Juta">&lt; 3 Juta</SelectItem>
                      <SelectItem value="3 - 5 Juta">3 - 5 Juta</SelectItem>
                      <SelectItem value="5 - 10 Juta">5 - 10 Juta</SelectItem>
                      <SelectItem value="> 10 Juta">&gt; 10 Juta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
               </div>

              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">Nama Sekolah / Perusahaan</Label>
                    <Input
                      value={formData.tempatBekerja}
                      onChange={(e) => setFormData({ ...formData, tempatBekerja: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
                 <div>
                    <Label className="text-gray-700">Jabatan / Kelas</Label>
                    <Input
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
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
                    <Label className="text-gray-700">Alamat Sekolah / Kantor</Label>
                    <Input
                      value={formData.alamatKantor}
                      onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
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
