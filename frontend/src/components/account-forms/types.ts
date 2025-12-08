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

    // Pekerjaan
    tempatBekerja: string; // Nama Perusahaan
    alamatKantor: string;
    jabatan: string;
    bidangUsaha: string;
    sumberDana: string;
    tujuanRekening: string;

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
