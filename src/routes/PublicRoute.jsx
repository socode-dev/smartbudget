import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import AnimatedLoader from "../components/ui/AnimatedLoader";
import { isDemoUser } from "../demo/useDemoMode";

const PublicRoute = ({ children }) => {
  const user = useAuthStore((state) => state.currentUser);
  const userLoggedIn = useAuthStore((state) => state.userLoggedIn);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <AnimatedLoader />
      </div>
    );
  }

  if (userLoggedIn && !isDemoUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
