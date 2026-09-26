import Button from "../ui/Button";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export default function TransactionPagination({
  handlePrev,
  currentPage,
  totalPages,
  handleNext,
}) {
  return (
    <nav
      aria-label="Transaction pages"
      className="flex items-center justify-between gap-3 py-4"
    >
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <span className="flex items-center gap-2">
          <FiArrowLeft aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      </Button>
      <span className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={currentPage === totalPages}
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
