interface RouteLoaderProps {
  message?: string;
}

export default function RouteLoader({ message = "Memuat halaman..." }: RouteLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center animate-page-enter">
      <div className="text-center animate-content-enter">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4 animate-spinner-fade"></div>
        <p className="text-gray-600 animate-stagger-2">{message}</p>
      </div>
    </div>
  );
}