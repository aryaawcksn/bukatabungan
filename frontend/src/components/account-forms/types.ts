import type { Dispatch, SetStateAction, FormEvent } from 'react';

export interface AccountFormData {
    fullName: string;
    nik: string;
    email: string;
    phone: string;
    birthDate: string;
    // Data Diri Tambahan
    tempatLahir: string;
    address: string; // Alamat KTP (combined full address)
    alamatJalan: string; // Street address (Jl. Magelang No. 123, RT 02/RW 05)
    alamatDomisili: string; // Alamat Domisili
    province: string; // Province name
    city: string; // City/Regency name
    kecamatan: string; // District name
    kelurahan: string; // Village/Sub-district name
    postalCode: string;
    statusRumah: string;
    agama: string;
    pendidikan: string;
    npwp: string;

    // Account
    monthlyIncome: string;
    cabang_pengambilan: string;
    cardType: string;
    agreeTerms: boolean;
    jenis_rekening: string;

    gender: string;
    maritalStatus: string;
    citizenship: string;
    motherName: string;

    // Identity fields (Requirements 2.1)
    alias: string;
    jenisId: string; // 'KTP' | 'Paspor' | 'Lainnya'
    nomorId: string;
    berlakuId: string; // validity date
    jenisIdCustom?: string; // Custom ID name when jenisId is 'Lainnya'

    // Pekerjaan
    tempatBekerja: string; // Nama Perusahaan
    alamatKantor: string;
    jabatan: string;
    bidangUsaha: string;
    sumberDana: string;
    tujuanRekening: string;
    tujuanRekeningLainnya?: string; // For "other" purpose specification

    // Employment and financial fields (Requirements 3.1)
    rataRataTransaksi: string;
    teleponKantor: string;

    // Account configuration fields (Requirements 4.1)
    nominalSetoran: string;
    atmPreference: string; // 'tidak' | 'ya' | 'silver' | 'gold'

    // Account ownership (determines if BO is required)
    rekeningUntukSendiri: boolean;

    // Beneficial Owner fields (Requirements 5.1)
    boNama: string;
    boAlamat: string;
    boTempatLahir: string;
    boTanggalLahir: string;
    boJenisKelamin: string;        // NEW FIELD 1
    boKewarganegaraan: string;     // NEW FIELD 2
    boStatusPernikahan: string;    // NEW FIELD 3
    boJenisId: string; // 'KTP' | 'Paspor' | 'Lainnya'
    boNomorId: string;
    boSumberDana: string;          // NEW FIELD 4
    boHubungan: string;            // NEW FIELD 5
    boNomorHp: string;             // NEW FIELD 6
    boPekerjaan: string;
    boPendapatanTahun: string; // 'sd-5jt' | '5-10jt' | '10-25jt' | '25-100jt'
    boPersetujuan: boolean;

    // Darurat
    kontakDaruratNama: string;
    kontakDaruratHp: string;
    kontakDaruratAlamat: string;
    kontakDaruratHubungan: string;
    kontakDaruratHubunganLainnya: string;
    employmentStatus: string;

    // EDD Bank Lain
    eddBankLain: Array<{
        bank_name: string;
        jenis_rekening: string;
        nomor_rekening: string;
    }>;

    // EDD Pekerjaan Lain
    eddPekerjaanLain: Array<{
        jenis_usaha: string;
    }>;

    // Customer Type
    tipeNasabah: 'baru' | 'lama';
    nomorRekeningLama: string;
}

export interface AccountFormProps {
    formData: AccountFormData;
    setFormData: Dispatch<SetStateAction<AccountFormData>>;
    errors: Record<string, string>;
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
    getFieldClass: (name: string) => string;

    ktpFile: File | null;
    setKtpFile: Dispatch<SetStateAction<File | null>>;
    ktpPreview: string | null;
    setKtpPreview: Dispatch<SetStateAction<string | null>>;
    ktpUrl: string | null;
    setKtpUrl: Dispatch<SetStateAction<string | null>>;

    loadingSubmit: boolean;
    handleSubmit: (e: FormEvent) => void;
    savingsType: string;
    getSavingsTypeName: () => string;
    branches?: any[];
    currentStep?: number; // Added optional currentStep
}
