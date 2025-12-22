import { useRef, useState, useEffect } from 'react';
import { useFormContext, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import type { AccountFormData, AccountFormProps } from './types';
import TermsModal from '../TermsModal';


// Helper to format number string to IDR currency format
const formatRupiah = (angka: string) => {
  if (!angka) return '';
  const numberString = angka.replace(/[^,\d]/g, '').toString();
  const split = numberString.split(',');
  const sisa = split[0].length % 3;
  let rupiah = split[0].substr(0, sisa);
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }

  rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  return 'Rp. ' + rupiah;
};

interface FormSimpelProps extends AccountFormProps {
  currentStep?: number;
}

export default function FormSimpel({
  getFieldClass,
  branches = [],
  currentStep = 1,
}: Partial<AccountFormProps>) {
  const { 
    control, 
    register, 
    setValue, 
    getValues, 
    watch,
    clearErrors,
    setError,
    formState: { errors: rhfErrors } 
  } = useFormContext<AccountFormData>();

  const { fields: bankFields, append: appendBank, remove: removeBank } = useFieldArray({
    control,
    name: 'eddBankLain'
  });

  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control,
    name: 'eddPekerjaanLain'
  });
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Watch fields for conditional logic
  const watchedRekeningUntukSendiri = useWatch({ control, name: 'rekeningUntukSendiri' });
  const watchedTipeNasabah = useWatch({ control, name: 'tipeNasabah' });
  const watchedCitizenship = useWatch({ control, name: 'citizenship' });

  // BO and Emergency fields watches - REMOVED for performance
  /*
  const watchedBoFields = useWatch({ 
    control, 
    name: [
      'boNama', 'boAlamat', 'boTempatLahir', 'boTanggalLahir', 'boJenisKelamin',
      'boKewarganegaraan', 'boStatusPernikahan', 'boJenisId', 'boNomorId',
      'boSumberDana', 'boHubungan', 'boNomorHp', 'boPekerjaan', 'boPendapatanTahun', 'boPersetujuan'
    ] 
  });

  const watchedEmergencyFields = useWatch({
    control,
    name: ['kontakDaruratNama', 'kontakDaruratHp', 'kontakDaruratAlamat', 'kontakDaruratHubungan']
  });
  */

  const watchedEmploymentStatus = useWatch({ control, name: 'employmentStatus' });
  const watchedEmergencyHubungan = useWatch({ control, name: 'kontakDaruratHubungan' });

  // State for Indonesian address dropdowns
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

  // State for selected address IDs
  const [selectedAddress, setSelectedAddress] = useState({
    provinceId: '',
    cityId: '',
    districtId: '',
    villageId: '',
  });

  // Auto-set employment status and jenis_rekening for Simpell
  useEffect(() => {
    const currentValues = getValues();
    if (currentValues.employmentStatus !== 'pelajar-mahasiswa') {
      setValue('employmentStatus', 'pelajar-mahasiswa', { shouldValidate: false });
    }
    setValue('jenis_rekening', 'SimPel', { shouldValidate: false });
    if (!currentValues.tipeNasabah) {
      setValue('tipeNasabah', 'baru', { shouldValidate: false });
    }
    setValue('jenisId', 'KIA', { shouldValidate: false });
  }, [setValue, getValues]);



  // Validation function for age requirement
  const validateAge = (birthDate: string): void => {
    if (!birthDate) {
      clearErrors('birthDate');
      return;
    }
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    const MIN_AGE = 17;
    if (age < MIN_AGE) {
      setError('birthDate', { type: 'manual', message: 'Usia minimal ' + MIN_AGE + ' tahun' });
    } else {
      clearErrors('birthDate');
    }
  };

  // Validation function for reference contact completeness


  // Validation function for beneficial owner completeness
  const validateBeneficialOwner = (): void => {
    clearErrors('boNama');
    clearErrors('boAlamat');
    clearErrors('boTempatLahir');
    clearErrors('boTanggalLahir');
    clearErrors('boJenisKelamin');
    clearErrors('boKewarganegaraan');
    clearErrors('boStatusPernikahan');
    clearErrors('boJenisId');
    clearErrors('boNomorId');
    clearErrors('boSumberDana');
    clearErrors('boHubungan');
    clearErrors('boNomorHp');
    clearErrors('boPekerjaan');
    clearErrors('boPendapatanTahun');
    clearErrors('boPersetujuan');

    // Only validate if account is for others (NOT for self)
    if (watchedRekeningUntukSendiri === false) {
      const currentData = getValues();
      const { 
        boNama, 
        boAlamat, 
        boTempatLahir, 
        boTanggalLahir,
        boJenisKelamin,
        boKewarganegaraan,
        boStatusPernikahan,
        boJenisId, 
        boNomorId,
        boSumberDana,
        boHubungan,
        boNomorHp,
        boPekerjaan, 
        boPendapatanTahun, 
        boPersetujuan 
      } = currentData;
      
      // All BO fields are required
      if (!boNama) {
        setError('boNama', { type: 'manual', message: 'Nama beneficial owner harus diisi' });
      }
      if (!boAlamat) {
        setError('boAlamat', { type: 'manual', message: 'Alamat beneficial owner harus diisi' });
      }
      if (!boTempatLahir) {
        setError('boTempatLahir', { type: 'manual', message: 'Tempat lahir beneficial owner harus diisi' });
      }
      if (!boTanggalLahir) {
        setError('boTanggalLahir', { type: 'manual', message: 'Tanggal lahir beneficial owner harus diisi' });
      }
      if (!boJenisKelamin) {
        setError('boJenisKelamin', { type: 'manual', message: 'Jenis kelamin beneficial owner harus dipilih' });
      }
      if (!boKewarganegaraan) {
        setError('boKewarganegaraan', { type: 'manual', message: 'Kewarganegaraan beneficial owner harus dipilih' });
      }
      if (!boStatusPernikahan) {
        setError('boStatusPernikahan', { type: 'manual', message: 'Status pernikahan beneficial owner harus dipilih' });
      }
      if (!boJenisId) {
        setError('boJenisId', { type: 'manual', message: 'Jenis identitas beneficial owner harus dipilih' });
      }
      if (!boNomorId) {
        setError('boNomorId', { type: 'manual', message: 'Nomor identitas beneficial owner harus diisi' });
      }
      if (!boSumberDana) {
        setError('boSumberDana', { type: 'manual', message: 'Sumber dana beneficial owner harus dipilih' });
      }
      if (!boHubungan) {
        setError('boHubungan', { type: 'manual', message: 'Hubungan dengan beneficial owner harus dipilih' });
      }
      if (!boNomorHp) {
        setError('boNomorHp', { type: 'manual', message: 'Nomor HP beneficial owner harus diisi' });
      }
      if (!boPekerjaan) {
        setError('boPekerjaan', { type: 'manual', message: 'Pekerjaan beneficial owner harus diisi' });
      }
      if (!boPendapatanTahun) {
        setError('boPendapatanTahun', { type: 'manual', message: 'Pendapatan tahunan beneficial owner harus dipilih' });
      }
      if (!boPersetujuan) {
        setError('boPersetujuan', { type: 'manual', message: 'Persetujuan beneficial owner harus dicentang' });
      }
    }
  };

  // Validation function for emergency contact completeness
  const validateEmergencyContact = (): void => {
    clearErrors('kontakDaruratNama');
    clearErrors('kontakDaruratHp');
    clearErrors('kontakDaruratAlamat');
    clearErrors('kontakDaruratHubungan');
    
    const { kontakDaruratNama, kontakDaruratHp, kontakDaruratAlamat, kontakDaruratHubungan } = getValues();
    
    // Check if any emergency contact field is filled
    const anyFieldFilled = kontakDaruratNama || kontakDaruratHp || kontakDaruratAlamat || kontakDaruratHubungan;
    
    if (anyFieldFilled) {
      // If any field is filled, all fields must be filled
      if (!kontakDaruratNama) {
        setError('kontakDaruratNama', { type: 'manual', message: 'Nama kontak darurat harus diisi jika mengisi kontak darurat' });
      }
      if (!kontakDaruratHp) {
        setError('kontakDaruratHp', { type: 'manual', message: 'Nomor HP kontak darurat harus diisi jika mengisi kontak darurat' });
      }
      if (!kontakDaruratHubungan) {
        setError('kontakDaruratHubungan', { type: 'manual', message: 'Hubungan kontak darurat harus diisi jika mengisi kontak darurat' });
      }
    }
  };

  // Minimum deposit amounts for each account type
  const MINIMUM_DEPOSITS: Record<string, number> = {
    'SimPel': 5000,
    'Reguler': 10000,
    'Mutiara': 50000,
    'TabunganKu': 1,
    'Arofah': 10000,
    'Pensiun': 10000,
    'TamasyaPlus': 100000,
  };

  // Validation function for minimum deposit
  const validateMinimumDeposit = (accountType: string, depositAmount: string): string => {
    if (!depositAmount) return '';
    
    const amount = parseFloat(depositAmount);
    if (isNaN(amount)) {
      return 'Nominal setoran harus berupa angka';
    }
    
    const minimumDeposit = MINIMUM_DEPOSITS[accountType] || 0;
    if (amount < minimumDeposit) {
      return 'Nominal setoran minimal untuk rekening ' + accountType + ' adalah Rp ' + minimumDeposit.toLocaleString('id-ID');
    }
    
    return '';
  };



  // Validate beneficial owner and emergency contact - Handled at step transition or field level
  /*
  useEffect(() => {
    validateBeneficialOwner();
  }, [watchedRekeningUntukSendiri, ...watchedBoFields, setError, clearErrors, getValues]);

  useEffect(() => {
    validateEmergencyContact();
  }, [...watchedEmergencyFields, setError, clearErrors, getValues]);
  */

  /*
  // Validate nomor rekening lama when tipe nasabah is 'lama'
  useEffect(() => {
    if (watchedTipeNasabah === 'lama' && !watchedNomorRekeningLama) {
      setError('nomorRekeningLama', { type: 'manual', message: 'Nomor rekening lama harus diisi untuk nasabah lama' });
    } else {
      clearErrors('nomorRekeningLama');
    }
  }, [watchedTipeNasabah, watchedNomorRekeningLama, setError, clearErrors]);
  */

  // Load provinces for both WNI and WNA
  useEffect(() => {
    if (watchedCitizenship === 'Indonesia' || watchedCitizenship === 'WNA') {
      loadProvinces();
    } else {
      // Reset address data if citizenship not selected
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
  }, [watchedCitizenship]);

  // API functions for Indonesian address
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



  // Function to update address when dropdowns change
  const updateFullAddress = (province: string, city: string, district: string, village: string) => {
    const addressParts = [];
    const street = getValues().alamatJalan;
    
    // Always start with street address if available
    if (street && street.trim()) {
      addressParts.push(street.trim());
    }
    
    // Add location hierarchy
    if (village && village.trim()) addressParts.push(village.trim());
    if (district && district.trim()) addressParts.push(district.trim());
    if (city && city.trim()) addressParts.push(city.trim());
    if (province && province.trim()) addressParts.push(province.trim());
    
    const fullAddress = addressParts.join(', ');
    
    setValue('province', province, { shouldValidate: false });
    setValue('city', city, { shouldValidate: false });
    setValue('kecamatan', district, { shouldValidate: false });
    setValue('kelurahan', village, { shouldValidate: false });
    setValue('address', fullAddress, { shouldValidate: false });
  };

  // Re-syncing effect for street address
  useEffect(() => {
    if ((watchedCitizenship === 'Indonesia' || watchedCitizenship === 'WNA') && selectedAddress.provinceId) {
       const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
       const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
       const district = addressData.districts.find(d => d.id === selectedAddress.districtId);
       const village = addressData.villages.find(v => v.id === selectedAddress.villageId);
       
       updateFullAddress(
         province?.province || '',
         city?.name || '',
         district?.name || '',
         village?.name || ''
       );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCitizenship, selectedAddress.provinceId, selectedAddress.cityId, selectedAddress.districtId, selectedAddress.villageId, addressData.provinces, addressData.cities, addressData.districts, addressData.villages]);

  // Handle non-Indonesian/WNA address sync
  useEffect(() => {
    if (!watchedCitizenship || (watchedCitizenship !== 'Indonesia' && watchedCitizenship !== 'WNA')) {
       setValue('address', getValues().alamatJalan || '', { shouldValidate: false });
       setValue('province', '', { shouldValidate: false });
       setValue('city', '', { shouldValidate: false });
       setValue('kecamatan', '', { shouldValidate: false });
       setValue('kelurahan', '', { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCitizenship]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ========================================
          STEP 1: PILIH CABANG
          ======================================== */}
      {currentStep === 1 && (
        <section className="space-y-6" aria-labelledby="branch-selection-heading">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 id="branch-selection-heading" className="text-emerald-900 mb-3 text-3xl font-bold">Pilih Lokasi Cabang</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Silakan pilih kantor cabang Bank Sleman terdekat untuk pengambilan buku tabungan SimPel Anda.
            </p>
          </header>
          
          {/* Branch Selection */}
          <div className="max-w-2xl mx-auto">
            <fieldset className="bg-white p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
              <legend className="sr-only">Pilihan Cabang</legend>
              <Label htmlFor="cabang_pengambilan" className="text-gray-800 font-semibold text-lg mb-3 block">
                Kantor Cabang <span className="text-red-500">*</span>
              </Label>
              {rhfErrors.cabang_pengambilan && (
                <div role="alert" className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {rhfErrors.cabang_pengambilan?.message}
                  </p>
                </div>
              )}
              <Controller
                name="cabang_pengambilan"
                control={control}
                rules={{ required: 'Pilih kantor cabang pengambilan' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                       field.onChange(value);
                       const selectedBranch = branches.find(b => b.id.toString() === value.toString());
                       if (selectedBranch && !selectedBranch.is_active) {
                          setError('cabang_pengambilan', { type: 'manual', message: "Cabang sedang dalam perbaikan, silahkan pilih cabang lain" });
                       } else {
                          clearErrors('cabang_pengambilan');
                       }
                    }}
                  >
                    <SelectTrigger className={`h-14 bg-white border-2 text-base focus:border-emerald-500 focus:ring-emerald-500 rounded-xl ${rhfErrors.cabang_pengambilan ? 'border-red-500' : 'border-slate-300'}`}>
                      <SelectValue placeholder="-- Pilih Cabang Bank Sleman --" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.id.toString()} disabled={!branch.is_active}>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>{branch.nama_cabang}</span>
                            {!branch.is_active && <span className="text-xs text-red-500 ml-2">(Tidak tersedia)</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-sm text-slate-500 mt-3 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Buku tabungan dapat diambil di cabang yang Anda pilih setelah permohonan disetujui.
              </p>
            </fieldset>
          </div>
        </section>
      )}

      {/* ========================================
          STEP 2: DATA DIRI NASABAH
          ======================================== */}
      {currentStep === 2 && (
        <section className="space-y-8" aria-labelledby="personal-data-heading">
          
          {/* Header */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 id="personal-data-heading" className="text-emerald-900 mb-3 text-3xl font-bold">Data Diri Nasabah</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Lengkapi data diri Anda sesuai dengan dokumen identitas resmi.
            </p>
          </header>

          {/* Section 1: Identitas Diri */}
          <article className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <header>
              <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
                Identitas Diri
              </h4>
            </header>
            <fieldset className="space-y-5">
              <legend className="sr-only">Informasi Identitas Pribadi</legend>

              {/* Nama Lengkap */}
              <div>
                <Label htmlFor="fullName" className="text-gray-700 font-semibold">
                  Nama Lengkap (Sesuai KIA) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  required
                  placeholder="Masukkan nama lengkap sesuai KIA"
                  {...register('fullName', { required: 'Nama lengkap harus diisi' })}
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.fullName ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{rhfErrors.fullName.message}</p>
                )}
              </div>

              {/* Alias */}
              <div>
                <Label htmlFor="alias" className="text-gray-700 font-semibold flex items-center gap-2">
                  Nama Panggilan / Alias
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                </Label>
                <Input
                  id="alias"
                  placeholder="Nama panggilan atau alias"
                  {...register('alias')}
                  className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                />
              </div>

              {/* Tipe Nasabah */}
              <div>
                <Label className="text-gray-700 font-semibold">
                  Tipe Nasabah <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="tipeNasabah"
                  control={control}
                  rules={{ required: 'Pilih tipe nasabah' }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: 'baru' | 'lama') => {
                        field.onChange(value);
                        setValue('nomorRekeningLama', '');
                        clearErrors('nomorRekeningLama');
                      }}
                    >
                      <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.tipeNasabah ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                        <SelectValue placeholder="-- Pilih Tipe Nasabah --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baru">
                          <div className="flex items-center gap-2">
                            <span>Nasabah Baru</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="lama">
                          <div className="flex items-center gap-2">
                            <span>Nasabah Lama</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {rhfErrors.tipeNasabah && (
                  <p className="text-sm text-red-600 mt-1">{rhfErrors.tipeNasabah.message}</p>
                )}
              </div>

              {/* Nomor Rekening Lama - Only show if nasabah lama */}
              {watchedTipeNasabah === 'lama' && (
                <div>
                  <Label htmlFor="nomorRekeningLama" className="text-gray-700 font-semibold">
                    Nomor Rekening yang Sudah Ada <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomorRekeningLama"
                    required
                    placeholder="Masukkan nomor rekening yang sudah ada"
                    {...register('nomorRekeningLama', {
                      onChange: () => {
                        clearErrors('nomorRekeningLama');
                      }
                    })}
                    className={`mt-2 h-12 rounded-lg border-2 focus:border-emerald-500 ${
                      rhfErrors.nomorRekeningLama ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {rhfErrors.nomorRekeningLama && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {rhfErrors.nomorRekeningLama.message}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Masukkan nomor rekening Bank Sleman yang sudah Anda miliki sebelumnya.
                  </p>
                </div>
              )}

              <div>
  <Label htmlFor="nik" className="text-gray-700 font-semibold">
    Nomor KIA <span className="text-red-500">*</span>
  </Label>

  <Input
    id="nik"
    required
    placeholder="Masukkan 16 digit Nomor KIA"
    maxLength={16}
    {...register('nik', {
      required: 'Nomor KIA harus diisi',
      minLength: { value: 16, message: 'Nomor KIA harus 16 digit' },
      maxLength: { value: 16, message: 'Nomor KIA harus 16 digit' },
      pattern: { value: /^[0-9]{16}$/, message: 'Nomor KIA harus berupa angka 16 digit' }
    })}
    className={`mt-2 h-12 rounded-lg border-2 ${
      rhfErrors.nik ? 'border-red-500' : 'border-slate-300'
    } focus:border-emerald-500`}
  />

  {rhfErrors.nik && (
    <p className="text-sm text-red-600 mt-1">{rhfErrors.nik.message}</p>
  )}
</div>


              {/* Validity Date */}
              <div>
                <Label htmlFor="berlakuId" className="text-gray-700 font-semibold flex items-center gap-2">
                  Masa Berlaku Identitas
                </Label>
                <Input
                  id="berlakuId"
                  type="date"
                  required={true}
                  {...register('berlakuId', { required: 'Masa berlaku identitas harus diisi' })}
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.berlakuId ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.berlakuId && (
                  <p className="text-sm text-red-600 mt-1">{rhfErrors.berlakuId.message}</p>
                )}
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Masukan tanggal masa berlaku KIA
                </p>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                  <Label htmlFor="tempatLahir" className="text-gray-700 font-semibold">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tempatLahir"
                    required
                    placeholder="Contoh: Yogyakarta"
                    {...register('tempatLahir', { required: 'Tempat lahir harus diisi' })}
                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.tempatLahir ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {rhfErrors.tempatLahir && (
                    <p className="text-sm text-red-600 mt-1">{rhfErrors.tempatLahir.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birthDate" className="text-gray-700 font-semibold">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    required
                    {...register('birthDate', {
                      required: 'Tanggal lahir harus diisi'
                    })}
                    className={`mt-2 h-12 rounded-lg border-2 ${
                      rhfErrors.birthDate ? 'border-red-500' : 'border-slate-300'
                    } px-4 py-2 focus:border-emerald-500 focus:ring-emerald-500`}
                  />
                  {rhfErrors.birthDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {rhfErrors.birthDate?.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Minimal usia 17 tahun</p>
                </div>
              </div>

              {/* Gender + Marital + Agama */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Status Pernikahan <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="maritalStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                          <SelectItem value="Kawin">Kawin</SelectItem>
                          <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                          <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Agama <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="agama"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Islam">Islam</SelectItem>
                          <SelectItem value="Kristen">Kristen</SelectItem>
                          <SelectItem value="Katolik">Katolik</SelectItem>
                          <SelectItem value="Hindu">Hindu</SelectItem>
                          <SelectItem value="Budha">Budha</SelectItem>
                          <SelectItem value="Konghucu">Konghucu</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              
              {/* Pendidikan + Nama Ibu */}
               <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Pendidikan Terakhir <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="pendidikan"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Pendidikan --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="S-1">S-1</SelectItem>
                          <SelectItem value="S-2/S3">S-2/S3</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="motherName" className="text-gray-700 font-semibold">
                    Nama Ibu Kandung <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="motherName"
                    required
                    placeholder="Nama lengkap ibu kandung"
                    {...register('motherName')}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>
              </div>

            </fieldset>
          </article>

          {/* Section 2: Informasi Kontak */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
              Informasi Kontak
            </h4>
            <div className="space-y-5">

              {/* Email + Phone */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="contoh@email.com"
                    {...register('email')}

                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.email ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                   {rhfErrors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {rhfErrors.email?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-700 font-semibold">
                    Nomor Telepon (WA Aktif) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="08123456789"
                    {...register('phone')}

                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.phone ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {rhfErrors.phone && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {rhfErrors.phone?.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">Nomor WhatsApp yang aktif untuk verifikasi</p>
                </div>
              </div>
              
              {/* Kewarganegaraan */}
              <div>
                 <Label className="text-gray-700 font-semibold">
                   Kewarganegaraan <span className="text-red-500">*</span>
                 </Label>
                  <Controller
                    name="citizenship"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih kewarganegaraan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WNI">WNI (Warga Negara Indonesia)</SelectItem>
                          <SelectItem value="WNA">WNA (Warga Negara Asing)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
              </div>

            </div>
          </div>

          {/* Section 3: Alamat Tempat Tinggal */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">3</span>
              Alamat Tempat Tinggal
            </h4>
            <div className="space-y-5">

              <div>
                <Label htmlFor="streetAddress" className="text-gray-700 font-semibold">
                  Jalan, RT/RW <span className="text-red-500">*</span>
                </Label>
                  <Textarea
                  id="streetAddress"
                  required
                  rows={3}
                  placeholder="Contoh: Jl. Magelang No. 123, RT 02/RW 05"
                  {...register('alamatJalan', {
                    onBlur: () => {
                      const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                      const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
                      const district = addressData.districts.find(d => d.id === selectedAddress.districtId);
                      const village = addressData.villages.find(v => v.id === selectedAddress.villageId);
                      updateFullAddress(
                        province?.province || '',
                        city?.name || '',
                        district?.name || '',
                        village?.name || ''
                      );
                    }
                  })}
                  className="mt-2 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">Masukkan alamat jalan, nomor rumah, RT/RW</p>
                
                {/* Address Preview for Indonesian Address */}
                {watchedCitizenship === 'Indonesia' && getValues().address && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 font-medium mb-1">Alamat Lengkap</p>
                    <p className="text-sm text-green-800 font-medium">{getValues().address}</p>
                    <p className="text-xs text-green-600 mt-1">Alamat ini akan tersimpan sebagai alamat lengkap Anda</p>
                  </div>
                )}
              </div>

              {/* Indonesian Address Dropdowns - Only show if WNI */}
              {watchedCitizenship === 'Indonesia' && (
                <div className="space-y-5">
                  

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Province Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold">
                        Provinsi <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedAddress.provinceId}
                        onValueChange={(value) => {
                          const province = addressData.provinces.find(p => p.id === value);
                          // Reset all dependent selections
                          setSelectedAddress(prev => ({ 
                            ...prev, 
                            provinceId: value,
                            cityId: '',
                            districtId: '',
                            villageId: ''
                          }));
                          if (province) {
                            loadCities(value);
                            updateFullAddress(province.province, '', '', '');
                          }
                        }}
                        disabled={addressData.loadingProvinces}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={addressData.loadingProvinces ? "Memuat provinsi..." : "-- Pilih Provinsi --"} />
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
                      <Label className="text-gray-700 font-semibold">
                        Kota/Kabupaten <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedAddress.cityId}
                        onValueChange={(value) => {
                          const city = addressData.cities.find(c => c.id === value);
                          const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                          // Reset dependent selections
                          setSelectedAddress(prev => ({ 
                            ...prev, 
                            cityId: value,
                            districtId: '',
                            villageId: ''
                          }));
                          if (city && province) {
                            loadDistricts(value);
                            updateFullAddress(province.province, city.name, '', '');
                          }
                        }}
                        disabled={!selectedAddress.provinceId || addressData.loadingCities}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={
                            !selectedAddress.provinceId ? "Pilih provinsi dulu" :
                            addressData.loadingCities ? "Memuat kota..." : 
                            "-- Pilih Kota/Kabupaten --"
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* District Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        Kecamatan
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                      </Label>
                      <Select
                        value={selectedAddress.districtId}
                        onValueChange={(value) => {
                          const district = addressData.districts.find(d => d.id === value);
                          const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
                          const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                          // Reset dependent selections
                          setSelectedAddress(prev => ({ 
                            ...prev, 
                            districtId: value,
                            villageId: ''
                          }));
                          if (district && city && province) {
                            loadVillages(value);
                            updateFullAddress(province.province, city.name, district.name, '');
                          }
                        }}
                        disabled={!selectedAddress.cityId || addressData.loadingDistricts}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={
                            !selectedAddress.cityId ? "Pilih kota dulu" :
                            addressData.loadingDistricts ? "Memuat kecamatan..." : 
                            "-- Pilih Kecamatan --"
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
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        Kelurahan/Desa
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                      </Label>
                      <Select
                        value={selectedAddress.villageId}
                        onValueChange={(value) => {
                          const village = addressData.villages.find(v => v.id === value);
                          const district = addressData.districts.find(d => d.id === selectedAddress.districtId);
                          const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
                          const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                          setSelectedAddress(prev => ({ ...prev, villageId: value }));
                          if (village && district && city && province) {
                            updateFullAddress(province.province, city.name, district.name, village.name);
                          }
                        }}
                        disabled={!selectedAddress.districtId || addressData.loadingVillages}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={
                            !selectedAddress.districtId ? "Pilih kecamatan dulu" :
                            addressData.loadingVillages ? "Memuat kelurahan..." : 
                            "-- Pilih Kelurahan/Desa --"
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
                </div>
              )}

              {/* Address Dropdowns for WNA - Same as WNI */}
              {watchedCitizenship === 'WNA' && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Province Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold">
                        Provinsi <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedAddress.provinceId}
                        onValueChange={(value) => {
                          const province = addressData.provinces.find(p => p.id === value);
                          // Reset all dependent selections
                          setSelectedAddress(prev => ({ 
                            ...prev, 
                            provinceId: value,
                            cityId: '',
                            districtId: '',
                            villageId: ''
                          }));
                          if (province) {
                            loadCities(value);
                            updateFullAddress(province.province, '', '', '');
                          }
                        }}
                        disabled={addressData.loadingProvinces}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={addressData.loadingProvinces ? "Memuat provinsi..." : "-- Pilih Provinsi --"} />
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
                      <Label className="text-gray-700 font-semibold">
                        Kota/Kabupaten <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedAddress.cityId}
                        onValueChange={(value) => {
                          const city = addressData.cities.find(c => c.id === value);
                          const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                          // Reset dependent selections
                          setSelectedAddress(prev => ({ 
                            ...prev, 
                            cityId: value,
                            districtId: '',
                            villageId: ''
                          }));
                          if (city && province) {
                            loadDistricts(value);
                            updateFullAddress(province.province, city.name, '', '');
                          }
                        }}
                        disabled={!selectedAddress.provinceId || addressData.loadingCities}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={
                            !selectedAddress.provinceId ? "Pilih provinsi dulu" :
                            addressData.loadingCities ? "Memuat kota..." : 
                            "-- Pilih Kota/Kabupaten --"
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* District Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        Kecamatan
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                      </Label>
                      <Select
                        value={selectedAddress.districtId}
                        onValueChange={(value) => {
                          const district = addressData.districts.find(d => d.id === value);
                          const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
                          const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                          // Reset dependent selections
                          setSelectedAddress(prev => ({ 
                            ...prev, 
                            districtId: value,
                            villageId: ''
                          }));
                          if (district && city && province) {
                            loadVillages(value);
                            updateFullAddress(province.province, city.name, district.name, '');
                          }
                        }}
                        disabled={!selectedAddress.cityId || addressData.loadingDistricts}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={
                            !selectedAddress.cityId ? "Pilih kota dulu" :
                            addressData.loadingDistricts ? "Memuat kecamatan..." : 
                            "-- Pilih Kecamatan --"
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
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        Kelurahan/Desa
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                      </Label>
                      <Select
                        value={selectedAddress.villageId}
                        onValueChange={(value) => {
                          const village = addressData.villages.find(v => v.id === value);
                          const district = addressData.districts.find(d => d.id === selectedAddress.districtId);
                          const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
                          const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                          setSelectedAddress(prev => ({ ...prev, villageId: value }));
                          if (village && district && city && province) {
                            updateFullAddress(province.province, city.name, district.name, village.name);
                          }
                        }}
                        disabled={!selectedAddress.districtId || addressData.loadingVillages}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder={
                            !selectedAddress.districtId ? "Pilih kecamatan dulu" :
                            addressData.loadingVillages ? "Memuat kelurahan..." : 
                            "-- Pilih Kelurahan/Desa --"
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
                </div>
              )}

              {/* Postal Code and Status - For both WNI and WNA */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="postalCode" className="text-gray-700 font-semibold">
                    Kode Pos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="postalCode"
                    required
                    maxLength={5}
                    placeholder="55281"
                    {...register('postalCode')}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Status Tempat Tinggal <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="statusRumah"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Status --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Milik Sendiri">🏠 Milik Sendiri</SelectItem>
                          <SelectItem value="Milik Orang Tua">👨‍👩‍👧 Milik Orang Tua</SelectItem>
                          <SelectItem value="Milik Instansi">🏢 Milik Instansi</SelectItem>
                          <SelectItem value="Kontrak/Sewa">📄 Kontrak/Sewa</SelectItem>
                          <SelectItem value="Lainnya">🔸 Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
               </div>
              </div>
              
              {/* Address Preview - For both WNI and WNA */}
              {getValues().address && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-medium mb-1">Alamat Lengkap</p>
                  <p className="text-sm text-green-800 font-medium">{getValues().address}</p>
                  <p className="text-xs text-green-600 mt-1">Alamat ini akan tersimpan sebagai alamat lengkap Anda</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-1 gap-5">
                 <div>
                    <Label className="text-gray-700 font-semibold flex items-center gap-2">
                      Alamat Domisili
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                    </Label>
                    <Input
                       placeholder="Kosongkan jika sama dengan alamat KIA"
                       {...register('alamatDomisili')}
                       className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Isi jika berbeda dengan alamat KIA</p>
                 </div>
              </div>

            </div>
          </div>

          {/* Section 4: Kontak Darurat (Optional) */}
          <div className="bg-slate-50 p-6 rounded-xl border-2 border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold text-emerald-800 text-lg">Kontak Darurat</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Opsional</span>
            </div>
            <p className="text-sm text-gray-600 mb-5 bg-white p-3 rounded-lg border border-slate-200">
              💡 Jika diisi, harap lengkapi semua field. Kontak darurat akan dihubungi jika terjadi hal penting terkait rekening Anda.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <Label htmlFor="kontakDaruratNama" className="text-gray-700 font-semibold">Nama Lengkap</Label>
                <Input
                  id="kontakDaruratNama"
                  placeholder="Nama kontak darurat"
                  {...register('kontakDaruratNama')}
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratNama ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.kontakDaruratNama && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {rhfErrors.kontakDaruratNama?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="kontakDaruratAlamat" className="text-gray-700 font-semibold">Alamat</Label>
                <Input
                  id="kontakDaruratAlamat"
                  placeholder="Alamat kontak darurat"
                  {...register('kontakDaruratAlamat')}
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratAlamat ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.kontakDaruratAlamat && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {rhfErrors.kontakDaruratAlamat?.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="kontakDaruratHubungan" className="text-gray-700 font-semibold">Hubungan</Label>
                <Controller
                  name="kontakDaruratHubungan"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratHubungan ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                        <SelectValue placeholder="-- Pilih --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Orang Tua">👨‍👩‍👧 Orang Tua</SelectItem>
                        <SelectItem value="Suami/Istri">💑 Suami/Istri</SelectItem>
                        <SelectItem value="Anak">👶 Anak</SelectItem>
                        <SelectItem value="Saudara Kandung">👫 Saudara Kandung</SelectItem>
                        <SelectItem value="Kerabat Lain">👥 Kerabat Lain</SelectItem>
                        <SelectItem value="Lainnya">✏️ Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {rhfErrors.kontakDaruratHubungan && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {rhfErrors.kontakDaruratHubungan?.message}
                  </p>
                )}
                {watchedEmergencyHubungan === 'Lainnya' && (
                  <Input
                    placeholder="Sebutkan hubungan lainnya"
                    {...register('kontakDaruratHubunganLainnya')}
                    className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="kontakDaruratHp" className="text-gray-700 font-semibold">Nomor HP</Label>
                <Input
                  id="kontakDaruratHp"
                  placeholder="08123456789"
                  {...register('kontakDaruratHp')}
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratHp ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.kontakDaruratHp && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {rhfErrors.kontakDaruratHp?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

        </section>
      )}

      {/* ========================================
          STEP 3: DATA PEKERJAAN & KEUANGAN
          ======================================== */}
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
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
              Informasi Pekerjaan
            </h4>
            <div className="space-y-5">

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                   <Label className="text-gray-700 font-semibold">
                     Pekerjaan <span className="text-red-500">*</span>
                   </Label>
                  <Controller
                    name="employmentStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Pekerjaan --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pelajar-mahasiswa">🎓 Pelajar / Mahasiswa</SelectItem>
                          <SelectItem value="karyawan-swasta">💼 Karyawan Swasta</SelectItem>
                          <SelectItem value="pns">🏛️ PNS / TNI / Polri</SelectItem>
                          <SelectItem value="wiraswasta">🏪 Wiraswasta</SelectItem>
                          <SelectItem value="ibu-rumah-tangga">🏠 Ibu Rumah Tangga</SelectItem>
                          <SelectItem value="lainnya">📋 Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-xs text-slate-500 mt-1">Default: Pelajar/Mahasiswa untuk SimPel</p>
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Penghasilan / Gaji per Bulan <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="monthlyIncome"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Range Penghasilan --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="< 3 Juta">💰 &lt; 3 Juta</SelectItem>
                          <SelectItem value="3 - 5 Juta">💰 3 - 5 Juta</SelectItem>
                          <SelectItem value="5 - 10 Juta">💰💰 5 - 10 Juta</SelectItem>
                          <SelectItem value="> 10 Juta">💰💰💰 &gt; 10 Juta</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
               </div>

              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'pelajar-mahasiswa' ? 'Nama Sekolah / Universitas' : 'Nama Perusahaan'}
                    </Label>
                    <Input
                      {...register('tempatBekerja')}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
                 <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'pelajar-mahasiswa' ? 'Kelas / Jurusan' : 'Jabatan'}
                    </Label>
                    <Input
                      {...register('jabatan')}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'pelajar-mahasiswa' ? 'Alamat Sekolah / Universitas' : 'Alamat Kantor'}
                    </Label>
                    <Input
                      {...register('alamatKantor')}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
                 <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'pelajar-mahasiswa' ? 'Telepon Sekolah / Universitas' : 'Telepon Kantor'}
                    </Label>
                    <Input
                      placeholder="021-12345678"
                      {...register('teleponKantor')}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>

              </div>

              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                    <Label className="text-gray-700">Bidang Usaha (Jika Bekerja)</Label>
                    <Input
                      placeholder="Contoh: Perdagangan, Jasa..."
                      {...register('bidangUsaha')}
                      className="mt-2 h-12 rounded-md"
                    />
                 </div>
                 <div>
                    <Label className="text-gray-700">Rata-rata Transaksi per Bulan</Label>
                    <Controller
                      name="rataRataTransaksi"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="text"
                          placeholder="Contoh: 1.000.000"
                          value={formatRupiah(field.value)}
                          onChange={(e) => {
                            const cleanValue = e.target.value.replace(/\D/g, '');
                            field.onChange(cleanValue);
                          }}
                          className="mt-2 h-12 rounded-md"
                        />
                      )}
                    />
                 </div>
              </div>


              <div>
                <Label htmlFor="sumberDana" className="text-gray-700">Sumber Dana</Label>
                <Controller
                  name="sumberDana"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-md">
                        <SelectValue placeholder="Pilih sumber dana" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gaji">Gaji</SelectItem>
                        <SelectItem value="Hasil Usaha">Hasil Usaha</SelectItem>
                        <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                        <SelectItem value="Beasiswa">Beasiswa</SelectItem>
                        <SelectItem value="Warisan">Warisan</SelectItem>
                        <SelectItem value="Tabungan">Tabungan Pribadi</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* EDD Bank Lain Section */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-emerald-800 mb-3">Rekening Bank Lain (Opsional)</h4>
                <p className="text-xs text-gray-500 mb-4">Tambahkan informasi rekening bank lain yang Anda miliki</p>
                
                {bankFields.map((field, index) => (
                  <div key={field.id} className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Rekening Bank #{index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeBank(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-700">Nama Bank</Label>
                        <Input
                          placeholder="Contoh: BCA, Mandiri"
                          {...register(`eddBankLain.${index}.bank_name`)}
                          className="mt-2 h-10 rounded-md"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Jenis Rekening</Label>
                        <Controller
                          name={`eddBankLain.${index}.jenis_rekening`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="mt-2 h-10 rounded-md">
                                <SelectValue placeholder="Pilih jenis" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tabungan">Tabungan</SelectItem>
                                <SelectItem value="Giro">Giro</SelectItem>
                                <SelectItem value="Deposito">Deposito</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Nomor Rekening</Label>
                        <Input
                          placeholder="Nomor rekening"
                          {...register(`eddBankLain.${index}.nomor_rekening`)}
                          className="mt-2 h-10 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendBank({ bank_name: '', jenis_rekening: '', nomor_rekening: '' })}
                  className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                >
                  + Tambah Rekening Bank
                </button>
              </div>

              {/* EDD Pekerjaan Lain Section */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-emerald-800 mb-3">Pekerjaan/Usaha Lain (Opsional)</h4>
                <p className="text-xs text-gray-500 mb-4">Tambahkan informasi pekerjaan atau usaha sampingan lainnya</p>
                
                {workFields.map((field, index) => (
                  <div key={field.id} className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">Pekerjaan/Usaha #{index + 1}</h5>
                      <button
                        type="button"
                        onClick={() => removeWork(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                    <div>
                      <Label className="text-gray-700">Jenis Usaha/Pekerjaan</Label>
                      <Input
                        placeholder="Contoh: Freelance, Toko Online, Konsultan"
                        {...register(`eddPekerjaanLain.${index}.jenis_usaha`)}
                        className="mt-2 h-10 rounded-md"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => appendWork({ jenis_usaha: '' })}
                  className="w-full p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition"
                >
                  + Tambah Pekerjaan/Usaha
                </button>
              </div>


            </div>
            
          </div>

        </div>
      )}

      {/* ========================================
          STEP 4: DATA REKENING
          ======================================== */}
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
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
              Detail Rekening
            </h4>
            <div className="space-y-5">
              
              {/* Account Type - Pre-filled and Read-only for Simpel */}
              <div>
                <Label htmlFor="jenis_rekening" className="text-gray-700">Jenis Rekening</Label>
                <Input
                  id="jenis_rekening"
                  value="SimPel"
                  readOnly
                  disabled
                  className="mt-2 h-12 rounded-md bg-slate-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Jenis rekening SimPel (Simpanan Pelajar)</p>
              </div>

              {/* Initial Deposit Amount */}
              <div>
                <Label htmlFor="nominalSetoran" className="text-gray-700">Nominal Setoran Awal</Label>
                <Controller
                    name="nominalSetoran"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="text"
                        required
                        placeholder="Contoh: 100.000"
                        value={formatRupiah(field.value)}
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/\D/g, '');
                          field.onChange(cleanValue);
                        }}
                        className={`mt-2 h-14 rounded-lg border-2 ${rhfErrors.nominalSetoran ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                      />
                    )}
                  />
                {rhfErrors.nominalSetoran && <p className="text-sm text-red-600 mt-1">{rhfErrors.nominalSetoran?.message}</p>}
                <p className="text-xs text-gray-500 mt-1">Minimal setoran awal untuk rekening SimPel adalah Rp 5.000</p>
              </div>

              {/* ATM Preference */}
              {/* <div>
                <Label className="text-gray-700">Preferensi Kartu ATM</Label>
                <Select
                  value={formData.atmPreference}
                  onValueChange={(value) => setFormData({ ...formData, atmPreference: value })}
                >
                  <SelectTrigger className="mt-2 h-12 rounded-md">
                    <SelectValue placeholder="Pilih preferensi kartu ATM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tidak">Tidak Perlu Kartu ATM</SelectItem>
                    <SelectItem value="ya">Ya, Saya Ingin Kartu ATM</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Kartu ATM dapat digunakan untuk transaksi di seluruh jaringan ATM Bank Sleman</p>
              </div> */}

              {/* Account Purpose - Already exists, just add conditional "other" input */}
              <div>
                <Label htmlFor="tujuanRekening" className="text-gray-700">Tujuan Pembukaan Rekening</Label>
                <Controller
                  name="tujuanRekening"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                        <SelectValue placeholder="-- Pilih Tujuan --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Menabung">💰 Menabung</SelectItem>
                        <SelectItem value="Investasi">📈 Investasi</SelectItem>
                        <SelectItem value="Transaksi Bisnis">💼 Transaksi Bisnis</SelectItem>
                        <SelectItem value="Gaji">💳 Penerimaan Gaji</SelectItem>
                        <SelectItem value="Lainnya">✏️ Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                
                {/* Conditional "other" purpose text input */}
                {watch('tujuanRekening') === 'Lainnya' && (
                  <Input
                    id="tujuanRekeningLainnya"
                    placeholder="Sebutkan tujuan pembukaan rekening"
                    {...register('tujuanRekeningLainnya')}
                    className="mt-3 h-12 rounded-md"
                  />
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Kepemilikan Rekening */}
          <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
              Kepemilikan Rekening
            </h4>
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <Label className="text-gray-800 font-semibold mb-4 block text-lg">Apakah rekening ini untuk Anda sendiri?</Label>
              <div className="flex items-center gap-6 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="rekeningUntukSendiri" 
                    value="true" 
                    checked={watch('rekeningUntukSendiri') === true} 
                    onChange={() => setValue('rekeningUntukSendiri', true)} 
                    className="hidden" 
                  />
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${watch('rekeningUntukSendiri') === true ? "border-blue-500" : "border-gray-300"}`}>
                    {watch('rekeningUntukSendiri') === true && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </span>
                  <span className="text-sm text-gray-700">Ya, untuk saya sendiri</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="rekeningUntukSendiri" 
                    value="false" 
                    checked={watch('rekeningUntukSendiri') === false} 
                    onChange={() => setValue('rekeningUntukSendiri', false)} 
                    className="hidden" 
                  />
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${watch('rekeningUntukSendiri') === false ? "border-blue-500" : "border-gray-300"}`}>
                    {watch('rekeningUntukSendiri') === false && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </span>
                  <span className="text-sm text-gray-700">Tidak, untuk orang lain</span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Informasi Beneficial Owner (pemilik manfaat sebenarnya) diperlukan jika rekening ini untuk orang lain.
              </p>
            </div>
          </div>

          {/* Section 3: Beneficial Owner (Conditional) */}
          {watch('rekeningUntukSendiri') === false && (
          <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200 shadow-sm">
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
              
              {/* BO Name */}
              <div>
                <Label htmlFor="boNama" className="text-gray-700">Nama Lengkap Beneficial Owner</Label>
                <Input
                  id="boNama"
                  required
                  placeholder="Nama lengkap sesuai identitas"
                  {...register('boNama')}
                  className={`mt-2 h-12 rounded-md ${rhfErrors.boNama ? 'border-red-500' : ''}`}
                />
                {rhfErrors.boNama && <p className="text-sm text-red-600 mt-1">{rhfErrors.boNama?.message}</p>}
              </div>

              {/* BO Address */}
              <div>
                <Label htmlFor="boAlamat" className="text-gray-700">Alamat Lengkap</Label>
                <Textarea
                  id="boAlamat"
                  required
                  rows={2}
                  placeholder="Alamat lengkap beneficial owner"
                  {...register('boAlamat')}
                  className={`mt-2 ${rhfErrors.boAlamat ? 'border-red-500' : ''}`}
                />
                {rhfErrors.boAlamat && <p className="text-sm text-red-600 mt-1">{rhfErrors.boAlamat?.message}</p>}
              </div>

              {/* BO Place and Date of Birth */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="boTempatLahir" className="text-gray-700">Tempat Lahir</Label>
                  <Input
                    id="boTempatLahir"
                    required
                    placeholder="Kota kelahiran"
                    {...register('boTempatLahir')}
                    className={`mt-2 h-12 rounded-md ${rhfErrors.boTempatLahir ? 'border-red-500' : ''}`}
                  />
                  {rhfErrors.boTempatLahir && <p className="text-sm text-red-600 mt-1">{rhfErrors.boTempatLahir?.message}</p>}
                </div>
                <div>
                  <Label htmlFor="boTanggalLahir" className="text-gray-700">Tanggal Lahir</Label>
                  <Input
                    id="boTanggalLahir"
                    type="date"
                    required
                    {...register('boTanggalLahir')}
                    className={`mt-2 h-12 rounded-md ${rhfErrors.boTanggalLahir ? 'border-red-500' : ''}`}
                  />
                  {rhfErrors.boTanggalLahir && <p className="text-sm text-red-600 mt-1">{rhfErrors.boTanggalLahir?.message}</p>}
                </div>
              </div>

              {/* BO Gender, Citizenship, Marital Status */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label className="text-gray-700">Jenis Kelamin</Label>
                  <Controller
                    name="boJenisKelamin"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boJenisKelamin ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">👨 Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">👩 Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {rhfErrors.boJenisKelamin && <p className="text-sm text-red-600 mt-1">{rhfErrors.boJenisKelamin?.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-700">Kewarganegaraan</Label>
                  <Controller
                    name="boKewarganegaraan"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boKewarganegaraan ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih kewarganegaraan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WNI">🇮🇩 WNI (Warga Negara Indonesia)</SelectItem>
                          <SelectItem value="WNA">🌍 WNA (Warga Negara Asing)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {rhfErrors.boKewarganegaraan && <p className="text-sm text-red-600 mt-1">{rhfErrors.boKewarganegaraan?.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-700">Status Pernikahan</Label>
                  <Controller
                    name="boStatusPernikahan"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boStatusPernikahan ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Belum Kawin">Belum Kawin</SelectItem>
                          <SelectItem value="Kawin">Kawin</SelectItem>
                          <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                          <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {rhfErrors.boStatusPernikahan && <p className="text-sm text-red-600 mt-1">{rhfErrors.boStatusPernikahan?.message}</p>}
                </div>
              </div>

              {/* BO Identity Type & Number */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Jenis Identitas</Label>
                  <Controller
                    name="boJenisId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Clear boNomorId error when identity type changes
                          clearErrors('boNomorId');
                        }}
                      >
                        <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boJenisId ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih jenis identitas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KIA">KIA</SelectItem>
                          <SelectItem value="Paspor">Paspor</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {rhfErrors.boJenisId && <p className="text-sm text-red-600 mt-1">{rhfErrors.boJenisId?.message}</p>}
                </div>
                <div>
                  <Label htmlFor="boNomorId" className="text-gray-700">Nomor Identitas</Label>
                  <Input
                    id="boNomorId"
                    required
                    placeholder={watch('boJenisId') === 'KIA' ? '16 digit' : 'Nomor identitas'}
                    {...register('boNomorId')}
                    className={`mt-2 h-12 rounded-md ${rhfErrors.boNomorId ? 'border-red-500' : ''}`}
                  />
                  {rhfErrors.boNomorId && <p className="text-sm text-red-600 mt-1">{rhfErrors.boNomorId?.message}</p>}
                </div>
              </div>

              {/* BO Occupation */}
              <div>
                <Label htmlFor="boPekerjaan" className="text-gray-700">Pekerjaan</Label>
                <Input
                  id="boPekerjaan"
                  required
                  placeholder="Pekerjaan beneficial owner"
                  {...register('boPekerjaan')}
                  className={`mt-2 h-12 rounded-md ${rhfErrors.boPekerjaan ? 'border-red-500' : ''}`}
                />
                {rhfErrors.boPekerjaan && <p className="text-sm text-red-600 mt-1">{rhfErrors.boPekerjaan?.message}</p>}
              </div>

              {/* BO Source of Funds, Relationship, Phone */}
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <Label className="text-gray-700">Sumber Dana</Label>
                  <Controller
                    name="boSumberDana"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boSumberDana ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih sumber dana" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gaji">💰 Gaji</SelectItem>
                          <SelectItem value="Hasil Usaha">🏪 Hasil Usaha</SelectItem>
                          <SelectItem value="Investasi">📈 Investasi</SelectItem>
                          <SelectItem value="Warisan">🏛️ Warisan</SelectItem>
                          <SelectItem value="Hibah">🎁 Hibah</SelectItem>
                          <SelectItem value="Lainnya">📋 Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {rhfErrors.boSumberDana && <p className="text-sm text-red-600 mt-1">{rhfErrors.boSumberDana?.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-700">Hubungan dengan Anda</Label>
                  <Controller
                    name="boHubungan"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boHubungan ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih hubungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Orang Tua">👨‍👩‍👧 Orang Tua</SelectItem>
                          <SelectItem value="Anak">👶 Anak</SelectItem>
                          <SelectItem value="Suami/Istri">💑 Suami/Istri</SelectItem>
                          <SelectItem value="Saudara Kandung">👫 Saudara Kandung</SelectItem>
                          <SelectItem value="Kerabat">👥 Kerabat</SelectItem>
                          <SelectItem value="Teman">🤝 Teman</SelectItem>
                          <SelectItem value="Lainnya">📋 Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {rhfErrors.boHubungan && <p className="text-sm text-red-600 mt-1">{rhfErrors.boHubungan?.message}</p>}
                </div>
                <div>
                  <Label htmlFor="boNomorHp" className="text-gray-700">Nomor HP</Label>
                  <Input
                    id="boNomorHp"
                    type="tel"
                    required
                    placeholder="08123456789"
                    {...register('boNomorHp')}
                    className={`mt-2 h-12 rounded-md ${rhfErrors.boNomorHp ? 'border-red-500' : ''}`}
                  />
                  {rhfErrors.boNomorHp && <p className="text-sm text-red-600 mt-1">{rhfErrors.boNomorHp?.message}</p>}
                </div>
              </div>

              {/* BO Annual Income */}
              <div>
                <Label className="text-gray-700">Pendapatan per Tahun</Label>
                <Controller
                  name="boPendapatanTahun"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={`mt-2 h-12 rounded-md ${rhfErrors.boPendapatanTahun ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Pilih range pendapatan tahunan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sd-5jt">Sampai dengan 5 Juta</SelectItem>
                        <SelectItem value="5-10jt">5 - 10 Juta</SelectItem>
                        <SelectItem value="10-25jt">10 - 25 Juta</SelectItem>
                        <SelectItem value="25-100jt">25 - 100 Juta</SelectItem>
                        <SelectItem value=">100jt">Lebih dari 100 Juta</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {rhfErrors.boPendapatanTahun && <p className="text-sm text-red-600 mt-1">{rhfErrors.boPendapatanTahun?.message}</p>}
              </div>

              {/* BO Approval Checkbox */}
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                <div className="flex items-start gap-4">
                  <Controller
                    name="boPersetujuan"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="boPersetujuan"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        required
                        className={`mt-1 ${rhfErrors.boPersetujuan ? 'border-red-500' : ''}`}
                      />
                    )}
                  />
                  <div>
                    <Label htmlFor="boPersetujuan" className="cursor-pointer text-gray-800 font-medium">
                      Persetujuan Beneficial Owner
                    </Label>
                    <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                      Saya menyatakan bahwa informasi beneficial owner yang saya berikan adalah benar dan akurat. 
                      Saya memahami bahwa informasi ini diperlukan untuk kepatuhan terhadap peraturan anti pencucian uang 
                      dan pendanaan terorisme.
                    </p>
                  </div>
                </div>
                {rhfErrors.boPersetujuan && <p className="text-sm text-red-600 mt-2">{rhfErrors.boPersetujuan?.message}</p>}
              </div>

            </div>
          </div>
          )}


        </div>
      )}

      {/* ========================================
          STEP 5: REVIEW & PERSETUJUAN
          ======================================== */}
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
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>📍</span>
                  <span>Lokasi Cabang</span>
                </h4>
              </div>
              <div className="text-gray-700">
                <p className="font-medium">{branches.find((b: any) => b.id.toString() === getValues().cabang_pengambilan)?.nama_cabang || getValues().cabang_pengambilan}</p>
              </div>
            </div>

            {/* 2. Data Diri */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>👤</span>
                  <span>Data Diri Nasabah</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nama Lengkap</p>
                  <p className="font-medium text-gray-800">{getValues().fullName}</p>
                </div>
                <div>
                  <p className="text-gray-500">NIK / Identitas</p>
                  <p className="font-medium text-gray-800">{getValues().nik}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tempat, Tanggal Lahir</p>
                  <p className="font-medium text-gray-800">{getValues().tempatLahir}, {getValues().birthDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Jenis Kelamin</p>
                  <p className="font-medium text-gray-800">{getValues().gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{getValues().email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nomor Telepon</p>
                  <p className="font-medium text-gray-800">{getValues().phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500">Alamat</p>
                  <p className="font-medium text-gray-800">{getValues().address}, {getValues().city}, {getValues().province} {getValues().postalCode}</p>
                </div>
              </div>
            </div>

            {/* 3. Data Pekerjaan & Keuangan */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>💼</span>
                  <span>Data Pekerjaan & Keuangan</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Pekerjaan</p>
                  <p className="font-medium text-gray-800">{getValues().employmentStatus}</p>
                </div>
                <div>
                  <p className="text-gray-500">Penghasilan per Bulan</p>
                  <p className="font-medium text-gray-800">{getValues().monthlyIncome}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sumber Dana</p>
                  <p className="font-medium text-gray-800">{getValues().sumberDana}</p>
                </div>
                <div>
                  <p className="text-gray-500">Rata-rata Transaksi</p>
                  <p className="font-medium text-gray-800">{getValues().rataRataTransaksi}</p>
                </div>
              </div>
            </div>

            {/* 4. Data Rekening */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>💳</span>
                  <span>Data Rekening</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Jenis Rekening</p>
                  <p className="font-medium text-gray-800">SimPel</p>
                </div>
                <div>
                  <p className="text-gray-500">Setoran Awal</p>
                  <p className="font-medium text-gray-800">Rp {parseFloat(getValues().nominalSetoran || '0').toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tujuan Pembukaan</p>
                  <p className="font-medium text-gray-800">{getValues().tujuanRekening}</p>
                </div>
                <div>
                  <p className="text-gray-500">Kepemilikan</p>
                  <p className="font-medium text-gray-800">{getValues().rekeningUntukSendiri ? 'Untuk Sendiri' : 'Untuk Orang Lain'}</p>
                </div>
              </div>
              
              {/* Show BO if exists */}
              {!getValues().rekeningUntukSendiri && getValues().boNama && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-gray-500 font-medium mb-2">Beneficial Owner</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nama</p>
                      <p className="font-medium text-gray-800">{getValues().boNama}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nomor Identitas</p>
                      <p className="font-medium text-gray-800">{getValues().boNomorId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pekerjaan</p>
                      <p className="font-medium text-gray-800">{getValues().boPekerjaan}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pendapatan Tahunan</p>
                      <p className="font-medium text-gray-800">{getValues().boPendapatanTahun}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Persetujuan */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border-2 border-emerald-200 shadow-sm">
            <h4 className="font-bold text-emerald-900 text-xl mb-6">Persetujuan</h4>
            
            {/* Terms & Conditions */}
            <div className="flex items-start gap-4 mb-4">
              <Controller
                name="agreeTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    required
                    className="mt-1"
                  />
                )}
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
            {getValues().rekeningUntukSendiri === false && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-amber-200">
                <Controller
                  name="boPersetujuan"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="boApproval"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      required
                      className="mt-1"
                    />
                  )}
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

          <TermsModal open={showTermsModal} onClose={() => setShowTermsModal(false)} />
        </div>
      )}
    </div>
  );
}
