import React, { useEffect, useState, useRef } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';

interface SavingsTypeSelectionProps {
  onSelectType: (type: string) => void;
  onBack: () => void;
}

import { savingsTypes } from '../data/savingsTypes';

export default function SavingsTypeSelection({
  onSelectType,
  onBack,
}: SavingsTypeSelectionProps) {

  const [index, setIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const startX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const updateView = () => {
      if (window.innerWidth < 640) setItemsPerView(1);
      else if (window.innerWidth < 1024) setItemsPerView(2);
      else setItemsPerView(3);
    };

    updateView();
    window.addEventListener('resize', updateView);
    return () => window.removeEventListener('resize', updateView);
  }, []);

  const maxIndex = Math.max(savingsTypes.length - itemsPerView, 0);

  const next = () => {
    setIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  // ✅ DRAG / SWIPE HANDLER
  const handleStart = (x: number) => {
    startX.current = x;
    isDragging.current = true;
  };

  const handleEnd = (x: number) => {
    if (!isDragging.current) return;
    const diff = startX.current - x;

    if (diff > 50) next();
    if (diff < -50) prev();

    isDragging.current = false;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 animate-page-enter">
      <div className="max-w-7xl mx-auto px-6 animate-content-enter">

        {/* BACK */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="pl-0 mb-12 text-slate-600 hover:text-emerald-700 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </Button>

        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Pilih Jenis Tabungan
          </h1>
          <div className="w-20 h-1 mx-auto bg-emerald-700 rounded-full mb-4" />
          <p className="text-slate-600 max-w-xl mx-auto">
            Pilih produk tabungan yang cocok untuk kebutuhan.
          </p>
        </div>

        {/* ✅ CAROUSEL */}
        <div className="relative flex items-center">

          <button
            onClick={prev}
            className="absolute left-0 z-20 -translate-x-6 bg-white p-3 shadow-lg rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            className="overflow-hidden w-full px-2 sm:px-8 lg:px-12"
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseUp={(e) => handleEnd(e.clientX)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
          >
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${index * (100 / itemsPerView)}%)` }}
            >
              {savingsTypes.map((type) => (
                <div
                  key={type.id}
                  className="min-w-full sm:min-w-[50%] lg:min-w-[33.3333%] px-4 select-none"
                >
                  <div
                    onClick={() => onSelectType(type.id)}
                    className="group bg-white rounded-xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1"
                  >
                    <div
                      className="relative h-44 p-6 text-white bg-cover bg-center"
                      style={{ backgroundImage: `url(${type.bgImage})` }}
                    >
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="relative z-10 flex justify-between items-end">
                        <img src="/banksleman.png" alt="Logo" className="h-6 brightness-0 invert" />
                        <span className="text-xs opacity-80">VISA / GPN</span>
                      </div>
                    </div>

                    <div className="p-7 flex flex-col h-full">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">
                        {type.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-6">
                        {type.description}
                      </p>

                      <div className="space-y-3 mb-8">
                        {type.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <CheckCircle className="w-5 h-5 text-emerald-700" />
                            <span className="text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button className="mt-auto w-full bg-emerald-800 hover:bg-emerald-900">
                        Lihat Detail
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            className="absolute right-0 z-20 translate-x-6 bg-white p-3 shadow-lg rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* DOT */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full ${
                index === i ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-24 pt-8 border-t border-slate-200 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} PT BPR Bank Sleman (Perseroda). Seluruh Hak Cipta Dilindungi.
          </p>
        </div>

      </div>
    </div>
  );
}
