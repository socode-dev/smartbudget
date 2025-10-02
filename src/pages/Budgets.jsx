import { useEffect } from "react";
import ScrollToTop from "../layout/ScrollToTop";
import { useBudgetsContext } from "../context/BudgetsContext";
import { FaPlus } from "react-icons/fa";
import Cards from "../components/budgets/Cards";
import { motion } from "framer-motion";
import useOnboardingStore from "../store/useOnboardingStore";

const Budgets = () => {
  const { budgets, filteredBudgets, searchName, setSearchName, onOpenModal } =
    useBudgetsContext();

  const { setCurrentPage, startTourIfNotCompleted } = useOnboardingStore();

  useEffect(() => {
    setCurrentPage("budgets");
    // Start tour if not completed when navigating to budgets page
    const timer = setTimeout(() => {
      startTourIfNotCompleted("budgets");
    }, 500);

    return () => clearTimeout(timer);
  }, [setCurrentPage, startTourIfNotCompleted]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="px-5 md:px-10 py-8"
    >
      <ScrollToTop />
      <section className="w-full flex items-start justify-between gap-8 mb-6">
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">Budgets</h2>
          <p className="text-base text-[rgb(var(--color-muted))] mb-4">
            Monitor and manage your category limits
          </p>
        </div>

        {filteredBudgets.length > 0 && (
          <button
            onClick={() => onOpenModal("budgets", "add")}
            className="bg-[rgb(var(--color-brand-deep))] hover:[rgb(var(--color-brand))] transition cursor-pointer text-white px-4 py-2 rounded-md text-xl"
          >
            <FaPlus />
          </button>
        )}
      </section>

      {budgets.length > 0 && (
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full mx-auto mb-6 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-sm p-2"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      )}

      {/* // Budget Cards */}
      <Cards />

      {/* Empty state if budget searched does not exist */}
      {filteredBudgets?.length === 0 && budgets.length > 0 && (
        <p className="text-center text-base text-[rgb(var(--color-muted))] mb-6">
          The budget you are looking for does not exist.
        </p>
      )}

      {/* Empty State */}
      {budgets.length === 0 && (
        <>
          <p
            id="budgets-empty-state"
            className="mt-6 text-base text-center text-[rgb(var(--color-muted))] mb-6"
          >
            You have not added any budgets yet.
          </p>

          <button
            id="add-first-budget-btn"
            onClick={() => onOpenModal("budgets", "add")}
            className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))] transition cursor-pointer text-white px-4 py-2 rounded-md text-base flex items-center mx-auto gap-2"
          >
            <FaPlus />
            <span>Add Your First Budget</span>
          </button>
        </>
      )}
    </motion.main>
  );
};

export default Budgets;
