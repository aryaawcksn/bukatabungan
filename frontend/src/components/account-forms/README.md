# Sistem Form Dinamis untuk Tabungan

## Overview

Sistem form dinamis ini menggantikan pendekatan sebelumnya yang menggunakan banyak file form terpisah (FormSimpel.tsx, FormMutiara.tsx, dll.) dengan satu form yang dapat dikonfigurasi secara dinamis berdasarkan jenis tabungan.

## Keuntungan Sistem Dinamis

### ✅ Keuntungan:
1. **Maintainability**: Hanya satu file form yang perlu diupdate
2. **Consistency**: UI dan behavior yang konsisten di semua jenis tabungan
3. **Scalability**: Mudah menambah jenis tabungan baru tanpa duplikasi kode
4. **Configuration-driven**: Perubahan field dan validasi hanya perlu update konfigurasi
5. **Reusability**: Komponen field dapat digunakan ulang
6. **Type Safety**: TypeScript memberikan type checking yang baik

### ❌ Kerugian Pendekatan Lama:
1. **Code Duplication**: Banyak kode yang sama di setiap form
2. **Maintenance Overhead**: Perubahan harus dilakukan di banyak file
3. **Inconsistency**: Risiko perbedaan behavior antar form
4. **File Bloat**: Terlalu banyak file yang mirip

## Struktur File

```
account-forms/
├── DynamicForm.tsx          # Form utama yang dinamis
├── FormConfig.ts            # Konfigurasi untuk semua jenis tabungan
├── types.ts                 # Type definitions
├── README.md               # Dokumentasi ini
└── legacy/                 # Form lama (untuk backup)
    ├── FormSimpel.tsx
    ├── FormMutiara.tsx
    └── ...
```

## Cara Menambah Jenis Tabungan Baru

### 1. Update FormConfig.ts

Tambahkan konfigurasi baru di `savingsConfigs`:

```typescript
export const savingsConfigs: Record<string, SavingsTypeConfig> = {
  // ... existing configs
  
  arofah: {
    name: 'arofah',
    displayName: 'Tabungan Arofah',
    description: 'Tabungan syariah dengan sistem bagi hasil',
    steps: [
      {
        title: 'Data Diri',
        sections: [
          {
            title: 'Informasi Personal',
            fields: ['fullName', 'alias', 'nik', 'email', 'phone', ...]
          }
        ]
      },
      // ... more steps
    ],
    fields: [
      ...baseFields,
      // Field khusus Arofah
      {
        name: 'jenisAkad',
        type: 'select',
        label: 'Jenis Akad',
        required: true,
        options: [
          { value: 'mudharabah', label: 'Mudharabah' },
          { value: 'wadiah', label: 'Wadiah' }
        ],
        step: 4,
        section: 'account'
      }
    ],
    defaultValues: {
      jenis_rekening: 'Arofah',
      jenisAkad: 'mudharabah'
    }
  }
};
```

### 2. Tambah Field Khusus (Jika Diperlukan)

Jika jenis tabungan memerlukan field khusus, tambahkan di array `fields`:

```typescript
{
  name: 'fieldKhusus',
  type: 'text',
  label: 'Field Khusus',
  required: true,
  step: 2,
  section: 'personal',
  conditional: {
    field: 'jenisTabungan',
    value: 'arofah'
  }
}
```

### 3. Update Types (Jika Diperlukan)

Jika ada field baru, tambahkan di `AccountFormData` interface:

```typescript
export interface AccountFormData {
  // ... existing fields
  jenisAkad?: string; // Field khusus Arofah
}
```

## Konfigurasi Field

### Field Types

- `text`: Input text biasa
- `email`: Input email dengan validasi
- `tel`: Input telepon
- `select`: Dropdown selection
- `textarea`: Text area multi-line
- `checkbox`: Checkbox
- `number`: Input angka
- `date`: Date picker
- `currency`: Input mata uang (auto-format Rupiah)

### Field Properties

```typescript
interface FieldConfig {
  name: string;                    // Nama field (harus match dengan AccountFormData)
  type: FieldType;                 // Tipe field
  label: string;                   // Label yang ditampilkan
  placeholder?: string;            // Placeholder text
  required?: boolean;              // Apakah wajib diisi
  options?: Array<{               // Untuk select field
    value: string; 
    label: string;
  }>;
  validation?: {                   // Validasi client-side
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  conditional?: {                  // Conditional display
    field: string;                 // Field yang jadi kondisi
    value: any;                    // Value yang harus match
    operator?: 'equals' | 'not_equals' | 'includes' | 'not_includes';
  };
  step?: number;                   // Step mana field ini muncul
  section?: string;                // Grouping dalam step
}
```

### Conditional Fields

Field dapat ditampilkan berdasarkan kondisi field lain:

```typescript
{
  name: 'nomorRekeningLama',
  type: 'text',
  label: 'Nomor Rekening Lama',
  conditional: {
    field: 'tipeNasabah',
    value: 'lama',
    operator: 'equals'
  }
}
```

## Validasi

### Client-side Validation

Validasi dasar dilakukan di client menggunakan HTML5 validation dan custom rules:

```typescript
validation: {
  pattern: '^[0-9]{16}$',    // Regex pattern
  minLength: 16,             // Minimum length
  maxLength: 16,             // Maximum length
  min: 100000,               // Minimum value (untuk number)
  max: 999999999             // Maximum value (untuk number)
}
```

### Server-side Validation

Validasi async untuk uniqueness (NIK, email, phone) dilakukan via API call.

## Customization per Jenis Tabungan

### Default Values

Setiap jenis tabungan dapat memiliki default values:

```typescript
defaultValues: {
  jenis_rekening: 'Simpel',
  employmentStatus: 'pelajar-mahasiswa',
  cardType: 'Tidak Ada'
}
```

### Step Configuration

Setiap jenis tabungan dapat memiliki step yang berbeda:

```typescript
steps: [
  {
    title: 'Data Diri',
    description: 'Masukkan informasi personal Anda',
    sections: [
      {
        title: 'Informasi Dasar',
        fields: ['fullName', 'nik', 'email']
      },
      {
        title: 'Informasi Tambahan', 
        fields: ['birthDate', 'gender', 'maritalStatus']
      }
    ]
  }
]
```

## Migration dari Form Lama

### Langkah Migration:

1. **Backup**: Pindahkan form lama ke folder `legacy/`
2. **Mapping**: Map field dari form lama ke konfigurasi baru
3. **Testing**: Test semua jenis tabungan
4. **Cleanup**: Hapus import form lama dari `AccountForm.tsx`

### Contoh Mapping:

```typescript
// Form lama (FormSimpel.tsx)
<Input 
  value={formData.fullName}
  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
/>

// Form baru (konfigurasi)
{
  name: 'fullName',
  type: 'text',
  label: 'Nama Lengkap',
  required: true,
  step: 1,
  section: 'personal'
}
```

## Best Practices

### 1. Naming Convention
- Field names menggunakan camelCase
- Section names menggunakan lowercase
- Step titles menggunakan Title Case

### 2. Field Organization
- Group related fields dalam section yang sama
- Urutkan field berdasarkan logical flow
- Gunakan conditional fields untuk mengurangi clutter

### 3. Validation Strategy
- Gunakan HTML5 validation untuk validasi dasar
- Implementasi async validation untuk uniqueness
- Berikan error message yang jelas dan actionable

### 4. Performance
- Lazy load options untuk select field jika data besar
- Debounce async validation
- Minimize re-renders dengan proper memoization

## Troubleshooting

### Field Tidak Muncul
1. Cek apakah field ada di `fields` array
2. Cek apakah field name ada di step configuration
3. Cek conditional logic jika ada

### Validasi Tidak Jalan
1. Cek validation rules di field config
2. Cek async validation function
3. Cek error handling di form

### Default Values Tidak Ter-set
1. Cek `defaultValues` di config
2. Cek `useEffect` di DynamicForm
3. Cek timing issue dengan form initialization

## Future Enhancements

1. **Dynamic Validation Rules**: Validasi yang bisa berubah berdasarkan kondisi
2. **Field Dependencies**: Field yang valuenya bergantung pada field lain
3. **Multi-language Support**: Internationalization untuk label dan error messages
4. **Advanced Conditional Logic**: Conditional logic yang lebih kompleks
5. **Form Analytics**: Tracking user interaction untuk optimization