import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-lg text-[rgb(var(--color-muted))]">Loading...</p>
      </div>
    );
  }

  if (userLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
