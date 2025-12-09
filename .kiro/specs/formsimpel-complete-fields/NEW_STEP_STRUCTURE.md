# Struktur Step Baru untuk FormSimpel

## 🎯 Overview

Restrukturisasi FormSimpel menjadi 5 step yang lebih profesional dan sesuai standar perbankan digital.

## 📋 Struktur Step

### ✅ STEP 1: Pilih Cabang
**Tujuan:** Menentukan lokasi pengambilan buku tabungan

**Konten:**
- Header dengan icon lokasi
- Dropdown pilihan cabang
- Informasi status cabang (aktif/tidak tersedia)
- Info text tentang pengambilan buku tabungan

**Validasi:**
- Cabang harus dipilih
- Cabang harus aktif

---

### ✅ STEP 2: Data Diri Nasabah
**Tujuan:** Mengumpulkan informasi identitas lengkap nasabah

**Dibagi menjadi 4 Sub-section:**

#### 📌 Section 1: Identitas Diri
- Nama Lengkap (sesuai KTP) *
- Nama Panggilan / Alias
- Jenis Identitas (KTP/KIA, Paspor, Lainnya) *
- Nomor Identitas (NIK/KIA/Paspor) *
- Masa Berlaku Identitas
- Tempat Lahir *
- Tanggal Lahir *
- Jenis Kelamin *
- Status Pernikahan *
- Agama *
- Pendidikan Terakhir *
- Nama Ibu Kandung *

#### 📌 Section 2: Kontak
- Email *
- Nomor Telepon (WA Aktif) *
- Kewarganegaraan *

#### 📌 Section 3: Alamat
- Alamat Lengkap (Jalan, RT/RW) *
- Provinsi *
- Kota/Kabupaten *
- Kode Pos *
- Status Tempat Tinggal *
- Alamat Domisili (jika berbeda)

#### 📌 Section 4: Kontak Darurat (Opsional)
- Nama
- Hubungan
- Nomor HP

**Catatan:** Jika salah satu field kontak darurat diisi, semua harus diisi.

---

### ✅ STEP 3: Data Pekerjaan & Keuangan
**Tujuan:** Mengumpulkan informasi finansial untuk KYC

**Dibagi menjadi 2 Sub-section:**

#### 📌 Section 1: Informasi Pekerjaan
- Pekerjaan * (default: Pelajar/Mahasiswa untuk SimPel)
- Penghasilan/Gaji per Bulan *
- Nama Sekolah/Universitas atau Perusahaan
- Kelas/Jurusan atau Jabatan
- Alamat Sekolah/Universitas atau Kantor
- Telepon Sekolah/Universitas atau Kantor
- Bidang Usaha (jika bekerja)

#### 📌 Section 2: Informasi Keuangan
- Sumber Dana *
- Rata-rata Transaksi per Bulan *

#### 📌 Section 3: Kontak Referensi (Opsional)
- Nama Lengkap
- Nomor Telepon
- Alamat
- Hubungan

**Catatan:** Jika salah satu field referensi diisi, semua harus diisi.

---

### ✅ STEP 4: Data Rekening
**Tujuan:** Konfigurasi rekening dan beneficial owner

**Dibagi menjadi 3 Sub-section:**

#### 📌 Section 1: Konfigurasi Rekening
- Jenis Rekening (read-only: SimPel)
- Nominal Setoran Awal * (min Rp 5.000)
- Tujuan Pembukaan Rekening *
- Tujuan Lainnya (jika pilih "Lainnya")

#### 📌 Section 2: Kepemilikan Rekening
**Pertanyaan:** "Apakah rekening ini untuk Anda sendiri?"
- ✅ Ya, untuk saya sendiri
- ❌ Tidak, untuk orang lain

#### 📌 Section 3: Beneficial Owner (Conditional)
**Muncul jika:** Rekening untuk orang lain (rekeningUntukSendiri === false)

**Fields:**
- Nama Lengkap Beneficial Owner *
- Alamat Lengkap *
- Tempat Lahir *
- Tanggal Lahir *
- Jenis Identitas *
- Nomor Identitas *
- Pekerjaan *
- Pendapatan per Tahun *
- ☑️ Persetujuan Beneficial Owner *

---

### ✅ STEP 5: Review & Persetujuan
**Tujuan:** Review data dan persetujuan final

**Konten:**

#### 📌 Section 1: Ringkasan Data
**Tampilkan semua data yang telah diisi dalam format card/accordion:**

1. **Data Cabang**
   - Cabang yang dipilih

2. **Data Diri**
   - Identitas
   - Kontak
   - Alamat
   - Kontak Darurat (jika ada)

3. **Data Pekerjaan & Keuangan**
   - Informasi Pekerjaan
   - Informasi Keuangan
   - Kontak Referensi (jika ada)

4. **Data Rekening**
   - Konfigurasi Rekening
   - Kepemilikan Rekening
   - Beneficial Owner (jika ada)

#### 📌 Section 2: Persetujuan
- ☑️ Saya menyetujui Syarat dan Ketentuan *
- ☑️ Persetujuan Beneficial Owner * (jika ada BO)
- Info text: "Dengan mencentang kotak ini, saya menyatakan bahwa semua data yang saya berikan adalah benar..."

#### 📌 Section 3: Tombol Submit
- Button "Kirim Permohonan" (primary, large)
- Loading state saat submit

---

## 🎨 Design Guidelines

### Header untuk Setiap Step
```tsx
<div className="text-center mb-8">
  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[color]-100 mb-4">
    {/* Icon SVG */}
  </div>
  <h3 className="text-emerald-900 mb-3 text-3xl font-bold">[Step Title]</h3>
  <p className="text-slate-600 max-w-2xl mx-auto">
    [Step Description]
  </p>
</div>
```

### Section Header
```tsx
<h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
    [Number]
  </span>
  [Section Title]
</h4>
```

### Card Container
```tsx
<div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
  {/* Content */}
</div>
```

### Optional Section
```tsx
<div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
  <div className="flex items-center gap-2 mb-4">
    <h4 className="font-semibold text-emerald-800">[Title]</h4>
    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Opsional</span>
  </div>
  <p className="text-xs text-gray-500 mb-4">Jika diisi, harap lengkapi semua field</p>
  {/* Fields */}
</div>
```

### Conditional Section (BO)
```tsx
{formData.rekeningUntukSendiri === false && (
  <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
    <div className="flex items-center gap-2 mb-4">
      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
        {/* Warning icon */}
      </svg>
      <h4 className="font-bold text-amber-900">[Title]</h4>
    </div>
    {/* Fields */}
  </div>
)}
```

## 🔄 Navigation Flow

```
Step 1 (Cabang) 
  ↓ [Lanjut]
Step 2 (Data Diri)
  ↓ [Lanjut] | [Kembali]
Step 3 (Pekerjaan & Keuangan)
  ↓ [Lanjut] | [Kembali]
Step 4 (Data Rekening)
  ↓ [Lanjut] | [Kembali]
Step 5 (Review & Persetujuan)
  ↓ [Kirim Permohonan] | [Kembali]
Success Page / Modal
```

## ✅ Validation Rules

### Step 1
- Cabang harus dipilih
- Cabang harus aktif

### Step 2
- Semua field required (*) harus diisi
- NIK/Email/Phone harus unique (async validation)
- Format NIK/Paspor harus valid
- Usia minimal 17 tahun
- Jika kontak darurat diisi, semua field harus lengkap

### Step 3
- Semua field required (*) harus diisi
- Jika kontak referensi diisi, semua field harus lengkap

### Step 4
- Nominal setoran minimal Rp 5.000
- Jika rekening untuk orang lain, BO harus diisi lengkap
- Jika BO diisi, persetujuan BO harus dicentang

### Step 5
- Syarat dan ketentuan harus disetujui
- Jika ada BO, persetujuan BO harus dicentang

## 📱 Responsive Design

- Mobile: Stack semua field vertikal
- Tablet: 2 kolom untuk field yang sesuai
- Desktop: Max width 1200px, centered

## 🎯 Benefits

1. **User Experience**
   - Lebih mudah dipahami
   - Progress jelas
   - Tidak overwhelming

2. **Validation**
   - Per-step validation
   - Error handling lebih baik
   - User bisa fokus per section

3. **Maintenance**
   - Kode lebih terorganisir
   - Mudah di-debug
   - Mudah ditambah/dikurangi field

4. **Professional**
   - Sesuai standar perbankan
   - UI/UX modern
   - Trustworthy

## 🚀 Implementation Priority

1. ✅ Step 1 - Sudah diimplementasikan dengan design baru
2. 🔄 Step 2 - Perlu restructure dengan 4 sub-sections
3. 🔄 Step 3 - Perlu restructure dengan 3 sub-sections
4. 🔄 Step 4 - Perlu restructure dengan 3 sub-sections
5. ⏳ Step 5 - Perlu dibuat dari awal (Review & Persetujuan)

## 📝 Notes

- Step 2 (upload KTP) dihapus karena tidak ada implementasi upload
- Semua validation functions tetap dipertahankan
- Beneficial Owner tetap conditional (muncul jika untuk orang lain)
- Design mengikuti prinsip Material Design dan best practices perbankan digital
