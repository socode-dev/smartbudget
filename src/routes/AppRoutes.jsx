import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layout/AuthLayouts";
import MainLayout from "../layout/MainLayout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ActivateInvite from "../pages/ActivateInvite";
import ErrorPage from "../pages/ErrorPage";
import ForgotPassword from "../pages/ForgotPassword";
import EmailVerified from "../pages/EmailVerified";
import DemoInitializer from "../demo/DemoInitializer";
import LazyWrapper from "./LazyWrapper";
import { dashboardPages } from "./dashboardPages";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";

export default function AppRoutes() {
  const dashboardRoutes = dashboardPages.map(
    ({ path, Component, fallback }) => (
      <Route
        key={path || "overview"}
        index={!path}
        path={path}
        element={
          <LazyWrapper loadingFallback={fallback}>
            <Component />
          </LazyWrapper>
        }
      />
    ),
  );
  
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="activate" element={<ActivateInvite />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route
          path="email-verified"
          element={
            <ProtectedRoute>
              <EmailVerified />
            </ProtectedRoute>
          }
        />
        <Route
          path="login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
      </Route>
      <Route
        path="/demo"
        element={
          <DemoInitializer>
            <MainLayout />
          </DemoInitializer>
        }
      >
        {dashboardRoutes}
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {dashboardRoutes}
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
