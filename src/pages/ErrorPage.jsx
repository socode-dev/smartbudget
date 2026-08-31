import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaTriangleExclamation } from "react-icons/fa6";
import useAuthStore from "../store/useAuthStore";
import AuthLoadingScreen from "../components/ui/AuthLoadingScreen";
import { isDemoUser } from "../demo/useDemoMode";

const ErrorPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.currentUser);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  const isAuthenticated = Boolean(user && !isDemoUser(user));
  const destination = isAuthenticated ? "/" : "/";
  const buttonLabel = isAuthenticated ? "Go to dashboard" : "Go home";

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-dvh w-full flex items-center justify-center bg-[rgb(var(--color-bg-card))] px-5 py-10"
    >
      <section className="w-full max-w-[560px] flex flex-col items-center text-center">
        <div
          role="img"
          aria-label="Page not found"
          className="mb-6 rounded-full border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-gray-bg))] p-5 text-3xl text-[rgb(var(--color-brand))]"
        >
          <FaTriangleExclamation aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--color-brand))]">
          404
        </p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-[rgb(var(--color-text))]">
          Page not found
        </h1>
        <p className="mt-4 max-w-[460px] text-base text-[rgb(var(--color-muted))]">
          The page you are looking for does not exist or may have been moved.
        </p>

        <button
          type="button"
          onClick={() => navigate(destination)}
          className="mt-8 inline-flex items-center justify-center gap-3 rounded-lg bg-[rgb(var(--color-brand))] px-5 py-2.5 text-base font-medium text-white shadow transition hover:scale-97 active:scale-103 cursor-pointer"
        >
          <span>{buttonLabel}</span>
          <FaArrowRight aria-hidden="true" />
        </button>
      </section>
    </motion.main>
  );
};

export default ErrorPage;
