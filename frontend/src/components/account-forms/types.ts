import type { Dispatch, SetStateAction, FormEvent } from 'react';

export interface AccountFormData {
    fullName: string;
    nik: string;
    email: string;
    phone: string;
    birthDate: string;
    // Data Diri Tambahan
    tempatLahir: string;
    address: string; // Alamat KTP
    alamatDomisili: string; // Alamat Domisili
    province: string;
    city: string;
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
    referensiNama: string;
    referensiAlamat: string;
    referensiTelepon: string;
    referensiHubungan: string;

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
    boJenisId: string; // 'KTP' | 'Paspor' | 'Lainnya'
    boNomorId: string;
    boPekerjaan: string;
    boPendapatanTahun: string; // 'sd-5jt' | '5-10jt' | '10-25jt' | '25-100jt'
    boPersetujuan: boolean;

    // Darurat
    kontakDaruratNama: string;
    kontakDaruratHp: string;
    kontakDaruratHubungan: string;
    employmentStatus: string;
}

export interface AccountFormProps {
    formData: AccountFormData;
    setFormData: Dispatch<SetStateAction<AccountFormData>>;
    errors: Record<string, string>;
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
    validateNikAsync: (nik: string) => Promise<string>;
    validateEmailAsync: (email: string) => Promise<string>;
    validatePhoneAsync: (phone: string) => Promise<string>;
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
