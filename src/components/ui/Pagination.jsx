import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Button from "./Button";

const Pagination = ({ page, pages, onPageChange, label, count }) =>
  pages > 1 ? (
    <nav
      aria-label={label}
      className="mt-6 flex items-center justify-between gap-3 border border-border rounded-xl py-4 px-5"
    >
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
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
        {`Page ${page} of ${pages} ${count && `· ${count}`}`}
      </p>

      <Button
        variant="outline"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <span className="flex items-center gap-2">
          <span className="hidden sm:inline">Next</span>
          <FiArrowRight aria-hidden="true" />
        </span>
      </Button>
    </nav>
  ) : null;

export default Pagination;
