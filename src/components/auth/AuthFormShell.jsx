import { motion, useReducedMotion } from "framer-motion";
import ScrollToTop from "../../layout/ScrollToTop";

const AuthFormShell = ({ title, description, children }) => {
  const reducedMotion = useReducedMotion();
  
  return (
    <motion.main
      initial={
        reducedMotion
          ? false
          : {
              opacity: 0,
              y: 12,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
      }}
      className="m-auto min-w-0 w-full max-w-md py-4"
    >
      <ScrollToTop />
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold leading-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </header>
      {children}
    </motion.main>
  );
};
export default AuthFormShell;
