// Utility to parse combined address back to components
export interface AddressComponents {
  alamatJalan: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
}

export function parseAddress(fullAddress: string): AddressComponents {
  if (!fullAddress) {
    return {
      alamatJalan: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: ''
    };
  }

  // Split by comma and trim each part
  const parts = fullAddress.split(',').map(part => part.trim());
  
  // If less than 2 parts, treat as street address only
  if (parts.length < 2) {
    return {
      alamatJalan: fullAddress,
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: ''
    };
  }

  // Expected format: "Jl. Magelang No. 123, RT 02/RW 05, Tirtoadi, Mlati, Sleman, DI Yogyakarta"
  // Or simpler: "Street Address, City, Province"
  
  const result: AddressComponents = {
    alamatJalan: parts[0] || '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    provinsi: ''
  };

  if (parts.length >= 2) {
    // Last part is usually province
    result.provinsi = parts[parts.length - 1] || '';
  }
  
  if (parts.length >= 3) {
    // Second to last is usually city
    result.kota = parts[parts.length - 2] || '';
  }
  
  if (parts.length >= 4) {
    // Third to last is usually district
    result.kecamatan = parts[parts.length - 3] || '';
  }
  
  if (parts.length >= 5) {
    // Fourth to last is usually village
    result.kelurahan = parts[parts.length - 4] || '';
  }

  return result;
}

export function combineAddress(components: AddressComponents): string {
  const parts = [];
  
  if (components.alamatJalan?.trim()) parts.push(components.alamatJalan.trim());
  if (components.kelurahan?.trim()) parts.push(components.kelurahan.trim());
  if (components.kecamatan?.trim()) parts.push(components.kecamatan.trim());
  if (components.kota?.trim()) parts.push(components.kota.trim());
  if (components.provinsi?.trim()) parts.push(components.provinsi.trim());
  
  return parts.join(', ');
}