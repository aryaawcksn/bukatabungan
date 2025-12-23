import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import SavingsTypeSelection from "./components/SavingsTypeSelection";
import ProcedureSteps from "./components/ProcedureSteps";
import AccountForm from "./components/AccountForm";
import ProductDetails from "./components/ProductDetails";
import HeroLanding from "./pages/HeroLanding";
import InvalidRequestPage from "./pages/InvalidRequestPage";
import StatusCheck from "./components/StatusCheck";
import RouteLoader from "./components/RouteLoader";
import { VALID_SAVING_TYPES } from "./data/savingsTypes";

function RootLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);

  // Show loading when route changes - reduced delay for mobile
  React.useEffect(() => {
    setIsLoading(true);
    const isMobile = window.innerWidth < 768;
    const delay = isMobile ? 150 : 300; // Shorter delay on mobile
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return <RouteLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}

function HomePageWrapper() {
  const navigate = useNavigate();
  return <HomePage onOpenSavings={(type) => navigate(`/product/${type}`)} />;
}

function SelectionWrapper() {
  const navigate = useNavigate();
  return (
    <SavingsTypeSelection
      onSelectType={(type) => navigate(`/product/${type}`)}
      onBack={() => navigate("/")}
    />
  );
}

function ProductDetailsRoute() {
  const navigate = useNavigate();
  const { type } = useParams();

  if (!type) return <Navigate to="/" replace />;
  if (!VALID_SAVING_TYPES.includes(type)) {
    return <InvalidRequestPage />;
  }

  return (
    <ProductDetails
      savingsType={type}
      onNext={() => navigate(`/form/${type}`)}
      onBack={() => navigate("/selection")}
    />
  );
}

function ProcedureRoute() {
  const navigate = useNavigate();
  const { type } = useParams();

  if (!type) return <Navigate to="/" replace />;
  if (!VALID_SAVING_TYPES.includes(type)) {
    return <InvalidRequestPage />;
  }

  return (
    <ProcedureSteps
      savingsType={type}
      onComplete={() => navigate(`/form/${type}`)}
      onBack={() => navigate(`/product/${type}`)}
    />
  );
}

function FormRoute() {
  const navigate = useNavigate();
  const { type } = useParams();

  if (!type) return <Navigate to="/" replace />;
  if (!VALID_SAVING_TYPES.includes(type)) {
    return <InvalidRequestPage />;
  }

  return (
    <AccountForm
      savingsType={type}
      onBack={() => navigate(`/product/${type}`)}
    />
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePageWrapper />,
      },
      {
        path: "herolanding",
        element: <HeroLanding />,
      },
      {
        path: "selection",
        element: <SelectionWrapper />,
      },
      {
        path: "product/:type",
        element: <ProductDetailsRoute />,
      },
      {
        path: "procedure/:type",
        element: <ProcedureRoute />,
      },
      {
        path: "form/:type",
        element: <FormRoute />,
      },
      {
        path: "status/:referenceCode",
        element: <StatusCheck />,
      },
      {
        path: "*",
        element: <InvalidRequestPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
