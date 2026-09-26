import { motion, useReducedMotion } from "framer-motion";
import { FiPlus, FiSearch, FiTarget } from "react-icons/fi";
import ScrollToTop from "../layout/ScrollToTop";
import { useGoalsContext } from "../context/GoalsContext";
import Cards from "../components/goals/Cards";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { showDemoReadOnlyToast, useDemoMode } from "../demo/useDemoMode";

const Goals = () => {
  const isDemoMode = useDemoMode();
  const reducedMotion = useReducedMotion();
  const { goals, filteredGoals, onOpenModal, searchName, setSearchName } =
    useGoalsContext();
  const addGoal = () =>
    isDemoMode ? showDemoReadOnlyToast() : onOpenModal("goals", "add");

  const hasGoals = goals.length > 0;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto min-w-0 w-full max-w-[90rem] space-y-6 px-4 py-8 sm:px-6"
    >
      <ScrollToTop />
      <header
        id="goals-header"
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold">Goals</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stay focused on what you are saving for.
          </p>
        </div>

        {hasGoals && (
          <Button onClick={addGoal} aria-haspopup="dialog">
            <span className="flex items-center gap-2">
              <FiPlus aria-hidden="true" />
              Set goal
            </span>
          </Button>
        )}
      </header>

      {hasGoals && (
        <div className="w-full max-w-md">
          <label htmlFor="goals-search" className="sr-only">
            Search goals by name
          </label>
          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="goals-search"
              type="search"
              placeholder="Search by name..."
              className="pl-10"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
            />
          </div>
        </div>
      )}

      {filteredGoals.length > 0 ? (
        <Cards key={searchName} />
      ) : (
        <section
          id={hasGoals ? "goals-no-results" : "goals-empty-state"}
          className="flex min-h-80 flex-col items-center justify-center gap-4 px-4 py-8 text-center"
          aria-labelledby="goals-empty-heading"
        >
          <span
            className="grid size-12 place-items-center rounded-lg bg-info-soft text-2xl text-primary"
            aria-hidden="true"
          >
            {hasGoals ? <FiSearch /> : <FiTarget />}
          </span>
          <h2
            id="goals-empty-heading"
            className="font-display text-xl font-semibold"
          >
            {hasGoals ? "No matching goals" : "No goals yet"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasGoals
              ? "No goals match your search."
              : "You have not set any financial goals yet. Start saving intentionally."}
          </p>
          {hasGoals ? (
            <Button variant="outline" onClick={() => setSearchName("")}>
              Clear search
            </Button>
          ) : (
            <Button
              id="add-first-goal-btn"
              onClick={addGoal}
              aria-haspopup="dialog"
            >
              <span className="flex items-center gap-2">
                <FiPlus aria-hidden="true" />
                Add your first goal
              </span>
            </Button>
          )}
        </section>
      )}
    </motion.div>
  );
};
export default Goals;
