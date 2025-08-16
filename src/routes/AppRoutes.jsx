import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layout/AuthLayouts";
import MainLayout from "../layout/MainLayout";
import PublicRoute from "../components/routes/PublicRoute";
import ProtectedRoute from "../components/routes/ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import { lazy } from "react";

const Overview = lazy(() => import("../pages/Overview"));
const Transactions = lazy(() => import("../pages/Transactions"));
const Budgets = lazy(() => import("../pages/Budgets"));
const Goals = lazy(() => import("../pages/Goals"));
const Insights = lazy(() => import("../pages/Insights"));
const Reports = lazy(() => import("../pages/Reports"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="forgot-password/reset" element={<ResetPassword />} />
        <Route
          path="signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
      </Route>

      {/* Main routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="goals" element={<Goals />} />
        <Route path="insights" element={<Insights />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
