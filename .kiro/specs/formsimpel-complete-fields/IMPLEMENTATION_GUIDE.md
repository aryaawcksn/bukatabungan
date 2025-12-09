# Implementation Guide - FormSimpel Step Restructure

## 🎯 Goal

Mengubah FormSimpel dari struktur 3-step menjadi 5-step yang lebih profesional dan user-friendly.

## ✅ Step 1: Pilih Cabang (DONE)

Step 1 sudah diimplementasikan dengan design baru yang mencakup:
- Header dengan icon lokasi
- Card dengan border yang lebih prominent
- Dropdown dengan styling yang lebih baik
- Info text yang lebih jelas
- Error handling yang lebih visual

## 🔄 Step 2: Data Diri Nasabah (TO DO)

### Struktur yang Harus Dibuat:

```tsx
{currentStep === 2 && (
  <div className="space-y-8">
    {/* Header */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Data Diri Nasabah</h3>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Lengkapi data diri Anda sesuai dengan dokumen identitas resmi.
      </p>
    </div>

    {/* Section 1: Identitas Diri */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
        Identitas Diri
      </h4>
      <div className="space-y-5">
        {/* Nama Lengkap */}
        {/* Alias */}
        {/* Jenis Identitas & Nomor */}
        {/* Masa Berlaku */}
        {/* Tempat & Tanggal Lahir */}
        {/* Gender, Marital, Agama */}
        {/* Pendidikan & Nama Ibu */}
      </div>
    </div>

    {/* Section 2: Kontak */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
        Informasi Kontak
      </h4>
      <div className="space-y-5">
        {/* Email & Phone */}
        {/* Kewarganegaraan */}
      </div>
    </div>

    {/* Section 3: Alamat */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">3</span>
        Alamat Tempat Tinggal
      </h4>
      <div className="space-y-5">
        {/* Alamat Lengkap */}
        {/* Provinsi, Kota, Kode Pos */}
        {/* Status Rumah & Alamat Domisili */}
      </div>
    </div>

    {/* Section 4: Kontak Darurat (Optional) */}
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="font-semibold text-emerald-800 text-lg">Kontak Darurat</h4>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Opsional</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Jika diisi, harap lengkapi semua field. Kontak darurat akan dihubungi jika terjadi hal penting terkait rekening Anda.
      </p>
      <div className="grid md:grid-cols-3 gap-5">
        {/* Nama, Hubungan, Nomor HP */}
      </div>
    </div>
  </div>
)}
```

## 🔄 Step 3: Data Pekerjaan & Keuangan (TO DO)

### Struktur yang Harus Dibuat:

```tsx
{currentStep === 3 && (
  <div className="space-y-8">
    {/* Header */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Data Pekerjaan & Keuangan</h3>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Informasi ini diperlukan untuk proses verifikasi dan keamanan rekening Anda.
      </p>
    </div>

    {/* Section 1: Informasi Pekerjaan */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
        Informasi Pekerjaan
      </h4>
      <div className="space-y-5">
        {/* Pekerjaan & Penghasilan */}
        {/* Nama Sekolah/Perusahaan & Kelas/Jabatan */}
        {/* Alamat & Telepon Sekolah/Kantor */}
        {/* Bidang Usaha */}
      </div>
    </div>

    {/* Section 2: Informasi Keuangan */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
        Informasi Keuangan
      </h4>
      <div className="space-y-5">
        {/* Sumber Dana */}
        {/* Rata-rata Transaksi */}
      </div>
    </div>

    {/* Section 3: Kontak Referensi (Optional) */}
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="font-semibold text-emerald-800 text-lg">Kontak Referensi</h4>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Opsional</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Jika diisi, harap lengkapi semua field. Kontak referensi dapat membantu proses verifikasi.
      </p>
      <div className="grid md:grid-cols-2 gap-5">
        {/* Nama & Telepon */}
        {/* Alamat & Hubungan */}
      </div>
    </div>
  </div>
)}
```

## 🔄 Step 4: Data Rekening (TO DO)

### Struktur yang Harus Dibuat:

```tsx
{currentStep === 4 && (
  <div className="space-y-8">
    {/* Header */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </div>
      <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Konfigurasi Rekening</h3>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Tentukan detail rekening tabungan SimPel Anda.
      </p>
    </div>

    {/* Section 1: Konfigurasi Rekening */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
        Detail Rekening
      </h4>
      <div className="space-y-5">
        {/* Jenis Rekening (read-only) */}
        {/* Nominal Setoran Awal */}
        {/* Tujuan Pembukaan Rekening */}
      </div>
    </div>

    {/* Section 2: Kepemilikan Rekening */}
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200">
      <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
        Kepemilikan Rekening
      </h4>
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <Label className="text-gray-800 font-semibold mb-4 block text-lg">
          Apakah rekening ini untuk Anda sendiri?
        </Label>
        <div className="flex items-center gap-6 flex-wrap">
          {/* Radio buttons */}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Informasi Beneficial Owner diperlukan jika rekening ini untuk orang lain.
        </p>
      </div>
    </div>

    {/* Section 3: Beneficial Owner (Conditional) */}
    {formData.rekeningUntukSendiri === false && (
      <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
            <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-xl">Informasi Beneficial Owner</h4>
            <p className="text-sm text-amber-800 mt-1">Wajib diisi karena rekening untuk orang lain</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-6 bg-white p-4 rounded-lg">
          Beneficial Owner adalah pemilik sebenarnya atau penerima manfaat dari rekening yang dibuka. 
          Karena rekening ini untuk orang lain, mohon lengkapi informasi pemilik manfaat yang sebenarnya.
        </p>
        <div className="space-y-5">
          {/* All BO fields */}
        </div>
      </div>
    )}
  </div>
)}
```

## ⏳ Step 5: Review & Persetujuan (NEW - TO DO)

### Struktur yang Harus Dibuat:

```tsx
{currentStep === 5 && (
  <div className="space-y-8">
    {/* Header */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Review & Persetujuan</h3>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Periksa kembali data Anda sebelum mengirim permohonan pembukaan rekening.
      </p>
    </div>

    {/* Ringkasan Data */}
    <div className="space-y-4">
      {/* 1. Data Cabang */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg">📍 Lokasi Cabang</h4>
          <button 
            type="button"
            onClick={() => {/* Navigate to step 1 */}}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="text-gray-700">
          <p className="font-medium">{/* Branch name */}</p>
        </div>
      </div>

      {/* 2. Data Diri */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg">👤 Data Diri Nasabah</h4>
          <button 
            type="button"
            onClick={() => {/* Navigate to step 2 */}}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nama Lengkap</p>
            <p className="font-medium text-gray-800">{formData.fullName}</p>
          </div>
          <div>
            <p className="text-gray-500">NIK</p>
            <p className="font-medium text-gray-800">{formData.nik}</p>
          </div>
          {/* More fields... */}
        </div>
      </div>

      {/* 3. Data Pekerjaan & Keuangan */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg">💼 Data Pekerjaan & Keuangan</h4>
          <button 
            type="button"
            onClick={() => {/* Navigate to step 3 */}}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {/* Fields... */}
        </div>
      </div>

      {/* 4. Data Rekening */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800 text-lg">💳 Data Rekening</h4>
          <button 
            type="button"
            onClick={() => {/* Navigate to step 4 */}}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {/* Fields... */}
        </div>
        
        {/* Show BO if exists */}
        {formData.rekeningUntukSendiri === false && formData.boNama && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-gray-500 font-medium mb-2">Beneficial Owner</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {/* BO fields... */}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Persetujuan */}
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-200">
      <h4 className="font-bold text-emerald-900 text-xl mb-6">Persetujuan</h4>
      
      {/* Terms & Conditions */}
      <div className="flex items-start gap-4 mb-4">
        <Checkbox
          id="terms"
          checked={formData.agreeTerms}
          onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
          required
          className="mt-1"
        />
        <div>
          <Label htmlFor="terms" className="cursor-pointer text-gray-800 font-medium text-base">
            Saya menyetujui <button type="button" onClick={() => setShowTermsModal(true)} className="text-emerald-700 hover:underline font-bold">Syarat dan Ketentuan</button>
          </Label>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Dengan mencentang kotak ini, saya menyatakan bahwa semua data yang saya berikan adalah benar dan saya bertanggung jawab penuh atas kebenaran data tersebut.
          </p>
        </div>
      </div>

      {/* BO Approval if exists */}
      {formData.rekeningUntukSendiri === false && (
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-amber-200">
          <Checkbox
            id="boApproval"
            checked={formData.boPersetujuan}
            onCheckedChange={(checked) => setFormData({ ...formData, boPersetujuan: checked as boolean })}
            required
            className="mt-1"
          />
          <div>
            <Label htmlFor="boApproval" className="cursor-pointer text-gray-800 font-medium text-base">
              Persetujuan Beneficial Owner
            </Label>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Saya menyatakan bahwa informasi beneficial owner yang saya berikan adalah benar dan akurat.
            </p>
          </div>
        </div>
      )}
    </div>

    {/* Submit Button */}
    <div className="flex justify-center pt-4">
      <button
        type="submit"
        disabled={!formData.agreeTerms || (formData.rekeningUntukSendiri === false && !formData.boPersetujuan)}
        className="px-12 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        🚀 Kirim Permohonan
      </button>
    </div>
  </div>
)}
```

## 🎨 Color Scheme per Step

- **Step 1 (Cabang):** Emerald/Green
- **Step 2 (Data Diri):** Blue
- **Step 3 (Pekerjaan):** Purple
- **Step 4 (Rekening):** Green
- **Step 5 (Review):** Emerald

## 📝 Implementation Checklist

### Phase 1: Restructure Existing Steps
- [ ] Update Step 1 (Cabang) - DONE
- [ ] Restructure Step 2 (Data Diri) dengan 4 sub-sections
- [ ] Restructure Step 3 (Pekerjaan) dengan 3 sub-sections
- [ ] Restructure Step 4 (Rekening) dengan 3 sub-sections

### Phase 2: Create New Step
- [ ] Create Step 5 (Review & Persetujuan)
- [ ] Add navigation to edit from review
- [ ] Add data summary display
- [ ] Add final approval checkboxes

### Phase 3: Update Parent Component
- [ ] Update AccountForm.tsx to handle 5 steps
- [ ] Update step navigation logic
- [ ] Update progress indicator
- [ ] Update validation per step

### Phase 4: Testing
- [ ] Test navigation between steps
- [ ] Test validation per step
- [ ] Test data persistence
- [ ] Test conditional BO display
- [ ] Test review & edit functionality
- [ ] Test final submission

## 🚀 Benefits of New Structure

1. **Better UX**
   - Clear progress indication
   - Logical grouping of fields
   - Less overwhelming per step
   - Easy to navigate back and edit

2. **Better Validation**
   - Per-step validation
   - Clear error messages
   - User can focus on one section at a time

3. **Professional Look**
   - Modern design
   - Consistent styling
   - Trust-building UI
   - Matches banking standards

4. **Maintainability**
   - Organized code structure
   - Easy to add/remove fields
   - Clear separation of concerns
   - Better debugging

## 📞 Next Steps

1. Review this implementation guide
2. Approve the structure
3. Start implementing step by step
4. Test each step before moving to next
5. Final integration testing
