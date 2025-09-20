import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import AnimatedLoader from "../components/ui/AnimatedLoader";

const PublicRoute = ({ children }) => {
  const userLoggedIn = useAuthStore((state) => state.isUserLoggedIn);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <AnimatedLoader />
      </div>
    );
  }

  if (userLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
