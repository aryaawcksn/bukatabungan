import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import { useEffect, type JSX } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotFoundPage from "./components/notFoundPage";


function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return (
  <div className="fixed inset-0 z-50 grid place-items-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">
        Mengambil data...
      </p>
    </div>
  </div>
);

  
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return (
  <div className="fixed inset-0 z-50 grid place-items-center bg-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">
        Mengambil data...
      </p>
    </div>
  </div>
);


  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}

function AppRoutes() {
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
