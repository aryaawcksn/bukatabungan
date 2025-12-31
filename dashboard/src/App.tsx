import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import { useEffect, useState, type JSX } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotFoundPage from "./components/notFoundPage";
import RouteLoader from "./components/RouteLoader";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengambil Data...</p>
        </div>
      </div>
);

  
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengambil Data...</p>
        </div>
      </div>
);


  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}

function AppRoutes() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Show loading when route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Short delay to show loading spinner

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Show loading spinner during route transitions
  if (isLoading) {
    return <RouteLoader />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/login" />
          </PublicRoute>
        }
      />

      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ✅ INI YANG KAMU LUPA — 404 ROUTE */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}


export default function App() {
  useEffect(() => {
    // 🧹 Cleanup legacy localStorage items
    const legacyKeys = ["token", "branch_admin", "admin_branch_id", "admin_branch_name", "isLoggedIn", "role", "admin_username"];
    legacyKeys.forEach(key => localStorage.removeItem(key));
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
