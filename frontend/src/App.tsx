import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import SavingsTypeSelection from "./components/SavingsTypeSelection";
import ProcedureSteps from "./components/ProcedureSteps";
import AccountForm from "./components/AccountForm";
import ProductDetails from "./components/ProductDetails";
import HeroLanding from "./pages/HeroLanding";

function AppWrapper() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = React.useState<string>("");
  // Arahkan ke ProductDetails dulu, kemudian ke procedure
  const handleOpenSavings = (type: string) => {
    setSelectedType(type);
    navigate(`/product/${type}`);
  };

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    navigate(`/product/${type}`);
  };

  const handleHeroLanding = () => {
    navigate(`/herolanding`);
  }

  const handleCompleteProcedure = () => {
    navigate(`/form/${selectedType}`);
  };

  const handleBack = (to: string) => {
    navigate(to);
  };

  function ProductDetailsRoute() {
    const params = useParams();
    const type = params.type ?? selectedType;
    if (!type) {
      return <Navigate to="/" replace />;
    }
    React.useEffect(() => {
      setSelectedType(type);
    }, [type]);
    return (
      <ProductDetails
        savingsType={type}
        onNext={() => navigate(`/form/${type}`)}
        onBack={() => handleBack("/selection")}
      />
    );
  }

  function ProcedureRoute() {
    const params = useParams();
    const type = params.type ?? selectedType;
    if (!type) {
      return <Navigate to="/" replace />;
    }
    React.useEffect(() => {
      setSelectedType(type);
    }, [type]);
    return (
      <ProcedureSteps
        savingsType={type}
        onComplete={() => navigate(`/form/${type}`)}
        onBack={() => handleBack(`/product/${type}`)}
      />
    );
  }

  function FormRoute() {
    const params = useParams();
    const type = params.type ?? selectedType;
    if (!type) {
      return <Navigate to="/" replace />;
    }
    React.useEffect(() => {
      setSelectedType(type);
    }, [type]);
    return (
      <AccountForm
        savingsType={type}
        onBack={() => handleBack(`/product/${type}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={<HomePage onOpenSavings={handleOpenSavings} />}
        />
           <Route path="/herolanding" element={<HeroLanding />} />
        <Route
          path="/selection"
          element={
            <SavingsTypeSelection
              onSelectType={handleSelectType}
              onBack={() => handleBack("/")}
            />
          }
        />
        <Route path="/product/:type" element={<ProductDetailsRoute />} />
        <Route path="/procedure/:type" element={<ProcedureRoute />} />
        <Route path="/form/:type" element={<FormRoute />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
