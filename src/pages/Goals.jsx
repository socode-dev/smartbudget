import { FaPlus } from "react-icons/fa";
import ScrollToTop from "../layout/ScrollToTop";
import { useGoalsContext } from "../context/GoalsContext";
import Cards from "../components/goals/Cards";

const Goals = () => {
  const { goals, filteredGoals, onOpenModal, searchName, setSearchName } =
    useGoalsContext();

  return (
    <main className="px-5 md:px-10 py-8">
      <ScrollToTop />
      <section className="flex justify-between items-start gap-8 mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-2">Goals</h2>
          <p className="text-base text-[rgb(var(--color-muted))] mb-6">
            Stay focused on what you are saving for.
          </p>
        </div>

        {filteredGoals.length > 0 && (
          <button
            onClick={() => onOpenModal("goals", "add")}
            className="bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))] transition cursor-pointer text-white px-4 py-2 rounded-md text-xl"
          >
            <FaPlus />
          </button>
        )}
      </section>

      {/* Search bar to search goal by name */}
      {goals?.length > 0 && filteredGoals?.length === 0 && (
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full mx-auto mb-10 rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] transition text-sm p-2"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      )}

      {/* Goal Cards */}
      <Cards />

      {/* Empty state if goal searched does not exist */}
      {filteredGoals?.length === 0 && goals.length > 0 && (
        <p className="text-center text-base text-[rgb(var(--color-muted))] mb-6">
          The goal you are looking for does not exist.
        </p>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="mt-4 flex flex-col items-center w-full">
          <p className="text-base text-[rgb(var(--color-muted))] text-center mb-6">
            You have not set any financial goals yet. Start saving
            intentionally.
          </p>

          <button
            onClick={() => onOpenModal("goals", "add")}
            className=" bg-blue-500 hover:bg-blue-600 transition cursor-pointer text-white px-4 py-2 rounded-md text-base flex items-center gap-2"
          >
            <FaPlus className="text-lg" />
            <span>Add Your First Goal</span>
          </button>
        </div>
      )}
    </main>
  );
};

export default Goals;
