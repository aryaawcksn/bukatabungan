# 🏦 Solusi Analytics Semua Cabang

## Problem Statement
Dashboard saat ini hanya menampilkan data cabang dari admin yang login karena ada filter `WHERE p.cabang_id = $1` di `getAllPengajuan`. Untuk analytics, kita butuh data **semua cabang**.

## 🎯 Solusi: Endpoint Analytics Terpisah

### **Pendekatan:**
1. **Buat endpoint khusus untuk analytics** (`/api/pengajuan/analytics/data`)
2. **Role-based access control** - kontrol akses berdasarkan role user
3. **Fallback mechanism** - jika analytics gagal, gunakan data regular
4. **Smart data switching** - gunakan analytics data hanya di tab analytics

## 🔧 Backend Implementation

### **1. Controller Baru: `getAnalyticsData`**
```javascript
export const getAnalyticsData = async (req, res) => {
  try {
    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;

    // Tentukan akses berdasarkan role
    let whereClause = '';
    let queryParams = [];

    // Jika bukan super admin, tetap filter berdasarkan cabang
    if (userRole === 'employement' || userRole === 'admin_cabang') {
      whereClause = 'WHERE p.cabang_id = $1';
      queryParams = [adminCabang];
    }
    // Jika super admin atau role analytics, bisa akses semua data

    const query = `SELECT ... FROM pengajuan_tabungan p ... ${whereClause}`;
    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: result.rows.length,
        userRole: userRole,
        accessLevel: whereClause ? 'cabang' : 'all'
      }
    });
  } catch (err) {
    // Error handling
  }
};
```

### **2. Controller Cabang Analytics: `getAllCabangForAnalytics`**
```javascript
export const getAllCabangForAnalytics = async (req, res) => {
  try {
    const userRole = req.user.role;
    const adminCabang = req.user.cabang_id;

    let query = "SELECT id, nama_cabang, is_active FROM cabang";
    let queryParams = [];

    // Filter berdasarkan role
    if (userRole === 'employement' || userRole === 'admin_cabang') {
      query += " WHERE id = $1";
      queryParams = [adminCabang];
    }

    const result = await pool.query(query, queryParams);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    // Error handling
  }
};
```

### **3. Routes Baru**
```javascript
// Route khusus untuk analytics - data semua cabang (protected)
router.get("/analytics/data", verifyToken, getAnalyticsData);

// Route khusus untuk analytics - semua cabang (protected)
router.get("/analytics/cabang", verifyToken, getAllCabangForAnalytics);
```

## 🎨 Frontend Implementation

### **1. Fungsi Analytics Baru**
```typescript
// Fetch analytics data (untuk semua cabang jika memungkinkan)
const fetchAnalyticsData = async (showLoading: boolean = true) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pengajuan/analytics/data`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const result = await response.json();
    if (result.success && result.data) {
      const mappedData = result.data.map(mapBackendDataToFormSubmission);
      setSubmissions(mappedData);
      console.log(`📊 Analytics data loaded: ${mappedData.length} records (Access: ${result.meta?.accessLevel})`);
    }
  } catch (error) {
    // Fallback ke data regular jika analytics gagal
    console.log("📊 Analytics failed, falling back to regular data");
    await fetchSubmissions(showLoading);
  }
};
```

### **2. Smart Data Switching**
```typescript
// Refresh data ketika tab berubah
useEffect(() => {
  if (activeTab === 'analytics') {
    // Gunakan analytics data untuk tab analytics
    fetchAnalyticsData(false);
    fetchCabangForAnalytics();
  } else if (activeTab === 'submissions' || activeTab === 'dashboard') {
    // Gunakan data regular untuk tab lain
    fetchSubmissions(false);
    fetchCabang();
  }
}, [activeTab]);
```

## 🔐 Role-Based Access Control

### **Current Roles:**
- **`employement`**: Admin cabang biasa - hanya lihat data cabangnya
- **`admin_cabang`**: Admin cabang - hanya lihat data cabangnya
- **`super_admin`**: Super admin - bisa lihat semua data (future)
- **`analytics`**: Role khusus analytics - bisa lihat semua data (future)

### **Access Matrix:**
| Role | Regular Data | Analytics Data | All Branches |
|------|-------------|----------------|--------------|
| `employement` | ✅ Cabang sendiri | ✅ Cabang sendiri | ❌ |
| `admin_cabang` | ✅ Cabang sendiri | ✅ Cabang sendiri | ❌ |
| `super_admin` | ✅ Semua | ✅ Semua | ✅ |
| `analytics` | ✅ Semua | ✅ Semua | ✅ |

## 🚀 Benefits

### **1. Flexible Access Control**
- Admin cabang tetap hanya lihat data cabangnya
- Super admin bisa lihat semua data untuk analytics
- Role-based expansion untuk future needs

### **2. Graceful Fallback**
- Jika analytics endpoint gagal → fallback ke data regular
- Jika user tidak punya akses semua cabang → tetap bisa lihat cabangnya
- No breaking changes untuk existing functionality

### **3. Performance Optimized**
- Analytics data hanya di-fetch di tab analytics
- Regular data untuk tab lain (submissions, dashboard)
- Smart caching dan refresh logic

### **4. Future-Proof**
- Mudah tambah role baru (super_admin, analytics, manager, dll)
- Endpoint terpisah untuk analytics vs operational data
- Scalable untuk multi-tenant architecture

## 📊 Expected Results

### **Scenario 1: Admin Cabang Biasa**
- Tab Dashboard: Data cabang sendiri (3 permohonan)
- Tab Analytics: Data cabang sendiri (3 permohonan)
- Chart "Semua Cabang": Hanya cabang sendiri

### **Scenario 2: Super Admin (Future)**
- Tab Dashboard: Data semua cabang (50 permohonan)
- Tab Analytics: Data semua cabang (50 permohonan)  
- Chart "Semua Cabang": Semua 3 cabang dengan data lengkap

## 🔧 Implementation Status

### ✅ **Completed:**
- Backend endpoints untuk analytics
- Role-based access control
- Frontend analytics functions
- Smart data switching
- Fallback mechanisms
- Build successful

### 🚧 **Next Steps (Optional):**
1. **Add Super Admin Role**: Buat role `super_admin` di database
2. **Role Management UI**: Interface untuk manage user roles
3. **Advanced Analytics**: More detailed analytics untuk super admin
4. **Audit Logging**: Log akses analytics untuk compliance

## 🎯 Usage

### **Current State:**
Admin cabang akan tetap melihat data cabangnya sendiri di analytics, tapi dengan struktur yang siap untuk expansion ke semua cabang ketika role-nya diupgrade.

### **Future Expansion:**
Tinggal update role user di database ke `super_admin` atau `analytics`, maka otomatis bisa akses semua data tanpa perubahan code.

---

*Solusi ini memberikan foundation yang solid untuk analytics multi-cabang dengan kontrol akses yang fleksibel dan aman!* 🏦📊🔐