import Button from "../ui/Button";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export default function GoalPagination({
  currentPage,
  setPage,
  totalPages,
  filteredGoals,
}) {

  return (
    <nav
      aria-label="Goals pagination"
      className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4"
    >
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
        aria-label="Previous page"
      >
        <span className="flex items-center gap-2">
          <FiArrowLeft aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      </Button>

      <p
        className="text-center text-xs text-muted-foreground"
        aria-live="polite"
      >
        Page {currentPage} of {totalPages}
        <span className="block mt-1">
          {filteredGoals.length} {filteredGoals.length === 1 ? "goal" : "goals"}
        </span>
      </p>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
        aria-label="Next page"
      >
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline">Next</span>
          <FiArrowRight aria-hidden="true" />
        </span>
      </Button>
    </nav>
  );
}
