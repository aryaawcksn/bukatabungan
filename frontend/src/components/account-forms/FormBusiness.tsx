import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Upload } from "../Upload";
import type { AccountFormProps } from './types';

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
  selfieFile,
  setSelfieFile,
  selfiePreview,
  setSelfiePreview,
  selfieUrl,
  setSelfieUrl,
  loadingSubmit,
  handleSubmit,
  getSavingsTypeName,
  branches = [],
}: AccountFormProps) {

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Data Pribadi */}
      <div>
        <h3 className="text-emerald-900 mb-6 text-2xl">Data Pribadi (Bisnis)</h3>
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
              className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
            />
          </div>

          {/* NIK */}
          <div>
            <Label htmlFor="nik" className="text-gray-700">NIK (Nomor Induk Kependudukan)</Label>
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
              className={getFieldClass('nik')}
            />
          </div>

          {/* Gender + Marital Status */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Jenis Kelamin */}
            <div>
              <Label className="text-gray-700">Jenis Kelamin</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 rounded">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Pernikahan */}
            <div>
              <Label className="text-gray-700">Status Pernikahan</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}
              >
                <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 rounded">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                  <SelectItem value="Menikah">Menikah</SelectItem>
                  <SelectItem value="Cerai">Cerai</SelectItem>
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
                className={getFieldClass('email')}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700">Nomor Telepon (Digunakan untuk OTP)</Label>
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
                className={getFieldClass('phone')}
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
              className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5">

            {/* Kewarganegaraan */}
            <div>
              <Label htmlFor="citizenship" className="text-gray-700">Kewarganegaraan</Label>
              <Input
                id="citizenship"
                required
                placeholder="Contoh: Indonesia"
                value={formData.citizenship}
                onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                className="mt-2 border-gray-200 focus:border-emerald-500 rounded"
              />
            </div>

            {/* Nama Ibu Kandung */}
            <div>
              <Label htmlFor="motherName" className="text-gray-700">Nama Ibu Kandung</Label>
              <Input
                id="motherName"
                required
                placeholder="Masukkan nama ibu kandung"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="mt-2 border-gray-200 focus:border-emerald-500 rounded"
              />
            </div>

            <div>
              <Label htmlFor="kontakDaruratNama" className="text-gray-700">Nama Kontak Darurat</Label>
              <Input
                id="kontakDaruratNama"
                required
                placeholder="Masukkan nama kontak"
                value={formData.kontakDaruratNama}
                onChange={(e) => setFormData({ ...formData, kontakDaruratNama: e.target.value })}
                className="mt-2 border-gray-200 focus:border-emerald-500 rounded"
              />
            </div>

            <div>
              <Label htmlFor="kontakDaruratHp" className="text-gray-700">Nomor Kontak Darurat</Label>
              <Input
                id="kontakDaruratHp"
                required
                placeholder="Masukan nomor hp kontak"
                value={formData.kontakDaruratHp}
                onChange={(e) => setFormData({ ...formData, kontakDaruratHp: e.target.value })}
                className="mt-2 border-gray-200 focus:border-emerald-500 rounded"
              />
            </div>
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
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Informasi Pekerjaan */}
      <div className="space-y-5 mt-5">
  <h3 className="text-emerald-900 mb-6 text-2xl">
    Informasi Pekerjaan
  </h3>

  {/* STATUS PEKERJAAN */}
  <div>
    <Label htmlFor="employmentStatus" className="text-gray-700">
      Status Pekerjaan
    </Label>
    <Select
      value={formData.employmentStatus}
      onValueChange={(value) =>
        setFormData({ ...formData, employmentStatus: value })
      }
    >
      <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 rounded">
        <SelectValue placeholder="Pilih status pekerjaan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bekerja">Sudah Bekerja</SelectItem>
        <SelectItem value="tidak-bekerja">Belum Bekerja</SelectItem>
        <SelectItem value="pelajar-mahasiswa">Pelajar / Mahasiswa</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* FORM MUNCUL JIKA BUKAN "tidak-bekerja" */}
  {formData.employmentStatus !== "tidak-bekerja" && (
    <>
      {/* TEMPAT BEKERJA / SEKOLAH */}
      <div>
        <Label htmlFor="tempatBekerja" className="text-gray-700">
          {formData.cardType === "Tabungan Simpel"
            ? "Nama Sekolah"
            : "Tempat Bekerja"}
        </Label>
        <Input
          id="tempatBekerja"
          placeholder={
            formData.cardType === "Tabungan Simpel"
              ? "Nama sekolah"
              : "Nama perusahaan atau instansi"
          }
          value={formData.tempatBekerja}
          onChange={(e) =>
            setFormData({ ...formData, tempatBekerja: e.target.value })
          }
          className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
        />
      </div>

      {/* ALAMAT KANTOR → Hanya jika BUKAN Tabungan Simpel */}
      {formData.cardType !== "Tabungan Simpel" && (
        <div>
          <Label htmlFor="alamatKantor" className="text-gray-700">
            Alamat Kantor
          </Label>
          <Textarea
            id="alamatKantor"
            placeholder="Alamat lengkap kantor"
            value={formData.alamatKantor}
            onChange={(e) =>
              setFormData({ ...formData, alamatKantor: e.target.value })
            }
            className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded"
          />
        </div>
      )}

      {/* RANGE PENGHASILAN — label beda kalau Tabungan Simpel */}
      <div>
        <Label htmlFor="monthlyIncome" className="text-gray-700">
          {formData.cardType === "Tabungan Simpel"
            ? "Penghasilan Orang Tua"
            : "Penghasilan per Bulan"}
        </Label>
        <Select
          value={formData.monthlyIncome}
          onValueChange={(value) =>
            setFormData({ ...formData, monthlyIncome: value })
          }
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
    </>
  )}

  {/* SUMBER DANA */}
  <h3 className="text-emerald-900 mb-6 text-2xl">
    Sumber dana & Tujuan rekening
  </h3>

  <div>
    <Label htmlFor="sumberDana" className="text-gray-700">
      Sumber Dana
    </Label>
    <Select
      value={formData.sumberDana}
      onValueChange={(value) =>
        setFormData({ ...formData, sumberDana: value })
      }
    >
      <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded">
        <SelectValue placeholder="Pilih sumber dana" />
      </SelectTrigger>
      <SelectContent>
        {/* Gaji & Usaha hanya muncul jika tidak-bekerja = false */}
        {formData.employmentStatus !== "tidak-bekerja" && (
          <>
            <SelectItem value="gaji">Gaji</SelectItem>
            <SelectItem value="usaha">Usaha</SelectItem>
          </>
        )}

        <SelectItem value="warisan">Warisan</SelectItem>
        <SelectItem value="orang-tua">Orang Tua</SelectItem>
        <SelectItem value="investasi">Investasi</SelectItem>
        <SelectItem value="lainnya">Lainnya</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* TUJUAN REKENING */}
  <div>
    <Label htmlFor="tujuanRekening" className="text-gray-700">
      Tujuan Pembukaan Rekening
    </Label>
    <Select
      value={formData.tujuanRekening}
      onValueChange={(value) =>
        setFormData({ ...formData, tujuanRekening: value })
      }
    >
      <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded">
        <SelectValue placeholder="Pilih tujuan pembukaan rekening" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="tabungan-personal">Tabungan Pribadi</SelectItem>

        {/* Keperluan bisnis HILANG kalau tidak-bekerja */}
        {formData.employmentStatus !== "tidak-bekerja" && (
          <SelectItem value="bisnis">Keperluan Bisnis</SelectItem>
        )}

        <SelectItem value="investasi">Investasi</SelectItem>
        <SelectItem value="pembayaran">Pembayaran / Transaksi</SelectItem>
        <SelectItem value="lainnya">Lainnya</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>



      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-emerald-900 mb-6 text-2xl">Informasi Kartu</h3>
        <div className="space-y-5">
          <div>
            <Label htmlFor="jenis_rekening" className="text-gray-700">Jenis Kartu</Label>
            <Select
              value={formData.jenis_rekening}
              onValueChange={(value) => setFormData({ ...formData, jenis_rekening: value })}
            >
              <SelectTrigger className="mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded">
                <SelectValue placeholder="Pilih jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Upload Dokumen */}
      {/* ===== Upload Foto KTP ===== */}
      <div className="mb-4">
        {errors.ktp && <p className="text-red-600 text-sm mb-1">{errors.ktp}</p>}
        {!ktpFile && !ktpPreview ? (
          <Upload
            label="Upload Foto KTP"
            description="Format: JPG, PNG (Max. 2MB)"
            onChange={(file) => {
              setKtpFile(file);
              setKtpPreview(URL.createObjectURL(file));
              setKtpUrl(null);
              setErrors(prev => ({ ...prev, ktp: "" })); // reset error
            }}
          />
        ) : (
          <div className="mt-2">
            <img
              src={ktpPreview || ktpUrl!}
              alt="KTP Preview"
              className="mx-auto rounded-xl shadow-md max-h-48"
            />
            <button
              type="button"
              className="mt-2 text-sm text-red-600 hover:underline block mx-auto"
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

      {/* ===== Upload Selfie dengan KTP ===== */}
      <div className="mb-4">
        {errors.selfie && <p className="text-red-600 text-sm mb-1">{errors.selfie}</p>}
        {!selfieFile && !selfiePreview ? (
          <Upload
            label="Upload Selfie dengan KTP"
            description="Format: JPG, PNG (Max. 2MB)"
            onChange={(file) => {
              setSelfieFile(file);
              setSelfiePreview(URL.createObjectURL(file));
              setSelfieUrl(null);
              setErrors(prev => ({ ...prev, selfie: "" })); // reset error
            }}
          />
        ) : (
          <div className="mt-2">
            <img
              src={selfiePreview || selfieUrl!}
              alt="Selfie Preview"
              className="mx-auto rounded-xl shadow-md max-h-48"
            />
            <button
              type="button"
              className="mt-2 text-sm text-red-600 hover:underline block mx-auto"
              onClick={() => {
                setSelfieFile(null);
                setSelfiePreview(null);
                setSelfieUrl(null);
              }}
            >
              Ganti Foto
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-emerald-900 mb-6 text-2xl">Pilih Cabang</h3>
        <Label htmlFor="cabang_pengambilan" className="text-gray-700">Pilih Cabang Pengambilan</Label>
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
          <SelectTrigger className={`mt-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded ${errors.cabang_pengambilan ? 'border-red-500' : ''}`}>
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

      {/* Terms & Conditions */}
      <div className="flex items-start gap-4 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-inner">
        <Checkbox
          id="terms"
          checked={formData.agreeTerms}
          onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
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
        disabled={loadingSubmit}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 py-7 text-lg shadow-lg hover:shadow-xl transition-all"
      >
        {loadingSubmit ? 'Mengirim...' : 'Kirim Permohonan'} {getSavingsTypeName()}
      </Button>
    </form>
  );
}
