import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';

interface AddressData {
  provinces: Array<{id: string, province: string}>;
  cities: Array<{id: string, name: string}>;
  districts: Array<{id: string, name: string}>;
  villages: Array<{id: string, name: string}>;
  loadingProvinces: boolean;
  loadingCities: boolean;
  loadingDistricts: boolean;
  loadingVillages: boolean;
}

interface SelectedAddress {
  provinceId: string;
  cityId: string;
  districtId: string;
  villageId: string;
}

interface AddressComponents {
  alamatJalan: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
}

interface IndonesianAddressDropdownProps {
  addressComponents: AddressComponents;
  onAddressChange: (components: AddressComponents) => void;
  citizenship?: string;
}

export default function IndonesianAddressDropdown({ 
  addressComponents, 
  onAddressChange,
  citizenship = 'Indonesia'
}: IndonesianAddressDropdownProps) {
  const [addressData, setAddressData] = useState<AddressData>({
    provinces: [],
    cities: [],
    districts: [],
    villages: [],
    loadingProvinces: false,
    loadingCities: false,
    loadingDistricts: false,
    loadingVillages: false,
  });

  const [selectedAddress, setSelectedAddress] = useState<SelectedAddress>({
    provinceId: '',
    cityId: '',
    districtId: '',
    villageId: '',
  });

  // Load provinces when component mounts or citizenship changes to Indonesia
  useEffect(() => {
    if (citizenship === 'Indonesia') {
      loadProvinces();
    } else {
      // Reset address data if not Indonesian
      setAddressData(prev => ({
        ...prev,
        provinces: [],
        cities: [],
        districts: [],
        villages: [],
      }));
      setSelectedAddress({
        provinceId: '',
        cityId: '',
        districtId: '',
        villageId: '',
      });
    }
  }, [citizenship]);

  // Try to find and set selected IDs based on current address components
  useEffect(() => {
    if (citizenship === 'Indonesia' && addressData.provinces.length > 0) {
      // Find province ID
      const province = addressData.provinces.find(p => 
        p.province.toLowerCase() === addressComponents.provinsi.toLowerCase()
      );
      if (province && province.id !== selectedAddress.provinceId) {
        setSelectedAddress(prev => ({ ...prev, provinceId: province.id }));
        loadCities(province.id);
      }
    }
  }, [addressData.provinces, addressComponents.provinsi]);

  // API functions
  const loadProvinces = async () => {
    setAddressData(prev => ({ ...prev, loadingProvinces: true }));
    try {
      const response = await fetch('https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/main.json');
      const data = await response.json();
      setAddressData(prev => ({ 
        ...prev, 
        provinces: data,
        loadingProvinces: false 
      }));
    } catch (error) {
      console.error('Error loading provinces:', error);
      setAddressData(prev => ({ ...prev, loadingProvinces: false }));
    }
  };

  const loadCities = async (provinceId: string) => {
    setAddressData(prev => ({ ...prev, loadingCities: true, cities: [], districts: [], villages: [] }));
    setSelectedAddress(prev => ({ ...prev, cityId: '', districtId: '', villageId: '' }));
    
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/cities/${provinceId}.json`);
      const data = await response.json();
      setAddressData(prev => ({ 
        ...prev, 
        cities: data.city || [],
        loadingCities: false 
      }));
    } catch (error) {
      console.error('Error loading cities:', error);
      setAddressData(prev => ({ ...prev, loadingCities: false }));
    }
  };

  const loadDistricts = async (cityId: string) => {
    setAddressData(prev => ({ ...prev, loadingDistricts: true, districts: [], villages: [] }));
    setSelectedAddress(prev => ({ ...prev, districtId: '', villageId: '' }));
    
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/districts/${cityId}.json`);
      const data = await response.json();
      setAddressData(prev => ({ 
        ...prev, 
        districts: data || [],
        loadingDistricts: false 
      }));
    } catch (error) {
      console.error('Error loading districts:', error);
      setAddressData(prev => ({ ...prev, loadingDistricts: false }));
    }
  };

  const loadVillages = async (districtId: string) => {
    setAddressData(prev => ({ ...prev, loadingVillages: true, villages: [] }));
    setSelectedAddress(prev => ({ ...prev, villageId: '' }));
    
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/rezzvy/geonesia-api/data/villages/${districtId}.json`);
      const data = await response.json();
      setAddressData(prev => ({ 
        ...prev, 
        villages: data || [],
        loadingVillages: false 
      }));
    } catch (error) {
      console.error('Error loading villages:', error);
      setAddressData(prev => ({ ...prev, loadingVillages: false }));
    }
  };

  // Update address components when selections change
  const updateAddressComponents = (province: string, city: string, district: string, village: string) => {
    onAddressChange({
      ...addressComponents,
      provinsi: province,
      kota: city,
      kecamatan: district,
      kelurahan: village,
    });
  };

  // Handle street address change
  const handleStreetAddressChange = (value: string) => {
    onAddressChange({
      ...addressComponents,
      alamatJalan: value,
    });
  };

  // Don't show dropdowns for non-Indonesian
  if (citizenship !== 'Indonesia') {
    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
        <div>
          <Label htmlFor="alamat_jalan" className="text-xs text-gray-600">Alamat Lengkap</Label>
          <Input
            id="alamat_jalan"
            placeholder="Masukkan alamat lengkap"
            value={addressComponents.alamatJalan}
            onChange={(e) => handleStreetAddressChange(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
      {/* Street Address */}
      <div>
        <Label htmlFor="alamat_jalan" className="text-xs text-gray-600">Alamat Jalan, RT/RW</Label>
        <Input
          id="alamat_jalan"
          placeholder="Jl. Magelang No. 123, RT 02/RW 05"
          value={addressComponents.alamatJalan}
          onChange={(e) => handleStreetAddressChange(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Province Dropdown */}
      <div>
        <Label className="text-xs text-gray-600">Provinsi</Label>
        <Select
          value={selectedAddress.provinceId}
          onValueChange={(value) => {
            setSelectedAddress(prev => ({ ...prev, provinceId: value }));
            const province = addressData.provinces.find(p => p.id === value);
            if (province) {
              loadCities(value);
              updateAddressComponents(province.province, '', '', '');
            }
          }}
          disabled={addressData.loadingProvinces}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={
              addressData.loadingProvinces ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : "-- Pilih Provinsi --"
            } />
          </SelectTrigger>
          <SelectContent>
            {addressData.provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* City Dropdown */}
      <div>
        <Label className="text-xs text-gray-600">Kota/Kabupaten</Label>
        <Select
          value={selectedAddress.cityId}
          onValueChange={(value) => {
            setSelectedAddress(prev => ({ ...prev, cityId: value }));
            const city = addressData.cities.find(c => c.id === value);
            const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
            if (city && province) {
              loadDistricts(value);
              updateAddressComponents(province.province, city.name, '', '');
            }
          }}
          disabled={!selectedAddress.provinceId || addressData.loadingCities}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={
              addressData.loadingCities ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : selectedAddress.provinceId ? "-- Pilih Kota/Kabupaten --" : "Pilih provinsi dulu"
            } />
          </SelectTrigger>
          <SelectContent>
            {addressData.cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District Dropdown */}
      <div>
        <Label className="text-xs text-gray-600">Kecamatan</Label>
        <Select
          value={selectedAddress.districtId}
          onValueChange={(value) => {
            setSelectedAddress(prev => ({ ...prev, districtId: value }));
            const district = addressData.districts.find(d => d.id === value);
            const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
            const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
            if (district && city && province) {
              loadVillages(value);
              updateAddressComponents(province.province, city.name, district.name, '');
            }
          }}
          disabled={!selectedAddress.cityId || addressData.loadingDistricts}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={
              addressData.loadingDistricts ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : selectedAddress.cityId ? "-- Pilih Kecamatan --" : "Pilih kota dulu"
            } />
          </SelectTrigger>
          <SelectContent>
            {addressData.districts.map((district) => (
              <SelectItem key={district.id} value={district.id}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Village Dropdown */}
      <div>
        <Label className="text-xs text-gray-600">Kelurahan/Desa</Label>
        <Select
          value={selectedAddress.villageId}
          onValueChange={(value) => {
            setSelectedAddress(prev => ({ ...prev, villageId: value }));
            const village = addressData.villages.find(v => v.id === value);
            const district = addressData.districts.find(d => d.id === selectedAddress.districtId);
            const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
            const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
            if (village && district && city && province) {
              updateAddressComponents(province.province, city.name, district.name, village.name);
            }
          }}
          disabled={!selectedAddress.districtId || addressData.loadingVillages}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={
              addressData.loadingVillages ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : selectedAddress.districtId ? "-- Pilih Kelurahan/Desa --" : "Pilih kecamatan dulu"
            } />
          </SelectTrigger>
          <SelectContent>
            {addressData.villages.map((village) => (
              <SelectItem key={village.id} value={village.id}>
                {village.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}