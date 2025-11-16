import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Building, User, Gift, ArrowLeft, CheckCircle } from 'lucide-react';

interface SavingsTypeSelectionProps {
  onSelectType: (type: string) => void;
  onBack: () => void;
}

export default function SavingsTypeSelection({ onSelectType, onBack }: SavingsTypeSelectionProps) {
  const savingsTypes = [
    {
      id: 'individu',
      title: 'Tabungan Individu',
      icon: User,
      color: 'emerald',
      description: 'Tabungan untuk kebutuhan pribadi dengan berbagai keuntungan dan kemudahan akses',
      benefits: [
        'Bunga hingga 3.5% per tahun',
        'Gratis biaya administrasi bulanan',
        'Free transfer antar bank 25x/bulan',
        'Kartu debit gratis'
      ]
    },
    {
      id: 'bisnis',
      title: 'Tabungan Bisnis',
      icon: Building,
      color: 'blue',
      featured: true,
      description: 'Solusi tabungan untuk mengembangkan dan mengelola keuangan bisnis Anda',
      benefits: [
        'Bunga hingga 4% per tahun',
        'Limit transaksi lebih tinggi',
        'Layanan prioritas',
        'Integrasi dengan software akuntansi'
      ]
    },
    {
      id: 'promosi',
      title: 'Tabungan Promosi',
      icon: Gift,
      color: 'amber',
      description: 'Paket tabungan spesial dengan bonus dan hadiah menarik untuk Anda',
      benefits: [
        'Bonus saldo awal hingga Rp 500.000',
        'Bunga promo 5% untuk 3 bulan pertama',
        'Voucher belanja senilai Rp 200.000',
        'Cashback untuk transaksi tertentu'
      ]
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-8 hover:bg-white/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>

        <div className="text-center mb-16">
          <h1 className="text-gray-900 mb-4 text-5xl">
            Pilih Jenis Tabungan
          </h1>
          <p className="text-gray-700 text-xl">
            Pilih jenis tabungan yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {savingsTypes.map((type) => {
            const Icon = type.icon;
            const isFeatured = type.featured;
            
            return (
              <Card 
                key={type.id}
                className={`p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 shadow-lg rounded-2xl group hover:-translate-y-2 ${
                  isFeatured 
                    ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 relative' 
                    : 'bg-white'
                }`}
                onClick={() => onSelectType(type.id)}
              >
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm shadow-md">
                    Rekomendasi
                  </div>
                )}
                
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 group-hover:scale-110 transition-transform ${
                  isFeatured 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : type.color === 'amber' 
                      ? 'bg-gradient-to-br from-amber-100 to-amber-200'
                      : 'bg-gradient-to-br from-emerald-100 to-emerald-200'
                }`}>
                  <Icon className={`h-10 w-10 ${
                    isFeatured 
                      ? 'text-white' 
                      : type.color === 'amber' 
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                  }`} />
                </div>
                
                <h3 className={`mb-3 text-2xl ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                  {type.title}
                </h3>
                
                <p className={`mb-6 ${isFeatured ? 'text-emerald-50' : 'text-gray-600'}`}>
                  {type.description}
                </p>

                <div className="space-y-3 mb-8">
                  {type.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        isFeatured ? 'text-white' : 'text-emerald-600'
                      }`} />
                      <p className={`text-sm ${isFeatured ? 'text-emerald-50' : 'text-gray-700'}`}>
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full shadow-md ${
                    isFeatured 
                      ? 'bg-white text-emerald-700 hover:bg-emerald-50' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  onClick={() => onSelectType(type.id)}
                >
                  Pilih {type.title}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
