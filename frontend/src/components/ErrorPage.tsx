import React, { useState } from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  let errorMessage: string;
  let errorTitle: string;
  let errorStatus: number | string = 'Error';

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data?.message || error.statusText;
    errorTitle = "Oops! Halaman Bermasalah";
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorTitle = "Terjadi Kesalahan Aplikasi";
    errorStatus = "App Error";
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorTitle = "Terjadi Kesalahan Tak Terduga";
  } else {
    console.error(error);
    errorMessage = 'Unknown error';
    errorTitle = "Sesuatu yang salah telah terjadi";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-red-50 p-6 flex justify-center items-center flex-col">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center">
            {errorTitle}
          </h1>
          <p className="text-red-600 font-medium mt-1 bg-red-100 px-3 py-1 rounded-full text-sm">
            Kode: {errorStatus}
          </p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">
              Maaf, kami menemukan kendala saat memproses permintaan Anda.
            </p>
            <p className="text-gray-500 text-sm">
              Tim teknis kami telah dinotifikasi tentang masalah ini.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(0)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-5 h-5" />
              Muat Ulang Halaman
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Kembali ke Beranda
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mx-auto transition-colors"
            >
              {showDetails ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Sembunyikan Detail Teknis
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> Lihat Detail Teknis
                </>
              )}
            </button>
            
            {showDetails && (
              <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto text-left shadow-inner">
                <code className="text-xs text-green-400 font-mono block whitespace-pre-wrap break-all">
                  {errorMessage}
                  {error instanceof Error && error.stack && (
                    <span className="block mt-2 text-gray-500 border-t border-gray-700 pt-2">
                      {error.stack}
                    </span>
                  )}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
