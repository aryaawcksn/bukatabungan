import React, { useEffect } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle, ArrowRight, Sparkles, Shield, TrendingUp } from 'lucide-react';
import ScrollToTop from './ScrollToTop';

interface SavingsTypeSelectionProps {
  onSelectType: (type: string) => void;
  onBack: () => void;
}

import { savingsTypes } from '../data/savingsTypes';

export default function SavingsTypeSelection({
  onSelectType,
  onBack,
}: SavingsTypeSelectionProps) {

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 animate-page-enter">
      <div className="max-w-4xl mx-auto px-6 py-8 animate-content-enter">

        {/* HEADER SECTION */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={onBack}
            className="pl-0 mb-8 text-slate-600 hover:text-emerald-700 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Beranda
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Pilih Produk Tabungan
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Temukan produk tabungan yang sesuai dengan kebutuhan dan gaya hidup Anda
            </p>
          </div>
        </div>

        {/* VERTICAL PRODUCT CARDS */}
        <div className="space-y-6">
          {savingsTypes.map((type, index) => (
            <div
              key={type.id}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm md:hover:shadow-lg md:transition-all md:duration-300 cursor-pointer overflow-hidden md:hover:border-emerald-300 mobile-button-press"
              onClick={() => onSelectType(type.id)}
            >
              <div className="flex flex-col md:flex-row">
                {/* LEFT: Image/Card Preview */}
                <div className="md:w-80 h-48 md:h-auto relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${type.bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <img src="/banksleman.png" alt="Logo" className="h-6 brightness-0 invert" />
                        <span className="text-xs opacity-80 bg-white/20 px-2 py-1 rounded">VISA</span>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Bank Sleman</p>
                        <p className="text-lg font-bold">{type.title}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Content */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {type.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    <div className="ml-4 opacity-0 md:group-hover:opacity-100 md:transition-opacity">
                      <ArrowRight className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {type.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                      
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 mobile-button-press"
                    >
                      Detail Produk
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda). Seluruh Hak Cipta Dilindungi.
          </p>
        </div>

      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
