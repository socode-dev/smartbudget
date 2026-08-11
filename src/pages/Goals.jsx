import { useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import ScrollToTop from "../layout/ScrollToTop";
import { useGoalsContext } from "../context/GoalsContext";
import Cards from "../components/goals/Cards";
import { motion } from "framer-motion";
import useOnboardingStore from "../store/useOnboardingStore";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";
import useAuthStore from "../store/useAuthStore";

const Goals = () => {
  const isDemoMode = useDemoMode();
  const userId = useAuthStore((state) => state.currentUser?.uid);
  const { goals, filteredGoals, onOpenModal, searchName, setSearchName } =
    useGoalsContext();

  const { setCurrentPage, startTourIfNotCompleted } = useOnboardingStore();

  useEffect(() => {
    setCurrentPage("goals");
    
    const timer = setTimeout(() => {
      startTourIfNotCompleted("goals", userId);
    }, 500);

    return () => clearTimeout(timer);
  }, [setCurrentPage, startTourIfNotCompleted, userId]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="px-5 md:px-10 py-8"
    >
      <ScrollToTop />
      <section id="goals-header" className="flex justify-between items-start gap-8 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">Goals</h2>
          <p className="text-base text-[rgb(var(--color-muted))] mb-6">
            Stay focused on what you are saving for.
          </p>
        </div>

        {filteredGoals.length > 0 && (
          <button
            type="button"
            aria-label="Open form to add goal"
            aria-haspopup="dialog"
            onClick={() => isDemoMode ? showDemoReadOnlyToast() : onOpenModal("goals", "add")}
            className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))] transition cursor-pointer text-white px-4 py-2 rounded-md text-xl"
          >
            <FaPlus aria-hidden="true" />
          </button>
        )}
      </section>

      {goals?.length > 0 && (
        <input
          id="goals-search"
          type="text"
          aria-live="polite"
          placeholder="Search by name..."
          className="w-full mx-auto mb-10 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] focus:ring-2 focus:ring-[rgb(var(--color-brand))] focus:ring-offset-2 transition text-sm p-2"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      )}

      {goals.length === 0 && (
        <div aria-live="polite" className="mt-4 flex flex-col items-center w-full">
          <p
            id="goals-empty-state"
            className="text-base text-[rgb(var(--color-muted))] text-center mb-6"
          >
            You have not set any financial goals yet. Start saving
            intentionally.
          </p>

          <button
            type="button"
            aria-label="Open form to add goal"
            aria-haspopup="dialog"
            id="add-first-goal-btn"
            onClick={() => isDemoMode ? showDemoReadOnlyToast() : onOpenModal("goals", "add")}
            className=" bg-blue-500 hover:bg-blue-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-base flex items-center gap-2"
          >
            <FaPlus aria-hidden="true" className="text-lg" />
            <span>Add Your First Goal</span>
          </button>
        </div>
      )}

      {filteredGoals?.length === 0 && goals.length > 0 && (
        <p className="text-center text-base text-[rgb(var(--color-muted))] mb-6">
          The goal you are looking for does not exist.
        </p>
      )}

      <Cards />
    </motion.main>
  );
};

export default Goals;
