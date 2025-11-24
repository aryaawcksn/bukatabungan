import type { Dispatch, SetStateAction, FormEvent } from 'react';

export interface AccountFormData {
    fullName: string;
    nik: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    province: string;
    city: string;
    postalCode: string;
    monthlyIncome: string;
    cabang_pengambilan: string;
    cardType: string;
    agreeTerms: boolean;
    jenis_rekening: string;
    gender: string;
    maritalStatus: string;
    citizenship: string;
    motherName: string;
    tempatBekerja: string;
    alamatKantor: string;
    sumberDana: string;
    tujuanRekening: string;
    kontakDaruratNama: string;
    kontakDaruratHp: string;
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

    selfieFile: File | null;
    setSelfieFile: Dispatch<SetStateAction<File | null>>;
    selfiePreview: string | null;
    setSelfiePreview: Dispatch<SetStateAction<string | null>>;
    selfieUrl: string | null;
    setSelfieUrl: Dispatch<SetStateAction<string | null>>;

    loadingSubmit: boolean;
    handleSubmit: (e: FormEvent) => void;
    savingsType: string;
    getSavingsTypeName: () => string;
}
