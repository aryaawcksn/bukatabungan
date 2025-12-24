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

const FormTabunganku = ({
   branches = [],
   currentStep = 1,
   savingsType,
   getSavingsTypeName,
}: Omit<AccountFormProps, 'formData' | 'setFormData' | 'errors' | 'setErrors' | 'getFieldClass'>) => {
  const { register, control, setValue, getValues, watch, clearErrors, setError, formState: { errors: rhfErrors } } = useFormContext<AccountFormData>();

  const [showTermsModal, setShowTermsModal] = useState(false);

  // Watch fields for conditional logic
  const watchedRekeningUntukSendiri = useWatch({ control, name: 'rekeningUntukSendiri' });
  const watchedTipeNasabah = useWatch({ control, name: 'tipeNasabah' });
  const watchedCitizenship = useWatch({ control, name: 'citizenship' });
  const watchedEmergencyHubungan = useWatch({ control, name: 'kontakDaruratHubungan' });
  
  // Field arrays for EDD
  const { fields: bankFields, append: appendBank, remove: removeBank } = useFieldArray({
    control,
    name: 'eddBankLain'
  });
  
  const { fields: pekerjaanFields, append: appendPekerjaan, remove: removePekerjaan } = useFieldArray({
    control,
    name: 'eddPekerjaanLain'
  });

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

  const watchedJenisId = useWatch({ control, name: 'jenisId' });
  const watchedEmploymentStatus = useWatch({ control, name: 'employmentStatus' });
  const watchedSumberDana = useWatch({ control, name: 'sumberDana' });
  const watchedTujuanRekening = useWatch({ control, name: 'tujuanRekening' });

  // Helper function to format NPWP
  const formatNPWP = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Apply NPWP format: XX.XXX.XXX.X-XXX.XXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}.${numbers.slice(8, 9)}-${numbers.slice(9, 12)}.${numbers.slice(12, 15)}`;
  };

  // Handle NPWP input formatting
  const handleNPWPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNPWP(e.target.value);
    setValue('npwp', formatted, { shouldValidate: true });
  };

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

  // State to store the street address separately (not in formData)
  const [streetAddress, setStreetAddress] = useState('');

  // Auto-set jenis_rekening based on savings type
  useEffect(() => {
    // const currentStatus = getValues('employmentStatus');
    // if (currentStatus !== 'Pelajar/Mahasiswa') {
    //   setValue('employmentStatus', 'Pelajar/Mahasiswa', { shouldValidate: true });
    // }
    // Set jenis_rekening based on savings type from URL
    setValue('jenis_rekening', getSavingsTypeName(), { shouldValidate: false });
    if (!getValues('tipeNasabah')) {
      setValue('tipeNasabah', 'baru');
    }
  }, [setValue, getValues, getSavingsTypeName]);

  // Validation function for age requirement
  const validateAge = (birthDate: string): string | boolean => {
    if (!birthDate) return true;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age < 17) {
      return 'Usia minimal untuk membuka rekening Mutiara adalah 17 tahun';
    }
    
    return true;
  };

  // Validation function for reference contact completeness


  // Validation function for beneficial owner completeness
  const validateBeneficialOwner = (): void => {
    clearErrors([
      'boNama', 'boAlamat', 'boTempatLahir', 'boTanggalLahir', 'boJenisKelamin',
      'boKewarganegaraan', 'boStatusPernikahan', 'boJenisId', 'boNomorId',
      'boSumberDana', 'boSumberDanaCustom', 'boHubungan', 'boHubunganCustom',
      'boNomorHp', 'boPekerjaan', 'boPendapatanTahun', 'boPersetujuan'
    ]);

    if (watchedRekeningUntukSendiri === false) {
      const data = getValues();
      
      if (!data.boNama) setError('boNama', { type: 'manual', message: 'Nama beneficial owner harus diisi' });
      if (!data.boAlamat) setError('boAlamat', { type: 'manual', message: 'Alamat beneficial owner harus diisi' });
      if (!data.boTempatLahir) setError('boTempatLahir', { type: 'manual', message: 'Tempat lahir beneficial owner harus diisi' });
      if (!data.boTanggalLahir) setError('boTanggalLahir', { type: 'manual', message: 'Tanggal lahir beneficial owner harus diisi' });
      if (!data.boJenisKelamin) setError('boJenisKelamin', { type: 'manual', message: 'Jenis kelamin beneficial owner harus dipilih' });
      if (!data.boKewarganegaraan) setError('boKewarganegaraan', { type: 'manual', message: 'Kewarganegaraan beneficial owner harus dipilih' });
      if (!data.boStatusPernikahan) setError('boStatusPernikahan', { type: 'manual', message: 'Status pernikahan beneficial owner harus dipilih' });
      if (!data.boJenisId) setError('boJenisId', { type: 'manual', message: 'Jenis identitas beneficial owner harus dipilih' });
      if (!data.boNomorId) setError('boNomorId', { type: 'manual', message: 'Nomor identitas beneficial owner harus diisi' });
      if (!data.boSumberDana) setError('boSumberDana', { type: 'manual', message: 'Sumber dana beneficial owner harus dipilih' });
      
      if (data.boSumberDana === 'Lainnya' && !data.boSumberDanaCustom?.trim()) {
        setError('boSumberDanaCustom', { type: 'manual', message: 'Sumber dana lainnya harus diisi' });
      }
      
      if (!data.boHubungan) setError('boHubungan', { type: 'manual', message: 'Hubungan dengan beneficial owner harus dipilih' });
      
      if (data.boHubungan === 'Lainnya' && !data.boHubunganCustom?.trim()) {
        setError('boHubunganCustom', { type: 'manual', message: 'Hubungan lainnya harus diisi' });
      }
      
      if (!data.boNomorHp) setError('boNomorHp', { type: 'manual', message: 'Nomor HP beneficial owner harus diisi' });
      if (!data.boPekerjaan) setError('boPekerjaan', { type: 'manual', message: 'Pekerjaan beneficial owner harus diisi' });
      if (!data.boPendapatanTahun) setError('boPendapatanTahun', { type: 'manual', message: 'Pendapatan tahunan beneficial owner harus dipilih' });
      if (!data.boPersetujuan) setError('boPersetujuan', { type: 'manual', message: 'Persetujuan beneficial owner harus dicentang' });
    }
  };

  // Validation function for emergency contact completeness
  const validateEmergencyContact = (): void => {
    clearErrors(['kontakDaruratNama', 'kontakDaruratHp', 'kontakDaruratAlamat', 'kontakDaruratHubungan', 'kontakDaruratHubunganLainnya']);
    
    const { 
      kontakDaruratNama, kontakDaruratHp, kontakDaruratAlamat, 
      kontakDaruratHubungan, kontakDaruratHubunganLainnya 
    } = getValues();
    
    // Check if any emergency contact field is filled
    const anyFieldFilled = kontakDaruratNama || kontakDaruratHp || kontakDaruratAlamat || kontakDaruratHubungan;
    
    if (anyFieldFilled) {
      if (!kontakDaruratNama) setError('kontakDaruratNama', { type: 'manual', message: 'Nama kontak darurat harus diisi jika mengisi kontak darurat' });
      if (!kontakDaruratHp) setError('kontakDaruratHp', { type: 'manual', message: 'Nomor HP kontak darurat harus diisi jika mengisi kontak darurat' });
      if (!kontakDaruratHubungan) setError('kontakDaruratHubungan', { type: 'manual', message: 'Hubungan kontak darurat harus diisi jika mengisi kontak darurat' });
      
      if (kontakDaruratHubungan === 'Lainnya' && !kontakDaruratHubunganLainnya?.trim()) {
        setError('kontakDaruratHubunganLainnya', { type: 'manual', message: 'Hubungan lainnya harus diisi' });
      }
    }
  };

  // Minimum deposit amounts for each account type
  // const MINIMUM_DEPOSITS: Record<string, number> = {
  //   'SimPel': 5000,
  //   'Reguler': 10000,
  //   'Mutiara': 20000,
  //   'TabunganKu': 1,
  //   'Arofah': 10000,
  //   'Pensiun': 10000,
  //   'TamasyaPlus': 100000,
  // };

  // Validation function for minimum deposit
  // const validateMinimumDeposit = (accountType: string, depositAmount: string): string => {
  //   if (!depositAmount) return '';
    
  //   const amount = parseFloat(depositAmount);
  //   if (isNaN(amount)) {
  //     return 'Nominal setoran harus berupa angka';
  //   }
    
  //   const minimumDeposit = MINIMUM_DEPOSITS[accountType] || 0;
    
  //   if (amount < minimumDeposit) {
  //     return `Nominal setoran minimal untuk rekening ${accountType} adalah Rp ${minimumDeposit.toLocaleString('id-ID')}`;
  //   }
    
  //   return '';
  // };



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


  useEffect(() => {
    if (watchedCitizenship === 'Indonesia' || watchedCitizenship === 'WNA') {
      loadProvinces();
    } else {
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
    
    if (street && street.trim()) {
      addressParts.push(street.trim());
    }
    
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

  // Update full address when street address changes
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
    } else if (!watchedCitizenship || (watchedCitizenship !== 'Indonesia' && watchedCitizenship !== 'WNA')) {
      const street = getValues().alamatJalan;
      setValue('address', street || '', { shouldValidate: false });
      setValue('province', '', { shouldValidate: false });
      setValue('city', '', { shouldValidate: false });
      setValue('kecamatan', '', { shouldValidate: false });
      setValue('kelurahan', '', { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCitizenship, selectedAddress.provinceId, selectedAddress.cityId, selectedAddress.districtId, selectedAddress.villageId, addressData.provinces, addressData.cities, addressData.districts, addressData.villages]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ========================================
          STEP 1: PILIH CABANG
          ======================================== */}
      {currentStep === 1 && (
        <section className="space-y-6" aria-labelledby="branch-selection-heading">
          {/* Header */}
          {/* <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-emerald-900 mb-3 text-3xl font-bold">Pilih Lokasi Cabang</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Silakan pilih kantor cabang Bank Sleman terdekat untuk pengambilan buku tabungan Mutiara Anda.
            </p>
          </div> */}
          
          {/* Branch Selection */}
          <div className="max-w-5xl mx-auto">
            <fieldset className="bg-white p-4 md:p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
              <legend className="sr-only">Pilihan Cabang</legend>
              <Label htmlFor="cabang_pengambilan" className="text-gray-800 font-semibold text-lg mb-3 block">
                Kantor Cabang  <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="cabang_pengambilan"
                control={control}
                rules={{ required: 'Kantor cabang harus dipilih' }}
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
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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
              {rhfErrors.cabang_pengambilan && (
                <p className="text-sm text-red-600 mt-1">{rhfErrors.cabang_pengambilan.message}</p>
              )}
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
          <article className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
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
                  Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName', { required: 'Nama lengkap harus diisi' })}
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.fullName ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.fullName && <p className="text-sm text-red-600 mt-1">{rhfErrors.fullName.message}</p>}
              </div>

              {/* Alias */}
              <div>
                <Label htmlFor="alias" className="text-gray-700 font-semibold flex items-center gap-2">
                  Nama Panggilan / Alias
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">Opsional</span>
                </Label>
                <Input
                  id="alias"
                  {...register('alias')}
                  placeholder="Nama panggilan atau alias"
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
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value: 'baru' | 'lama') => {
                        field.onChange(value);
                        setValue('nomorRekeningLama', '');
                        clearErrors('nomorRekeningLama');
                      }}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                        <SelectValue placeholder="-- Pilih Tipe Nasabah --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baru">Nasabah Baru</SelectItem>
                        <SelectItem value="lama">Nasabah Lama</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Nomor Rekening Lama - Only show if nasabah lama */}
              {watchedTipeNasabah === 'lama' && (
                <div>
                  <Label htmlFor="nomorRekeningLama" className="text-gray-700 font-semibold">
                    Nomor Rekening yang Sudah Ada <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nomorRekeningLama"
                    {...register('nomorRekeningLama', { 
                      required: watchedTipeNasabah === 'lama' ? 'Nomor rekening lama harus diisi' : false 
                    })}
                    placeholder="Masukkan nomor rekening yang sudah ada"
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

              {/* Identity Type & Number */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Jenis Identitas <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="jenisId"
                    control={control}
                    rules={{ required: 'Jenis identitas harus dipilih' }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue('nik', '');
                          clearErrors('nik');
                        }}
                      >
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Jenis Identitas --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KTP">KTP</SelectItem>
                          <SelectItem value="Paspor">Paspor</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {watchedJenisId === 'Lainnya' && (
                    <Input
                      {...register('jenisIdCustom')}
                      placeholder="Sebutkan jenis identitas"
                      className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="nik" className="text-gray-700 font-semibold">
                    {watchedJenisId === 'KTP' ? 'Nomor KTP' : watchedJenisId === 'Paspor' ? 'Nomor Paspor' : 'Nomor Identitas'} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nik"
                    {...register('nik', { 
                      required: 'Nomor identitas harus diisi',
                      validate: (val) => {
                        const jenisIdValue = getValues('jenisId');
                        if (jenisIdValue === 'KTP' && val.length !== 16) return 'NIK harus 16 digit';
                        return true;
                      }
                    })}
                    placeholder={watchedJenisId === 'KTP' ? 'Masukkan 16 digit NIK' : watchedJenisId === 'Paspor' ? 'Masukkan 6-9 karakter' : 'Masukkan nomor identitas'}
                    maxLength={watchedJenisId === 'KTP' ? 16 : undefined}
                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.nik ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {rhfErrors.nik && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {rhfErrors.nik.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Validity Date - Exclude KTP (lifetime validity) */}
              {watchedJenisId !== 'KTP' && (
  <div className="md:col-span-2">
    <Label htmlFor="berlakuId" className="text-gray-700 font-semibold">
      Masa Berlaku Identitas <span className="text-red-500">*</span>
    </Label>
    
    {/* Hapus space-y-3 atau ganti jadi yang lebih kecil seperti space-y-1 */}
    <div className="mt-2"> 
      <Input
        id="berlakuId"
        {...register('berlakuId', { 
          required: watchedJenisId !== 'KTP' ? 'Masa berlaku harus diisi' : false 
        })}
        type="date"
        className={`h-12 rounded-lg border-2 ${rhfErrors.berlakuId ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
      />
      
      {/* Pesan Error */}
      {rhfErrors.berlakuId && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {rhfErrors.berlakuId.message}
        </p>
      )}

      {/* Teks Bantuan (Kecil di bawah) */}
      <p className="text-xs text-slate-500 mt-1">
        {watchedJenisId === 'Paspor' ? 'Masukkan tanggal masa berlaku paspor' : 'Masukkan tanggal masa berlaku identitas'}
      </p>
    </div>
  </div>
)}


              {/* Tempat & Tanggal Lahir */}
              <div className="grid md:grid-cols-2 gap-5">
                 <div>
                  <Label htmlFor="tempatLahir" className="text-gray-700 font-semibold">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="tempatLahir"
                    {...register('tempatLahir', { required: 'Tempat lahir harus diisi' })}
                    placeholder="Contoh: Yogyakarta"
                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.tempatLahir ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {rhfErrors.tempatLahir && <p className="text-sm text-red-600 mt-1">{rhfErrors.tempatLahir.message}</p>}
                </div>
                <div>
                  <Label htmlFor="birthDate" className="text-gray-700 font-semibold">
                    Tanggal Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...register('birthDate', { 
                      required: 'Tanggal lahir harus diisi',
                      validate: validateAge
                    })}
                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.birthDate ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {rhfErrors.birthDate && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {rhfErrors.birthDate.message}
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
                    rules={{ required: 'Jenis kelamin harus dipilih' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    rules={{ required: 'Status pernikahan harus dipilih' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    rules={{ required: 'Agama harus dipilih' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
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
                    rules={{ required: 'Pendidikan terakhir harus dipilih' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Pendidikan --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SD">SD</SelectItem>
                          <SelectItem value="SMP">SMP</SelectItem>
                          <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="S-1">S-1</SelectItem>
                          <SelectItem value="S-2/S-3">S-2/S-3</SelectItem>
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
                    {...register('motherName', { required: 'Nama ibu kandung harus diisi' })}
                    placeholder="Nama lengkap ibu kandung"
                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.motherName ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  {rhfErrors.motherName && <p className="text-sm text-red-600 mt-1">{rhfErrors.motherName.message}</p>}
                </div>
              </div>

              {/* NPWP */}
              <div>
                <Label htmlFor="npwp" className="text-gray-700 font-semibold">
                  NPWP (Opsional)
                </Label>
                <Input
                  id="npwp"
                  {...register('npwp', {
                    pattern: {
                      value: /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}$/,
                      message: 'Format NPWP tidak valid (contoh: 12.345.678.9-012.345)'
                    }
                  })}
                  onChange={handleNPWPChange}
                  placeholder="12.345.678.9-012.345"
                  maxLength={20}
                  className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.npwp ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                />
                {rhfErrors.npwp && <p className="text-sm text-red-600 mt-1">{rhfErrors.npwp.message}</p>}
                <p className="text-xs text-slate-500 mt-1">Format: 12.345.678.9-012.345 (kosongkan jika tidak ada)</p>
              </div>

            </fieldset>
          </article>

         {/* Section 2: Informasi Kontak */}
<div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
  <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
    Informasi Kontak
  </h4>

  <div className="space-y-6">
    {/* --- SUB-SECTION: KONTAK UTAMA --- */}
    <div className="grid md:grid-cols-2 gap-5">
      {/* Email */}
      <div>
        <Label htmlFor="email" className="text-gray-700 font-semibold">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email', { 
            required: 'Email harus diisi',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Format email tidak valid'
            }
          })}
          placeholder="contoh@email.com"
          className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.email ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
        />
        {rhfErrors.email && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            {rhfErrors.email.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <Label htmlFor="phone" className="text-gray-700 font-semibold">
          Nomor Telepon (WA Aktif) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone', { 
            required: 'Nomor telepon harus diisi',
            pattern: {
              value: /^[0-9+]{10,15}$/,
              message: 'Format nomor telepon tidak valid'
            }
          })}
          placeholder="08123456789"
          className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.phone ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
        />
        {rhfErrors.phone && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              {rhfErrors.phone.message}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">Digunakan untuk verifikasi akun</p>
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
        rules={{ required: 'Kewarganegaraan harus dipilih' }}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
              <SelectValue placeholder="Pilih kewarganegaraan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indonesia">WNI (Warga Negara Indonesia)</SelectItem>
              <SelectItem value="WNA">WNA (Warga Negara Asing)</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    </div>

    {/* --- SUB-SECTION: KONTAK DARURAT --- */}
    <div className="pt-6 border-t border-slate-100">
      <h4 className="font-semibold text-emerald-800 text-lg mb-4 flex items-center gap-2">
        Kontak Darurat
      </h4>

      <div className="space-y-5">
        {/* Nama Lengkap */}
        <div>
          <Label className="text-gray-700 font-semibold">Nama Lengkap <span className="text-red-500">*</span></Label>
          <Input
            {...register('kontakDaruratNama', { required: 'Nama kontak darurat wajib diisi' })}
            placeholder="Nama lengkap kontak darurat"
            className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratNama ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
          />
          {rhfErrors.kontakDaruratNama && <p className="text-sm text-red-600 mt-1">{rhfErrors.kontakDaruratNama.message}</p>}
        </div>

        {/* Alamat */}
        <div>
          <Label className="text-gray-700 font-semibold">Alamat Lengkap <span className="text-red-500">*</span></Label>
          <Input
            {...register('kontakDaruratAlamat', { required: 'Alamat wajib diisi' })}
            placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
            className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratAlamat ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
          />
          {rhfErrors.kontakDaruratAlamat && <p className="text-sm text-red-600 mt-1">{rhfErrors.kontakDaruratAlamat.message}</p>}
        </div>

        {/* Nomor HP + Hubungan */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <Label className="text-gray-700 font-semibold">Nomor HP <span className="text-red-500">*</span></Label>
            <Input
              {...register('kontakDaruratHp', { required: 'Nomor HP wajib diisi' })}
              placeholder="08xxxxxxxxxx"
              className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratHp ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
            />
            {rhfErrors.kontakDaruratHp && <p className="text-sm text-red-600 mt-1">{rhfErrors.kontakDaruratHp.message}</p>}
          </div>

          <div>
            <Label className="text-gray-700 font-semibold">Hubungan <span className="text-red-500">*</span></Label>
            <Controller
              name="kontakDaruratHubungan"
              control={control}
              rules={{ required: 'Pilih hubungan' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kontakDaruratHubungan ? 'border-red-500' : 'border-slate-300'}`}>
                    <SelectValue placeholder="-- Pilih Hubungan --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Suami/Istri">Suami/Istri</SelectItem>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Saudara Kandung">Saudara Kandung</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {rhfErrors.kontakDaruratHubungan && <p className="text-sm text-red-600 mt-1">{rhfErrors.kontakDaruratHubungan.message}</p>}

            {/* Input Tambahan jika pilih 'Lainnya' */}
            {watchedEmergencyHubungan === 'Lainnya' && (
              <Input
                {...register('kontakDaruratHubunganLainnya', { required: 'Sebutkan hubungan lainnya' })}
                placeholder="Sebutkan (misal: Teman, Sepupu)"
                className="mt-3 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

          {/* Section 3: Alamat Tempat Tinggal */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">3</span>
              Alamat Tempat Tinggal
            </h4>
            <div className="space-y-5">

              {/* RT/RW Field - Only for WNI */}
              {watchedCitizenship === 'Indonesia' && (
                <div>
                  <Label htmlFor="alamatJalan" className="text-gray-700 font-semibold">
                    Jalan, RT/RW <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="alamatJalan"
                    {...register('alamatJalan', { 
                      required: watchedCitizenship === 'Indonesia' ? 'Alamat jalan harus diisi' : false,
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
                    rows={3}
                    placeholder="Contoh: Jl. Magelang No. 123, RT 02/RW 05"
                    className={`mt-2 rounded-lg border-2 ${rhfErrors.alamatJalan ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                  <p className="text-xs text-slate-500 mt-1">Masukkan alamat jalan, nomor rumah, RT/RW</p>
                </div>
              )}

              {/* Indonesian Address Dropdowns - Only show if WNI */}
              {watchedCitizenship === 'Indonesia' && (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Province Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold">
                        Provinsi <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="province"
                        control={control}
                        rules={{ required: watchedCitizenship === 'Indonesia' ? 'Provinsi harus dipilih' : false }}
                        render={({ field }) => (
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
                                field.onChange(province.province);
                                loadCities(value);
                                updateFullAddress(province.province, '', '', '');
                              }
                            }}
                            disabled={addressData.loadingProvinces}
                          >
                            <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.province ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
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
                        )}
                      />
                    </div>

                    {/* City Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold">
                        Kota/Kabupaten <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name="city"
                        control={control}
                        rules={{ required: watchedCitizenship === 'Indonesia' ? 'Kota/Kabupaten harus dipilih' : false }}
                        render={({ field }) => (
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
                                field.onChange(city.name);
                                loadDistricts(value);
                                updateFullAddress(province.province, city.name, '', '');
                              }
                            }}
                            disabled={!selectedAddress.provinceId || addressData.loadingCities}
                          >
                            <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.city ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                              <SelectValue placeholder={
                                !selectedAddress.provinceId ? "Pilih provinsi" :
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
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* District Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        Kecamatan
                      </Label>
                      <Controller
                        name="kecamatan"
                        control={control}
                        rules={{ required: watchedCitizenship === 'Indonesia' ? 'Kecamatan harus dipilih' : false }}
                        render={({ field }) => (
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
                                field.onChange(district.name);
                                loadVillages(value);
                                updateFullAddress(province.province, city.name, district.name, '');
                              }
                            }}
                            disabled={!selectedAddress.cityId || addressData.loadingDistricts}
                          >
                            <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kecamatan ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                              <SelectValue placeholder={
                                !selectedAddress.cityId ? "Pilih kota" :
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
                        )}
                      />
                    </div>

                    {/* Village Dropdown */}
                    <div>
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        Kelurahan/Desa
                      </Label>
                      <Controller
                        name="kelurahan"
                        control={control}
                        rules={{ required: watchedCitizenship === 'Indonesia' ? 'Kelurahan harus dipilih' : false }}
                        render={({ field }) => (
                          <Select
                            value={selectedAddress.villageId}
                            onValueChange={(value) => {
                              const village = addressData.villages.find(v => v.id === value);
                              const district = addressData.districts.find(d => d.id === selectedAddress.districtId);
                              const city = addressData.cities.find(c => c.id === selectedAddress.cityId);
                              const province = addressData.provinces.find(p => p.id === selectedAddress.provinceId);
                              setSelectedAddress(prev => ({ ...prev, villageId: value }));
                              if (village && district && city && province) {
                                field.onChange(village.name);
                                updateFullAddress(province.province, city.name, district.name, village.name);
                              }
                            }}
                            disabled={!selectedAddress.districtId || addressData.loadingVillages}
                          >
                            <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.kelurahan ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                              <SelectValue placeholder={
                                !selectedAddress.districtId ? "Pilih kecamatan" :
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
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Address Input for WNA */}
              {watchedCitizenship !== 'Indonesia' && (
                <div className="space-y-5">
                  <div>
                    <Label className="text-gray-700 font-semibold">
                      Alamat Lengkap (Sesuai ID) <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      {...register('address', { required: watchedCitizenship !== 'Indonesia' ? 'Alamat lengkap harus diisi' : false })}
                      rows={4}
                      placeholder="Contoh: 123 Main Street, Apartment 4B, Downtown District, Bangkok 10110, Thailand"
                      className={`mt-2 w-full p-3 rounded-lg border-2 ${rhfErrors.address ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500 focus:outline-none resize-none`}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Masukkan alamat lengkap termasuk nama jalan, nomor, kota, kode pos, dan negara
                    </p>
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
                    {...register('postalCode', { required: 'Kode pos harus diisi', maxLength: 5 })}
                    placeholder="55281"
                    className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.postalCode ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold">
                    Status Tempat Tinggal <span className="text-red-500">*</span>
                  </Label>
                   <Controller
                      name="statusRumah"
                      control={control}
                      rules={{ required: 'Status tempat tinggal harus dipilih' }}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={`mt-2 h-12 rounded-lg border-2 ${rhfErrors.statusRumah ? 'border-red-500' : 'border-slate-300'} focus:border-emerald-500`}>
                            <SelectValue placeholder="-- Pilih Status --" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Milik Sendiri">Milik Sendiri</SelectItem>
                            <SelectItem value="Milik Orang Tua">Milik Orang Tua</SelectItem>
                            <SelectItem value="Sewa/Kontrak">Sewa/Kontrak</SelectItem>
                            <SelectItem value="Dinas">Rumah Dinas</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
               </div>
              </div>
              
              {/* Address Preview - Only for WNI */}
              {getValues('address') && watchedCitizenship === 'Indonesia' && (
                <div className="mb-6">
                  {/* <div className="flex items-center gap-2 mb-2">
                     <Label className="text-gray-700 font-semibold flex items-center gap-2">
                      Alamat Lengkap
                    </Label>
                  </div> */}

                  {/* <div className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex">
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {getValues('address')}
                        </p>
                        <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 italic">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Harap pastikan alamat ini sesuai dengan KTP Anda
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>
              )}

{/* Bagian Domisili tetap di bawahnya */}
<div className="grid md:grid-cols-1 gap-5">
  <div>
    <Label className="text-gray-700 font-semibold flex items-center">
      Alamat Domisili
    </Label>
    <Input
      {...register('alamatDomisili')}
      placeholder="Kosongkan jika sama dengan alamat KTP"
      className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500 shadow-sm"
    />
    <p className="text-xs text-slate-500 mt-1 italic">Isi jika Anda tinggal di lokasi berbeda dari KTP</p>
  </div>
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
          <div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
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
                    rules={{ required: 'Pekerjaan harus dipilih' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Pekerjaan --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</SelectItem>
                          <SelectItem value="Karyawan Swasta">Karyawan Swasta</SelectItem>
                          <SelectItem value="TNI/POLRI">TNI/POLRI</SelectItem>
                          <SelectItem value="Wiraswasta">Wiraswasta</SelectItem>
                          <SelectItem value="BUMN/BUMD">BUMN/BUMD</SelectItem>
                          <SelectItem value="Ibu Rumah Tangga">Ibu Rumah Tangga</SelectItem>
                          <SelectItem value="lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">
                    Penghasilan / Gaji per Bulan <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="monthlyIncome"
                    control={control}
                    rules={{ required: 'Penghasilan harus dipilih' }}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                          <SelectValue placeholder="-- Pilih Range Penghasilan --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="s.d 1 Juta">s.d 1 Juta</SelectItem>
                          <SelectItem value="> 1 - 5 Juta">&gt; 1 - 5 Juta</SelectItem>
                          <SelectItem value="> 5 - 10 Juta">&gt; 5 - 10 Juta</SelectItem>
                          <SelectItem value="> 10 - 25 Juta">&gt; 10 - 25 Juta</SelectItem>
                          <SelectItem value="> 25 - 100 Juta">&gt; 25 - 100 Juta</SelectItem>
                          <SelectItem value="> 100 Juta">&gt; 100 Juta</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
               </div>

              <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'Pelajar/Mahasiswa' ? 'Nama Sekolah / Universitas' : 'Nama Perusahaan'}
                    </Label>
                    <Input
                      {...register('tempatBekerja')}
                      className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'Pelajar/Mahasiswa' ? 'Kelas / Jurusan' : 'Jabatan'}
                    </Label>
                    <Input
                      {...register('jabatan')}
                      className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-500"
                    />
                  </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'Pelajar/Mahasiswa' ? 'Alamat Sekolah / Universitas' : 'Alamat Kantor'}
                    </Label>
                    <Input
                      {...register('alamatKantor')}
                      className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">
                      {watchedEmploymentStatus === 'Pelajar/Mahasiswa' ? 'Telepon Sekolah / Universitas' : 'Telepon Kantor'}
                    </Label>
                    <Input
                      {...register('teleponKantor')}
                      placeholder="021-12345678"
                      className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-500"
                    />
                  </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label className="text-gray-700">Bidang Usaha (Jika Bekerja)</Label>
                    <Input
                      {...register('bidangUsaha')}
                      placeholder="Contoh: Perdagangan, Jasa..."
                      className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-500"
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
                          className="mt-2 h-12 rounded-md border-slate-300 focus:border-blue-500"
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== 'Lainnya') {
                          setValue('sumberDanaCustom', '');
                        }
                      }}
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
                {watchedSumberDana === 'Lainnya' && (
                  <Input
                    {...register('sumberDanaCustom')}
                    placeholder="Sebutkan sumber dana lainnya"
                    className="mt-2 h-12 rounded-md"
                  />
                )}
              </div>

              {/* EDD Bank Lain Section */}
<div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200">
  <div className="flex items-center gap-3 mb-1">
    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    </div>
    <div>
      <h4 className="font-bold text-slate-800">Rekening Bank Lain</h4>
      <p className="text-xs text-slate-500">Opsional: Informasi rekening bank untuk keperluan verifikasi tambahan</p>
    </div>
  </div>

  <div className="mt-6 space-y-4">
    {bankFields.map((field, index) => (
      <div key={field.id} className="relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-emerald-200">
        {/* Badge Number & Remove Button */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Rekening #{index + 1}</span>
          <button
            type="button"
            onClick={() => removeBank(index)}
            className="group flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
          >
            <span className="text-xs font-medium">Hapus</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 font-medium">Nama Bank</Label>
            <Input
              {...register(`eddBankLain.${index}.bank_name`)}
              placeholder="Misal: Bank Central Asia (BCA)"
              className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-700 font-medium">Jenis Rekening</Label>
              <Input
                {...register(`eddBankLain.${index}.jenis_rekening`)}
                placeholder="Tabungan / Giro"
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <Label className="text-gray-700 font-medium">Nomor Rekening</Label>
              <Input
                {...register(`eddBankLain.${index}.nomor_rekening`)}
                placeholder="Masukkan angka saja"
                className="mt-1.5 h-11 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={() => appendBank({ bank_name: '', jenis_rekening: '', nomor_rekening: '' })}
      className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2 group"
    >
      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <span className="font-semibold text-sm">Tambah Rekening Bank Lain</span>
    </button>
  </div>
</div>

{/* EDD Pekerjaan Lain Section */}
<div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200">
  <div className="flex items-center gap-3 mb-1">
    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <div>
      <h4 className="font-bold text-slate-800">Pekerjaan / Usaha Lain</h4>
      <p className="text-xs text-slate-500">Opsional: Jika Anda memiliki penghasilan dari sumber lain</p>
    </div>
  </div>

  <div className="mt-6 space-y-4">
    {pekerjaanFields.map((field, index) => (
      <div key={field.id} className="group relative bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-purple-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label className="text-gray-700 font-medium">Jenis Usaha / Pekerjaan #{index + 1}</Label>
            <div className="relative mt-1.5">
              <Input
                {...register(`eddPekerjaanLain.${index}.jenis_usaha`)}
                placeholder="Contoh: Toko Kelontong, Jasa Desain, dsb"
                className="h-11 pr-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => removePekerjaan(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                title="Hapus"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}

    <button
      type="button"
      onClick={() => appendPekerjaan({ jenis_usaha: '' })}
      className="w-full py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-xl hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 group"
    >
      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <span className="font-semibold text-sm">Tambah Pekerjaan/Usaha Lain</span>
    </button>
  </div>
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
              Tentukan detail rekening tabungan Mutiara Anda.
            </p>
          </div>

          {/* Section 1: Konfigurasi Rekening */}
          <div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
            <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">1</span>
              Detail Rekening
            </h4>
            <div className="space-y-5">
              
              {/* Account Type - Pre-filled and Read-only */}
              <div>
                <Label htmlFor="jenis_rekening" className="text-gray-700">Jenis Rekening</Label>
                <Controller
                  name="jenis_rekening"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="jenis_rekening"
                      readOnly
                      disabled
                      className="mt-2 h-12 rounded-md bg-slate-100 cursor-not-allowed"
                    />
                  )}
                />
                <p className="text-xs text-gray-500 mt-1">Jenis rekening {getSavingsTypeName()}</p>
              </div>

              {/* Card Type Selection - Only for Mutiara - COMMENTED OUT FOR TabunganKu
              <div>
                <Label className="text-gray-700 font-semibold">
                  Jenis Kartu <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="cardType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-2 h-12 rounded-lg border-2 border-slate-300 focus:border-emerald-500">
                        <SelectValue placeholder="-- Pilih Jenis Kartu --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Pilih jenis kartu ATM sesuai kebutuhan Anda. Setiap jenis kartu memiliki fitur dan limit yang berbeda.
                </p>
              </div>
              */}

              {/* Initial Deposit Amount
              <div>
                <Label htmlFor="nominalSetoran" className="text-gray-700">Nominal Setoran Awal</Label>
                <Input
                  id="nominalSetoran"
                  type="text"
                  required
                  placeholder="Masukkan nominal setoran awal"
                  value={formatRupiah(formData.nominalSetoran)}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, nominalSetoran: cleanValue });
                  }}
                  onBlur={(e) => {
                    // Use formData directly or strip formatting from current value
                    const cleanValue = e.target.value.replace(/\D/g, '');
                    const err = validateMinimumDeposit('Mutiara', cleanValue);
                    if (err) {
                      setErrors(prev => ({ ...prev, nominalSetoran: err }));
                    } else {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.nominalSetoran;
                        return next;
                      });
                    }
                  }}
                  className={`mt-2 h-12 rounded-md ${errors.nominalSetoran ? 'border-red-500' : ''}`}
                />
                {errors.nominalSetoran && <p className="text-sm text-red-600 mt-1">{errors.nominalSetoran}</p>}
                <p className="text-xs text-gray-500 mt-1">Minimal setoran awal untuk rekening Mutiara adalah Rp 20.000</p>
              </div> */}

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

              {/* Account Purpose */}
              <div>
                <Label htmlFor="tujuanRekening" className="text-gray-700">Tujuan Pembukaan Rekening</Label>
                <Controller
                  name="tujuanRekening"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== 'Lainnya') {
                          setValue('tujuanRekeningLainnya', '');
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200">
                        <SelectValue placeholder="Pilih tujuan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Menabung">Menabung</SelectItem>
                        <SelectItem value="Transaksi">Transaksi</SelectItem>
                        <SelectItem value="Investasi">Investasi</SelectItem>
                        <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                
                {watchedTujuanRekening === 'Lainnya' && (
                  <Input
                    {...register('tujuanRekeningLainnya')}
                    placeholder="Sebutkan tujuan pembukaan rekening"
                    className="mt-3 h-12 rounded-md shadow-sm border-slate-200 focus:ring-emerald-500"
                  />
                )}
              </div>

            </div>
          </div>

              {/* Section 2: Kepemilikan Rekening */}
              <div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
                <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">2</span>
                  Kepemilikan Rekening
                </h4>
                
                {/* Beneficial Owner Question */}
                <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-emerald-100 p-3 rounded-xl">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Pemilik Dana (Beneficial Owner)</h4>
                        <p className="text-sm text-gray-600 mt-1 max-w-xl">
                          Apakah rekening ini dibuka untuk kepentingan Anda sendiri atau ada pemilik dana lain?
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-emerald-100 flex self-start md:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setValue('rekeningUntukSendiri', true);
                        }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                          watchedRekeningUntukSendiri
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Diri Sendiri
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setValue('rekeningUntukSendiri', false);
                        }}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                          !watchedRekeningUntukSendiri
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Orang Lain
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Informasi Beneficial Owner (pemilik manfaat sebenarnya) diperlukan jika rekening ini untuk orang lain.
                </p>
              </div>

          {watchedRekeningUntukSendiri === false && (
            <div className="bg-white p-4 md:p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-6">
              <h4 className="text-emerald-800 font-bold text-xl mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">3</span>
                Data Pemilik Dana (Beneficial Owner)
              </h4>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Nama Lengkap Sesuai Identitas</Label>
                  <Input
                    {...register('boNama')}
                    placeholder="Nama Lengkap Pemilik Dana"
                    className="mt-2 h-12 rounded-md transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Tempat Lahir</Label>
                  <Input
                    {...register('boTempatLahir')}
                    placeholder="Kota Tempat Lahir"
                    className="mt-2 h-12 rounded-md transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Tanggal Lahir</Label>
                  <Input
                    type="date"
                    {...register('boTanggalLahir')}
                    className="mt-2 h-12 rounded-md transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Jenis Kelamin</Label>
                  <Controller
                    name="boJenisKelamin"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih Jenis Kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                          <SelectItem value="Perempuan">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-700">Alamat Lengkap (Sesuai ID)</Label>
                <Input
                  {...register('boAlamat')}
                  placeholder="Alamat lengkap pemilik dana"
                  className="mt-2 h-12 rounded-md transition-all focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Kewarganegaraan</Label>
                  <Controller
                    name="boKewarganegaraan"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih Kewarganegaraan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WNI">Warga Negara Indonesia (WNI)</SelectItem>
                          <SelectItem value="WNA">Warga Negara Asing (WNA)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Status Pernikahan</Label>
                  <Controller
                    name="boStatusPernikahan"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Belum Menikah">Belum Menikah</SelectItem>
                          <SelectItem value="Menikah">Menikah</SelectItem>
                          <SelectItem value="Cerai Hidup">Cerai Hidup</SelectItem>
                          <SelectItem value="Cerai Mati">Cerai Mati</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Jenis Identitas</Label>
                  <Controller
                    name="boJenisId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih Jenis ID" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KTP">KTP</SelectItem>
                          <SelectItem value="Paspor">Paspor</SelectItem>
                          <SelectItem value="SIM">SIM</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Nomor Identitas</Label>
                  <Input
                    {...register('boNomorId')}
                    placeholder="Masukkan nomor identitas"
                    className="mt-2 h-12 rounded-md transition-all focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Sumber Dana</Label>
                  <Controller
                    name="boSumberDana"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih Sumber Dana" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gaji">Gaji</SelectItem>
                          <SelectItem value="Hasil Usaha">Hasil Usaha</SelectItem>
                          <SelectItem value="Warisan">Warisan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Hubungan dengan Nasabah</Label>
                  <Controller
                    name="boHubungan"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 h-12 rounded-md shadow-sm border-slate-200 focus:border-emerald-500">
                          <SelectValue placeholder="Pilih Hubungan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                          <SelectItem value="Anak">Anak</SelectItem>
                          <SelectItem value="Pasangan">Pasangan</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-gray-700">Nomor HP</Label>
                  <Input
                    {...register('boNomorHp')}
                    placeholder="Masukkan nomor HP"
                    className={`mt-2 h-12 rounded-md ${rhfErrors.boNomorHp ? 'border-red-500' : ''}`}
                  />
                  {rhfErrors.boNomorHp && <p className="text-sm text-red-600 mt-1">{rhfErrors.boNomorHp.message}</p>}
                </div>
                <div>
                  <Label className="text-gray-700">Pekerjaan</Label>
                  <Input
                    {...register('boPekerjaan')}
                    placeholder="Masukkan pekerjaan"
                    className="mt-2 h-12 rounded-md"
                  />
                </div>
              </div>

              {/* BO Annual Income */}
              <div>
                <Label className="text-gray-700">Pendapatan per Tahun</Label>
                <Controller
                  name="boPendapatanTahun"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
            <div className="bg-white p-4 md:p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>Lokasi Cabang</span>
                </h4>
              </div>
              <div className="text-gray-700">
                <p className="font-medium">
                  {branches.find((b: any) => b.id.toString() === getValues().cabang_pengambilan)?.nama_cabang || getValues().cabang_pengambilan}
                </p>
              </div>
            </div>

            {/* 2. Data Diri */}
            <div className="bg-white p-4 md:p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
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
                  <p className="font-medium text-gray-800">{getValues().address}, {getValues().postalCode}</p>
                </div>
              </div>
            </div>

            {/* 3. Data Pekerjaan & Keuangan */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
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
                  <p className="font-medium text-gray-800">{formatRupiah(getValues().rataRataTransaksi)}</p>
                </div>
              </div>
            </div>

            {/* 4. Data Rekening */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span>Data Rekening</span>
                </h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Jenis Rekening</p>
                  <p className="font-medium text-gray-800">{getValues().jenis_rekening || getSavingsTypeName()}</p>
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
                      <p className="font-medium text-gray-800">{formatRupiah(getValues().boPendapatanTahun)}</p>
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
                rules={{ required: true }}
                render={({ field }) => (
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={`mt-1 h-4 w-4 md:h-5 md:w-5 ${rhfErrors.agreeTerms ? 'border-red-500' : ''}`}
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
            {!getValues().rekeningUntukSendiri && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-amber-200">
                <Controller
                  name="boPersetujuan"
                  control={control}
                  rules={{ required: !getValues().rekeningUntukSendiri }}
                  render={({ field }) => (
                    <Checkbox
                      id="boApproval"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={`mt-1 ${rhfErrors.boPersetujuan ? 'border-red-500' : ''}`}
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
};

export default FormTabunganku;
