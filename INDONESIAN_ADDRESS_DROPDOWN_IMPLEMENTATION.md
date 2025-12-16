# Indonesian Address Dropdown Implementation - Updated

## Overview
Implemented cascading dropdown system for Indonesian addresses using the Geonesia API. This feature automatically builds complete addresses from user selections and only appears for Indonesian citizens (WNI).

## ✅ Recent Updates (Fixed Issues)
1. **Separated Street Address Field**: Added `streetAddress` field separate from full `address`
2. **Fixed Dropdown Reset Logic**: Properly resets dependent dropdowns when parent selection changes
3. **Improved Address Building**: Street address + location hierarchy = complete address
4. **Better User Experience**: Clear separation between manual input and auto-generated parts

## Features Implemented

### 1. Conditional Display
- Dropdowns only appear when `citizenship` is set to "Indonesia" (WNI)
- Falls back to manual input for non-Indonesian citizens (WNA)
- Automatic loading of provinces when citizenship changes to WNI

### 2. Cascading Dropdown System
- **Province** → **City/Regency** → **District** → **Village**
- Each level depends on the previous selection
- Automatic reset of dependent dropdowns when parent changes
- Loading states for each dropdown level

### 3. Address Auto-Generation
- Combines manual address input with selected location data
- Format: `[Manual Address], [Village], [District], [City], [Province]`
- Real-time preview of complete address
- Updates `formData.address`, `formData.province`, and `formData.city`

### 4. API Integration
Uses Geonesia API endpoints:
- **Provinces**: `https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/main.json`
- **Cities**: `https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/cities/{provinceId}.json`
- **Districts**: `https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/districts/{cityId}.json`
- **Villages**: `https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/villages/{districtId}.json`

## Implementation Details

### State Management
```typescript
// Address data from API
const [addressData, setAddressData] = useState({
  provinces: [] as Array<{id: string, province: string}>,
  cities: [] as Array<{id: string, name: string}>,
  districts: [] as Array<{id: string, name: string}>,
  villages: [] as Array<{id: string, name: string}>,
  loadingProvinces: false,
  loadingCities: false,
  loadingDistricts: false,
  loadingVillages: false,
});

// Selected IDs for tracking
const [selectedAddress, setSelectedAddress] = useState({
  provinceId: '',
  cityId: '',
  districtId: '',
  villageId: '',
});
```

### Address Building Logic (Updated)
```typescript
const updateFullAddress = (province: string, city: string, district: string, village: string) => {
  const addressParts = [];
  
  // Always start with street address if available
  if (formData.streetAddress && formData.streetAddress.trim()) {
    addressParts.push(formData.streetAddress.trim());
  }
  
  // Add location hierarchy
  if (village && village.trim()) addressParts.push(village.trim());
  if (district && district.trim()) addressParts.push(district.trim());
  if (city && city.trim()) addressParts.push(city.trim());
  if (province && province.trim()) addressParts.push(province.trim());
  
  const fullAddress = addressParts.join(', ');
  
  setFormData(prev => ({
    ...prev,
    province,
    city,
    address: fullAddress
  }));
};
```

### Dropdown Reset Logic (Fixed)
```typescript
// Province selection - resets all dependent dropdowns
setSelectedAddress(prev => ({ 
  ...prev, 
  provinceId: value,
  cityId: '',      // Reset city
  districtId: '',  // Reset district
  villageId: ''    // Reset village
}));

// City selection - resets district and village
setSelectedAddress(prev => ({ 
  ...prev, 
  cityId: value,
  districtId: '',  // Reset district
  villageId: ''    // Reset village
}));
```

### API Loading Functions
- `loadProvinces()`: Loads all Indonesian provinces
- `loadCities(provinceId)`: Loads cities for selected province
- `loadDistricts(cityId)`: Loads districts for selected city
- `loadVillages(districtId)`: Loads villages for selected district

## User Experience Features

### 1. Smart Placeholders
- Dynamic placeholders based on selection state
- Loading indicators during API calls
- Disabled states for dependent dropdowns

### 2. Visual Feedback
- Blue info box explaining the feature
- Green preview box showing complete address
- Loading states with descriptive text

### 3. Progressive Enhancement
- Manual address input remains primary
- Dropdowns enhance the address with location data
- Graceful fallback for API failures

## Files Modified
- `frontend/src/components/account-forms/FormSimpel.tsx`
- `frontend/src/components/account-forms/FormMutiara.tsx`
- `frontend/src/components/account-forms/types.ts` (added `streetAddress` field)
- `frontend/src/components/AccountForm.tsx` (initialized `streetAddress`)

## Database Impact
- No database schema changes required
- Existing `address`, `province`, and `city` fields are used
- Complete address is stored in the `address` field
- New `streetAddress` field is frontend-only for better UX

## Example Address Generation (Updated)

### User Input:
- **Street Address** (manual): "Jl. Magelang No. 123, RT 02/RW 05"
- **Province** (dropdown): "DI YOGYAKARTA"
- **City** (dropdown): "KAB. SLEMAN"
- **District** (dropdown): "Depok"
- **Village** (dropdown): "Caturtunggal"

### Data Storage:
- `formData.streetAddress`: "Jl. Magelang No. 123, RT 02/RW 05"
- `formData.address`: "Jl. Magelang No. 123, RT 02/RW 05, Caturtunggal, Depok, KAB. SLEMAN, DI YOGYAKARTA"
- `formData.province`: "DI YOGYAKARTA"
- `formData.city`: "KAB. SLEMAN"

### Benefits of Separation:
1. **Street address** remains editable by user
2. **Full address** auto-generated for database storage
3. **Location data** properly structured for analytics
4. **Flexibility** for future address parsing needs

## Benefits

### 1. Data Standardization
- Consistent province and city names
- Reduces typos and variations
- Improves data quality for analytics

### 2. User Convenience
- No need to remember exact spelling of locations
- Faster input with dropdowns
- Visual confirmation of selections

### 3. Flexibility
- Works for both WNI and WNA users
- Optional district and village selection
- Maintains manual input capability

## Error Handling
- API failures gracefully handled with console logging
- Loading states prevent user confusion
- Fallback to manual input always available

## Performance Considerations
- API calls only made when needed (on selection change)
- Data cached in component state
- Minimal re-renders with proper dependency arrays

## Future Enhancements
1. **Caching**: Implement localStorage caching for API responses
2. **Search**: Add search functionality within dropdowns
3. **Validation**: Add postal code validation based on selected area
4. **Offline**: Implement offline fallback with bundled data
5. **Auto-complete**: Add auto-complete for manual address input