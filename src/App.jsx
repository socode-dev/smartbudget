import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { ModalProvider } from "./context/ModalContext";
import { FormProvider } from "./context/FormContext";
import useTransactionStore from "./store/useTransactionStore";
import { ReportProvider } from "./context/ReportContext";
import { useThemeEffect } from "./hooks/useThemeEffect";
import { OverviewProvider } from "./context/OverviewContext";
import { ReportChartProvider } from "./context/ReportChartContext";
import { OverviewChartProvider } from "./context/OverviewChartContext";
import { TransactionsProvider } from "./context/TransactionsContext";
import { AuthProvider } from "./context/AuthContext";
import AuthLayout from "./layout/AuthLayouts";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ProtectedRoute from "./components/routes/ProtectedRoute";

const Overview = lazy(() => import("./pages/Overview"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Reports = lazy(() => import("./pages/Reports"));
const Goals = lazy(() => import("./pages/Goals"));
const Insights = lazy(() => import("./pages/Insights"));

function App() {
  const { loadTransactions } = useTransactionStore();

  // Initialize and handle theme changes
  useThemeEffect();

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      const labels = ["transactions", "budgets", "goals", "contributions"];
      labels.forEach(async (label) => {
        await loadTransactions(label);
      });
    };
    load();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  const routes = (
    <>
      {/* Authentication routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <AuthProvider>
          <FormProvider>
            <ModalProvider>
              <Routes>{routes}</Routes>
            </ModalProvider>
          </FormProvider>
        </AuthProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
