import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import AnimatedLoader from "../components/ui/AnimatedLoader";

const ProtectedRoute = ({ children }) => {
  const { currentUser: user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <AnimatedLoader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
