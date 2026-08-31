import { motion } from "framer-motion";
import ScrollToTop from "../../layout/ScrollToTop";

const AuthMotionShell = ({ children }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-[500px] h-auto px-2 py-8 flex flex-col items-center mx-auto"
    >
      <ScrollToTop />
      {children}
    </motion.main>
  );
};

export default AuthMotionShell;
