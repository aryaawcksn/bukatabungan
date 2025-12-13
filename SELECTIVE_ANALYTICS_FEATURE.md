# 🎯 Selective Analytics Feature

## Requirement
- **Analytics lainnya**: Menampilkan data cabang sendiri saja
- **Top Cabang saja**: Menampilkan semua cabang

## 🔧 Implementation

### **Data Flow Architecture**
```
Analytics Tab:
├── Regular Analytics Data (Cabang Sendiri)
│   ├── Status Distribution
│   ├── Daily Trend  
│   ├── Card Types
│   ├── Age Demographics
│   └── Salary Range
│
└── All Branches Data (Semua Cabang)
    └── Top Cabang Chart ONLY
```

### **Backend Endpoints**
```javascript
// Regular analytics (cabang sendiri)
GET /api/pengajuan/analytics/data
GET /api/pengajuan/analytics/cabang

// All branches (semua cabang) 
GET /api/pengajuan/analytics/data?all_branches=true
GET /api/pengajuan/analytics/cabang?all_branches=true
```

### **Frontend State Management**
```typescript
// Regular data (cabang sendiri)
const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
const [cabangList, setCabangList] = useState<Cabang[]>([]);

// All branches data (khusus Top Cabang)
const [allBranchesData, setAllBranchesData] = useState<FormSubmission[]>([]);
const [allCabangList, setAllCabangList] = useState<Cabang[]>([]);
```

## 📊 Chart Data Sources

### **Charts Using Regular Data (Cabang Sendiri):**
1. ✅ **Status Distribution** → `submissions` (cabang sendiri)
2. ✅ **Daily Trend** → `submissions` (cabang sendiri)
3. ✅ **Card Types** → `submissions` (cabang sendiri)
4. ✅ **Age Demographics** → `submissions` (cabang sendiri)
5. ✅ **Salary Range** → `submissions` (cabang sendiri)

### **Chart Using All Branches Data:**
6. 🏦 **Top Cabang** → `allBranchesData` + `allCabangList` (semua cabang)

## 🎯 Logic Implementation

### **AnalyticsDashboard Props**
```typescript
interface AnalyticsDashboardProps {
  submissions: FormSubmission[];           // Regular data (cabang sendiri)
  cabangList?: Cabang[];                  // Regular cabang list
  allBranchesData?: FormSubmission[];     // All branches data (Top Cabang only)
  allCabangList?: Cabang[];              // All cabang list (Top Cabang only)
}
```

### **Branch Distribution Logic**
```typescript
const branchData = useMemo(() => {
  // Prioritas: gunakan allCabangList dan allBranchesData untuk Top Cabang
  const cabangDataToUse = allCabangList.length > 0 ? allCabangList : cabangList;
  const submissionDataToUse = allBranchesData.length > 0 ? allBranchesData : submissions;
  
  if (cabangDataToUse && cabangDataToUse.length > 0) {
    return cabangDataToUse.map(cabang => {
      const count = submissionDataToUse.filter(sub => 
        sub.cabangName === cabang.nama_cabang || 
        sub.cabangId === cabang.id.toString()
      ).length;
      
      return {
        name: cabang.nama_cabang,
        value: count,
        isActive: cabang.is_active
      };
    }).sort((a, b) => b.value - a.value);
  }
  
  // Fallback ke data regular jika all branches tidak tersedia
}, [submissions, cabangList, allBranchesData, allCabangList]);
```

## 🚀 Data Fetching Strategy

### **Tab Analytics Load:**
```typescript
if (activeTab === 'analytics') {
  // 1. Fetch regular analytics data (cabang sendiri)
  fetchAnalyticsData(true);
  fetchCabangForAnalytics();
  
  // 2. Fetch all branches data (khusus Top Cabang)
  fetchAllBranchesForTopChart();
}
```

### **Fetch All Branches Function:**
```typescript
const fetchAllBranchesForTopChart = async () => {
  try {
    const [dataResponse, cabangResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/pengajuan/analytics/data?all_branches=true`),
      fetch(`${API_BASE_URL}/api/pengajuan/analytics/cabang?all_branches=true`)
    ]);

    if (dataResponse.ok && cabangResponse.ok) {
      // Set allBranchesData dan allCabangList
      setAllBranchesData(mappedData);
      setAllCabangList(cabangResult.data);
    }
  } catch (error) {
    // Fallback: Top Chart akan gunakan data regular
  }
};
```

## 📈 Expected Results

### **Scenario: Admin Cabang Godean**

#### **Charts 1-5 (Regular Analytics):**
- **Status Distribution**: Hanya permohonan Cabang Godean
- **Daily Trend**: Hanya trend Cabang Godean
- **Card Types**: Hanya jenis kartu dari Cabang Godean
- **Age Demographics**: Hanya usia nasabah Cabang Godean
- **Salary Range**: Hanya penghasilan nasabah Cabang Godean

#### **Chart 6 (Top Cabang):**
- **Cabang Godean**: 15 permohonan (Aktif)
- **Cabang Sleman**: 8 permohonan (Aktif)
- **Cabang Mlati**: 0 permohonan (Tidak Aktif)

## 🔄 Fallback Mechanism

### **If All Branches Endpoints Fail:**
1. **Top Cabang Chart** → Fallback ke data regular (cabang sendiri)
2. **Other Charts** → Tetap menggunakan data regular (tidak terpengaruh)
3. **User Experience** → Tidak ada breaking changes

### **Graceful Degradation:**
```typescript
// Top Cabang akan otomatis fallback jika allBranchesData kosong
const cabangDataToUse = allCabangList.length > 0 ? allCabangList : cabangList;
const submissionDataToUse = allBranchesData.length > 0 ? allBranchesData : submissions;
```

## 🎯 Business Value

### **Benefits:**
1. **Focused Analytics**: Charts 1-5 fokus pada performa cabang sendiri
2. **Comparative Analysis**: Top Cabang chart untuk perbandingan antar cabang
3. **Role-Based Data**: Sesuai dengan akses level user
4. **Performance Optimized**: Hanya fetch data yang diperlukan

### **Use Cases:**
- **Admin Cabang**: Analisis performa cabang sendiri + benchmark dengan cabang lain
- **Manager Regional**: Overview semua cabang untuk strategic planning
- **Operational Team**: Focus pada improvement cabang sendiri

## ✅ Implementation Status

### **Completed:**
- ✅ Dual data fetching (regular + all branches)
- ✅ Selective chart data sources
- ✅ Fallback mechanisms
- ✅ Build successful
- ✅ Type safety maintained

### **Ready for Testing:**
1. **Deploy backend** dengan analytics endpoints
2. **Test analytics tab** untuk memastikan data separation
3. **Verify Top Cabang** menampilkan semua cabang
4. **Verify other charts** menampilkan data cabang sendiri

---

*Selective analytics memberikan balance antara focused analysis dan comparative insights!* 🎯📊