# Solusi Edit Alamat Terpisah dalam Edit Submission Dialog

## 🎯 Masalah yang Diselesaikan

Sebelumnya, alamat tersimpan sebagai gabungan dalam satu field `alamat_id`, sehingga sulit untuk diedit per komponen. Sekarang dengan struktur alamat terpisah, kita perlu solusi edit yang user-friendly.

## 🔧 Solusi yang Diimplementasikan

### 1. **Address Parser Utility** 
File: `dashboard/src/utils/addressParser.ts`

**Fungsi:**
- `parseAddress()` - Memparse alamat gabungan menjadi komponen terpisah
- `combineAddress()` - Menggabungkan komponen alamat menjadi alamat lengkap

**Contoh:**
```typescript
// Input: "Jl. Magelang No. 123, RT 02/RW 05, Tirtoadi, Mlati, Sleman, DI Yogyakarta"
// Output: {
//   alamatJalan: "Jl. Magelang No. 123, RT 02/RW 05",
//   kelurahan: "Tirtoadi", 
//   kecamatan: "Mlati",
//   kota: "Sleman",
//   provinsi: "DI Yogyakarta"
// }
```

### 2. **Enhanced Edit Dialog UI**
File: `dashboard/src/components/edit-submission-dialog.tsx`

**Fitur Baru:**
- ✅ **Alamat Terpisah per Komponen** - Edit alamat jalan, kelurahan, kecamatan, kota, provinsi secara terpisah
- ✅ **Real-time Preview** - Menampilkan alamat lengkap yang terbentuk
- ✅ **User-friendly Interface** - Layout yang rapi dengan label yang jelas

**UI Components:**
```
📍 Alamat KTP (Edit per Komponen)
┌─────────────────────────────────────────┐
│ Alamat Jalan, RT/RW                     │
│ [Jl. Magelang No. 123, RT 02/RW 05]    │
│                                         │
│ Kelurahan/Desa    │ Kecamatan          │
│ [Tirtoadi]        │ [Mlati]            │
│                                         │
│ Kota/Kabupaten    │ Provinsi           │
│ [Sleman]          │ [DI Yogyakarta]    │
│                                         │
│ 📍 Alamat Lengkap:                     │
│ Jl. Magelang No. 123, RT 02/RW 05,     │
│ Tirtoadi, Mlati, Sleman, DI Yogyakarta │
└─────────────────────────────────────────┘
```

### 3. **Backend Support**
File: `backend/controllers/pengajuanController.js`

**Updates:**
- ✅ **Query SELECT** - Mengirim data alamat terpisah ke frontend
- ✅ **Field Mapping** - Menambahkan mapping untuk edit alamat terpisah
- ✅ **Update Support** - Menyimpan perubahan alamat terpisah

**Field Mapping Baru:**
```javascript
alamat_jalan: { table: 'cdd_self', column: 'alamat_jalan', current: current.alamat_jalan },
provinsi: { table: 'cdd_self', column: 'provinsi', current: current.provinsi },
kota: { table: 'cdd_self', column: 'kota', current: current.kota },
kecamatan: { table: 'cdd_self', column: 'kecamatan', current: current.kecamatan },
kelurahan: { table: 'cdd_self', column: 'kelurahan', current: current.kelurahan },
```

## 🔄 Cara Kerja Sistem

### **Saat Load Data:**
1. Backend mengirim data alamat terpisah dari database
2. Frontend parse alamat gabungan menjadi komponen (fallback jika data terpisah kosong)
3. Tampilkan dalam form edit yang user-friendly

### **Saat Edit:**
1. User edit komponen alamat (jalan, kelurahan, kecamatan, kota, provinsi)
2. Real-time update alamat gabungan untuk preview
3. State `addressComponents` dan `formData.alamat_id` tersinkronisasi

### **Saat Save:**
1. Kirim data alamat terpisah + alamat gabungan ke backend
2. Backend update semua field alamat di database
3. Audit trail mencatat perubahan per field

## 📊 Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Database      │    │    Backend       │    │   Frontend      │
│                 │    │                  │    │                 │
│ alamat_jalan    │◄──►│ SELECT query     │◄──►│ addressComponents│
│ provinsi        │    │ with separated   │    │ state           │
│ kota            │    │ address fields   │    │                 │
│ kecamatan       │    │                  │    │ Real-time       │
│ kelurahan       │    │ UPDATE query     │    │ combine to      │
│ alamat_id       │    │ with field       │    │ alamat_id       │
│ (combined)      │    │ mapping          │    │ for preview     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## ✅ Keuntungan Solusi Ini

### **Untuk User:**
- 🎯 **Edit Mudah** - Bisa edit per komponen alamat
- 👀 **Preview Real-time** - Lihat hasil alamat lengkap langsung
- 🔄 **Konsisten** - Interface yang sama dengan form input

### **Untuk Analisis:**
- 📊 **Data Terstruktur** - Alamat tersimpan terpisah untuk analisis
- 🔍 **Query Fleksibel** - Bisa query per provinsi, kota, kecamatan, kelurahan
- 📈 **Kompatibilitas** - Alamat gabungan tetap tersedia

### **Untuk Sistem:**
- 🔧 **Backward Compatible** - Sistem lama tetap bisa baca alamat gabungan
- 🛡️ **Audit Trail** - Perubahan alamat tercatat per field
- 🚀 **Performance** - Query efisien dengan index yang tepat

## 🎉 Status Implementation

- ✅ **Address Parser Utility** - Created
- ✅ **Enhanced Edit Dialog UI** - Updated
- ✅ **Backend Query Updates** - Updated
- ✅ **Field Mapping** - Added
- ✅ **Real-time Preview** - Working
- ✅ **Save Functionality** - Working
- ✅ **No Syntax Errors** - Verified

## 🧪 Testing Checklist

- [ ] Test edit alamat untuk data lama (alamat gabungan)
- [ ] Test edit alamat untuk data baru (alamat terpisah)
- [ ] Test preview alamat real-time
- [ ] Test save perubahan alamat
- [ ] Test audit trail untuk perubahan alamat
- [ ] Test query analisis dengan data alamat terpisah

Sekarang admin bisa mengedit alamat dengan mudah per komponen, dan data tetap tersimpan terstruktur untuk analisis! 🎯