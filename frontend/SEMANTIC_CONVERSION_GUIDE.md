# Panduan Konversi ke Semantic HTML - FormSimpel & FormMutiara

## Perubahan yang Perlu Dilakukan

### 1. STEP 1: Pilih Cabang
```tsx
// BEFORE (Non-Semantic)
{currentStep === 1 && (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="inline-flex...">
        {/* Icon */}
      </div>
      <h3>Pilih Lokasi Cabang</h3>
      <p>Silakan pilih kantor cabang...</p>
    </div>
    
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8...">
        <Label>Kantor Cabang</Label>
        <Select>...</Select>
      </div>
    </div>
  </div>
)}

// AFTER (Semantic)
{currentStep === 1 && (
  <section className="space-y-6" aria-labelledby="branch-selection-heading">
    <header className="text-center mb-8">
      <div className="inline-flex...">
        {/* Icon */}
      </div>
      <h3 id="branch-selection-heading" className="text-emerald-900 mb-3 text-3xl font-bold">
        Pilih Lokasi Cabang
      </h3>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Silakan pilih kantor cabang Bank Sleman terdekat untuk pengambilan buku tabungan.
      </p>
    </header>
    
    <div className="max-w-2xl mx-auto">
      <fieldset className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
        <legend className="sr-only">Pilihan Cabang</legend>
        <Label htmlFor="cabang_pengambilan">Kantor Cabang <span className="text-red-500">*</span></Label>
        {errors.cabang_pengambilan && (
          <div role="alert" className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 flex items-center gap-2">
              {/* Error icon */}
              {errors.cabang_pengambilan}
            </p>
          </div>
        )}
        <Select>...</Select>
      </fieldset>
    </div>
  </section>
)}
```

### 2. STEP 2: Data Diri Nasabah
```tsx
// BEFORE (Non-Semantic)
{currentStep === 2 && (
  <div className="space-y-8">
    <div className="text-center mb-8">
      <h3>Data Diri Nasabah</h3>
      <p>Lengkapi data diri Anda...</p>
    </div>

    <div className="bg-white p-6...">
      <h4>Identitas Diri</h4>
      <div className="space-y-5">
        {/* Form fields */}
      </div>
    </div>
  </div>
)}

// AFTER (Semantic)
{currentStep === 2 && (
  <section className="space-y-8" aria-labelledby="personal-data-heading">
    <header className="text-center mb-8">
      <div className="inline-flex...">
        {/* Icon */}
      </div>
      <h3 id="personal-data-heading" className="text-emerald-900 mb-3 text-3xl font-bold">
        Data Diri Nasabah
      </h3>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Lengkapi data diri Anda sesuai dengan dokumen identitas resmi.
      </p>
    </header>

    <article className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
      <header>
        <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
          Identitas Diri
        </h4>
      </header>
      <fieldset className="space-y-5">
        <legend className="sr-only">Informasi Identitas Pribadi</legend>
        {/* Form fields */}
      </fieldset>
    </article>
  </section>
)}
```

### 3. Form Fields dengan Error Messages
```tsx
// BEFORE (Non-Semantic)
<div>
  <Label htmlFor="fullName">Nama Lengkap</Label>
  <Input id="fullName" ... />
  {errors.fullName && <p className="text-red-600">{errors.fullName}</p>}
</div>

// AFTER (Semantic)
<div>
  <Label htmlFor="fullName">
    Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
  </Label>
  <Input 
    id="fullName" 
    aria-required="true"
    aria-invalid={!!errors.fullName}
    aria-describedby={errors.fullName ? "fullName-error" : undefined}
    ... 
  />
  {errors.fullName && (
    <p id="fullName-error" role="alert" className="text-sm text-red-600 mt-1">
      {errors.fullName}
    </p>
  )}
</div>
```

### 4. Address Section (Kontak)
```tsx
// BEFORE (Non-Semantic)
<div className="bg-white p-6...">
  <h4>Alamat Domisili</h4>
  <div className="space-y-5">
    {/* Address fields */}
  </div>
</div>

// AFTER (Semantic)
<article className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
  <header>
    <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
      Alamat Domisili
    </h4>
  </header>
  <fieldset className="space-y-5">
    <legend className="sr-only">Informasi Alamat Lengkap</legend>
    <address className="not-italic">
      {/* Address fields - keep as form inputs, not static text */}
    </address>
  </fieldset>
</article>
```

### 5. Beneficial Owner Section
```tsx
// BEFORE (Non-Semantic)
<div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6...">
  <div className="flex items-start gap-3 mb-4">
    {/* Icon */}
    <div>
      <h5>Beneficial Owner</h5>
      <p>Pemilik manfaat rekening...</p>
    </div>
  </div>
  <div className="space-y-5">
    {/* BO fields */}
  </div>
</div>

// AFTER (Semantic)
<article className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 shadow-sm">
  <header className="flex items-start gap-3 mb-4">
    {/* Icon */}
    <div>
      <h5 className="text-amber-900 font-bold text-lg">Beneficial Owner</h5>
      <p className="text-sm text-amber-700 mt-1">
        Pemilik manfaat rekening (jika rekening bukan untuk diri sendiri)
      </p>
    </div>
  </header>
  <fieldset className="space-y-5">
    <legend className="sr-only">Informasi Beneficial Owner</legend>
    {/* BO fields */}
  </fieldset>
</article>
```

### 6. Terms & Conditions
```tsx
// BEFORE (Non-Semantic)
<div className="flex items-start gap-4 bg-gradient-to-br...">
  <Checkbox id="terms" ... />
  <div>
    <Label htmlFor="terms">
      Saya menyetujui <button onClick={...}>Syarat dan Ketentuan</button>
    </Label>
    <p>Dengan mencentang kotak ini...</p>
  </div>
</div>

// AFTER (Semantic)
<fieldset className="flex items-start gap-4 bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-inner border border-green-100">
  <legend className="sr-only">Persetujuan Syarat dan Ketentuan</legend>
  <Checkbox 
    id="terms" 
    aria-required="true"
    aria-invalid={!!errors.agreeTerms}
    aria-describedby="terms-description"
    ... 
  />
  <div>
    <Label htmlFor="terms" className="cursor-pointer text-gray-800 font-medium">
      Saya menyetujui{' '}
      <button 
        type="button" 
        onClick={() => setShowTermsModal(true)} 
        className="text-emerald-700 hover:underline font-bold"
        aria-label="Buka syarat dan ketentuan"
      >
        Syarat dan Ketentuan
      </button>
    </Label>
    <p id="terms-description" className="text-xs text-gray-600 mt-2 leading-relaxed">
      Dengan mencentang kotak ini, saya menyatakan bahwa semua data yang saya berikan adalah benar.
    </p>
  </div>
</fieldset>
```

### 7. Review Step (Step 5)
```tsx
// BEFORE (Non-Semantic)
<div className="space-y-6">
  <div className="bg-white p-6...">
    <h4>Data Pribadi</h4>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-slate-500">Nama Lengkap</p>
        <p className="font-medium">{formData.fullName}</p>
      </div>
    </div>
  </div>
</div>

// AFTER (Semantic)
<section className="space-y-6" aria-labelledby="review-heading">
  <header className="sr-only">
    <h3 id="review-heading">Review Data Pengajuan</h3>
  </header>
  
  <article className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
    <header>
      <h4 className="text-emerald-800 font-bold text-xl mb-6">Data Pribadi</h4>
    </header>
    <dl className="grid grid-cols-2 gap-4">
      <div>
        <dt className="text-sm text-slate-500">Nama Lengkap</dt>
        <dd className="font-medium">{formData.fullName}</dd>
      </div>
      {/* More data */}
    </dl>
  </article>
</section>
```

## Accessibility Improvements

### ARIA Attributes to Add:
1. **`aria-labelledby`** - Link sections to their headings
2. **`aria-required`** - Mark required fields
3. **`aria-invalid`** - Indicate validation errors
4. **`aria-describedby`** - Link fields to error messages
5. **`role="alert"`** - For error messages
6. **`aria-label`** - For buttons without visible text

### Screen Reader Only Content:
```tsx
// Use for legends and headings that provide context
<legend className="sr-only">Informasi Pribadi</legend>

// CSS for sr-only:
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Summary of Changes

### Replace:
- `<div>` wrapper sections → `<section>` or `<article>`
- `<div>` for headers → `<header>`
- `<div>` for form groups → `<fieldset>` with `<legend>`
- `<div>` for data display → `<dl>`, `<dt>`, `<dd>`
- Error `<p>` → Add `role="alert"`

### Add:
- `aria-labelledby` to sections
- `aria-required` to required inputs
- `aria-invalid` to inputs with errors
- `aria-describedby` linking inputs to errors
- `<legend>` (can be sr-only) to all fieldsets

### Benefits:
✅ Better screen reader navigation
✅ Improved SEO
✅ Clearer document structure
✅ Better accessibility compliance
✅ Easier to maintain and understand
