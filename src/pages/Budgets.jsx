import { motion, useReducedMotion } from "framer-motion";
import { FiPlus, FiSearch, FiCreditCard } from "react-icons/fi";
import ScrollToTop from "../layout/ScrollToTop";
import { useBudgetsContext } from "../context/BudgetsContext";
import Cards from "../components/budgets/Cards";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";

const Budgets = () => {
  const isDemoMode = useDemoMode();
  const reducedMotion = useReducedMotion();

  const { budgets, filteredBudgets, searchName, setSearchName, onOpenModal } =
    useBudgetsContext();

  const addBudget = () =>
    isDemoMode ? showDemoReadOnlyToast() : onOpenModal("budgets", "add");

  const hasBudgets = budgets.length > 0;

  return (
    <motion.div
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
      className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    >
      <ScrollToTop />
      <header
        id="budgets-header"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold">Budgets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor and manage your category limits.
          </p>
        </div>
        {hasBudgets && (
          <Button onClick={addBudget} aria-haspopup="dialog">
            <span className="flex items-center gap-2">
              <FiPlus aria-hidden="true" />
              Set budget
            </span>
          </Button>
        )}
      </header>

      {hasBudgets && (
        <div className="w-full max-w-md">
          <label htmlFor="budgets-search" className="sr-only">
            Search budgets by name or category
          </label>
          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="budgets-search"
              type="search"
              placeholder="Search by name or category..."
              className="pl-10"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
            />
          </div>
        </div>
      )}

      {filteredBudgets.length > 0 ? (
        <Cards key={searchName} />
      ) : (
        <section
          id={hasBudgets ? "budgets-no-results" : "budgets-empty-state"}
          className="flex min-h-80 flex-col items-center justify-center gap-4 px-4 py-8 text-center"
          aria-labelledby="budgets-empty-heading"
        >
          <span
            className="grid size-12 place-items-center rounded-lg bg-info-soft text-2xl text-primary"
            aria-hidden="true"
          >
            {hasBudgets ? <FiSearch /> : <FiCreditCard />}
          </span>
          <h2
            id="budgets-empty-heading"
            className="font-display text-xl font-semibold"
          >
            {hasBudgets ? "No matching budgets" : "No budgets yet"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasBudgets
              ? "No budgets match your search."
              : "You have not added any budgets yet."}
          </p>
          {hasBudgets ? (
            <Button variant="outline" onClick={() => setSearchName("")}>
              Clear search
            </Button>
          ) : (
            <Button
              id="add-first-budget-btn"
              onClick={addBudget}
              aria-haspopup="dialog"
            >
              <span className="flex items-center gap-2">
                <FiPlus aria-hidden="true" />
                Add your first budget
              </span>
            </Button>
          )}
        </section>
      )}
    </motion.div>
  );
};
export default Budgets;
