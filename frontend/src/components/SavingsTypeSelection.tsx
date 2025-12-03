import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';


interface SavingsTypeSelectionProps {
  onSelectType: (type: string) => void;
  onBack: () => void;
}

export default function SavingsTypeSelection({
  onSelectType,
  onBack,
}: SavingsTypeSelectionProps) {
  const savingsTypes = [
    {
      id: 'mutiara',
      title: 'Tabungan Mutiara',
      description: 'Tingkatkan saldo',
      cardBg: 'from-emerald-500 to-emerald-800',
      features: ['Bunga kompetitif', 'Berhadiah', 'Tanpa biaya admin'],
    },
    {
      id: 'regular',
      title: 'Tabungan Bank Sleman',
      description: 'Tabungan masyarakat Sleman',
      cardBg: 'from-indigo-500 to-purple-700',
      features: ['Gratis biaya admin', 'Bunga hingga 3.5%', 'Kartu debit gratis'],
    },
    {
      id: 'simpel',
      title: 'Tabungan Simpel',
      description: 'Nabung sejak dini',
      cardBg: 'from-pink-500 to-rose-600',
      features: ['Untuk pelajar', 'Setoran ringan', 'Edukasi finansial'],
    },
  ];

  useEffect(() => {
     window.scrollTo({ top: 0, behavior: "auto" });
   }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
       <Button 
                         variant="ghost" 
                         onClick={onBack} 
                         className="pl-0 mb-10 text-slate-500 hover:text-blue-700 hover:bg-transparent"
                     >
                         <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Halaman Utama
                     </Button>
 
        {/* Header */}
       <div className="text-center mb-14">
  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
    Pilih Jenis Tabungan
  </h1>

  <div className="w-24 h-1 mx-auto rounded-full mb-4 bg-gradient-to-r from-blue-500 via-emerald-500 to-green-500" />

  <p className="text-slate-600 max-w-xl mx-auto">
    Pilih produk tabungan yang paling sesuai dengan kebutuhan finansial.
  </p>
</div>



        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-3 place-items-center">
          {savingsTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className="group w-full max-w-sm bg-white rounded-md shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2"
            >
              {/* Header Visual */}
              <div
                className={`relative h-44 bg-gradient-to-br ${type.cardBg} p-6 text-white`}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/20 rounded-full blur-2xl" />

                <div className="flex justify-between items-start relative z-10">
                  <img
                    src="/banksleman.png"
                    alt="Logo"
                    className="h-6 brightness-0 invert"
                  />
                  <span className="text-xs tracking-widest opacity-80">
                    PREMIUM
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                  <span className="font-mono tracking-wider text-sm">
                    •••• •••• •••• 8899
                  </span>
                  <img src="/chip.png" alt="Chip" className="h-7 opacity-80" />
                </div>
              </div>

              {/* Content */}
              <div className="p-7 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {type.title}
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  {type.description}
                </p>

                <div className="space-y-3 mb-6">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button className="mt-auto w-full py-5 rounded-xl bg-slate-900 hover:bg-green-600 transition-all font-semibold flex items-center justify-center gap-2">
                  Lihat Detail
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-24 lg:mt-32"></div>
          <div className="mt-16 lg:mt-24 pt-6 pb-6 border-t border-slate-200 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-slate-500 text-sm m-0">
              &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda) All rights reserved.
            </p>
          </div>
      </div>
    </div>
  );
}
