export interface SavingsType {
    id: string;
    title: string;
    description: string;
    bgImage: string;
    features: string[];
}

export const savingsTypes: SavingsType[] = [
    {
        id: 'mutiara',
        title: 'Tabungan Mutiara',
        description: 'Tabungan berjangka dengan benefit optimal',
        bgImage: '/mutiara1.jpg',
        features: ['Bunga kompetitif', 'Program hadiah', 'Tanpa biaya administrasi'],
    },
    {
        id: 'regular',
        title: 'Tabungan Bank Sleman',
        description: 'Produk simpanan utama masyarakat',
        bgImage: '/regular1.jpg',
        features: ['Gratis biaya admin', 'Bunga hingga 3.5%', 'Kartu debit'],
    },
    {
        id: 'simpel',
        title: 'Tabungan SimPel',
        description: 'Produk simpanan untuk pelajar',
        bgImage: '/simpel1.jpg',
        features: ['Setoran ringan', 'Edukasi keuangan', 'Tanpa biaya admin'],
    },
    {
        id: 'arofah',
        title: 'Tabungan Arofah',
        description: 'Jalani ibadah dengan aman dan nyaman',
        bgImage: '/arofah1.jpg',
        features: ['Setoran ringan', 'Setoran ringan', 'Tanpa biaya admin'],
    },
    {
        id: 'tamasya',
        title: 'Tabungan Tamasya Plus',
        description: 'Sering nabung banyak untung',
        bgImage: '/tamasya1.jpg',
        features: ['Setoran ringan', 'Cashback', 'Debit travel'],
    },
    {
        id: 'tabunganku',
        title: 'Tabungan Ku',
        description: 'Ringan dan Mudah',
        bgImage: '/tabunganku1.jpg',
        features: ['Setoran ringan', 'Auto debit', 'Tanpa biaya admin'],
    },
    {
        id: 'pensiun',
        title: 'Tabungan Pensiun',
        description: 'Simpanan untuk masa tua',
        bgImage: '/pensiun1.jpg',
        features: ['Setoran ringan', 'Proteksi', 'Tanpa biaya admin'],
    },
];

export const VALID_SAVING_TYPES = savingsTypes.map((type) => type.id);
