import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/Dashboard";
import AccountsPage from "./pages/Accounts";
import CategoriesPage from "./pages/Categories";
import TransactionsPage from "./pages/Transactions";
import LoginPage from "./pages/Auth/Login";
import RegisterPage from "./pages/Auth/Register";
import { isAuthenticated } from "./auth";

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
              </Routes>
            </MainLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default App;
