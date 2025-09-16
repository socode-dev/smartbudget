import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layout/AuthLayouts";
import MainLayout from "../layout/MainLayout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import { lazy } from "react";
import EmailVerified from "../pages/EmailVerified";
import LazyWrapper from "./LazyWrapper";
import OverviewSkeleton from "../components/skeletons/overview/OverviewSkeleton";
import TransactionSkeleton from "../components/skeletons/TransactionSkeleton";
import BudgetSkeleton from "../components/skeletons/BudgetSkeleton";
import GoalSkeleton from "../components/skeletons/GoalSkeleton";
import ReportSkeleton from "../components/skeletons/ReportSkeleton";
import InsightSkeleton from "../components/skeletons/InsightSkeleton";

const Overview = lazy(() => import("../pages/Overview"));
const Transactions = lazy(() => import("../pages/Transactions"));
const Budgets = lazy(() => import("../pages/Budgets"));
const Goals = lazy(() => import("../pages/Goals"));
const Insights = lazy(() => import("../pages/Insights"));
const Reports = lazy(() => import("../pages/Reports"));
const Notifications = lazy(() => import("../pages/Notifications"));

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
            <LazyWrapper loadingFallback={<OverviewSkeleton />}>
              <Overview />
            </LazyWrapper>
          }
        />
        <Route
          path="transactions"
          element={
            <LazyWrapper loadingFallback={<TransactionSkeleton />}>
              <Transactions />
            </LazyWrapper>
          }
        />
        <Route
          path="budgets"
          element={
            <LazyWrapper loadingFallback={<BudgetSkeleton />}>
              <Budgets />
            </LazyWrapper>
          }
        />
        <Route
          path="goals"
          element={
            <LazyWrapper loadingFallback={<GoalSkeleton />}>
              <Goals />
            </LazyWrapper>
          }
        />
        <Route
          path="insights"
          element={
            <LazyWrapper loadingFallback={<InsightSkeleton />}>
              <Insights />
            </LazyWrapper>
          }
        />
        <Route
          path="reports"
          element={
            <LazyWrapper loadingFallback={<ReportSkeleton />}>
              <Reports />
            </LazyWrapper>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="email-verified" element={<EmailVerified />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
