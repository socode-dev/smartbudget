import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { ModalProvider } from "./context/ModalContext";
import { FormProvider } from "./context/FormContext";
import { ReportProvider } from "./context/ReportContext";
import { useThemeEffect } from "./hooks/useThemeEffect";
import { OverviewProvider } from "./context/OverviewContext";
import { ReportChartProvider } from "./context/ReportChartContext";
import { OverviewChartProvider } from "./context/OverviewChartContext";
import { TransactionsProvider } from "./context/TransactionsContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthFormProvider } from "./context/AuthFormContext";
import AuthLayout from "./layout/AuthLayouts";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import PublicRoute from "./components/routes/PublicRoute";

const Overview = lazy(() => import("./pages/Overview"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Reports = lazy(() => import("./pages/Reports"));
const Goals = lazy(() => import("./pages/Goals"));
const Insights = lazy(() => import("./pages/Insights"));

function App() {
  // Initialize and handle theme changes
  useThemeEffect();

  const routes = (
    <>
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
        <Route
          index
          element={
            <OverviewProvider>
              <OverviewChartProvider>
                <Overview />
              </OverviewChartProvider>
            </OverviewProvider>
          }
        />
        <Route
          path="transactions"
          element={
            <TransactionsProvider>
              <Transactions />
            </TransactionsProvider>
          }
        />
        <Route path="budgets" element={<Budgets />} />
        <Route
          path="reports"
          element={
            <ReportProvider>
              <ReportChartProvider>
                <Reports />
              </ReportChartProvider>
            </ReportProvider>
          }
        />
        <Route path="goals" element={<Goals />} />
        <Route path="insights" element={<Insights />} />
      </Route>
    </>
  );

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <AuthFormProvider>
          <AuthProvider>
            <FormProvider>
              <ModalProvider>
                <Routes>{routes}</Routes>
              </ModalProvider>
            </FormProvider>
          </AuthProvider>
        </AuthFormProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
