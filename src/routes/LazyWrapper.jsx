import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import ErrorFallback from "./ErrorFalback";

const LazyWrapper = ({ children, loadingFallback }) => {
  const navigate = useNavigate();

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => navigate(-1)}
    >
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};

export default LazyWrapper;
