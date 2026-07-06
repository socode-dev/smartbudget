import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";
import { isDemoUser } from "../demo/useDemoMode";

const ProtectedRoute = ({ children }) => {
  const user = useAuthStore((state) => state.currentUser);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user || isDemoUser(user)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
