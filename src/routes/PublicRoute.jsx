import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";
import { isDemoUser } from "../demo/useDemoMode";

const PublicRoute = ({ children }) => {
  const user = useAuthStore((state) => state.currentUser);
  const userLoggedIn = useAuthStore((state) => state.userLoggedIn);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (userLoggedIn && !isDemoUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
