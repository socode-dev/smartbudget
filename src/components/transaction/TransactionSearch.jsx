import { FiSearch } from "react-icons/fi";
import Input from "../ui/Input";

export default function TransactionSearch({ filters, update }) {
  return (
    <div className="min-[420px]:col-span-full min-[1280px]:col-auto">
      <label
        htmlFor="transaction-search"
        className="mb-1.5 block text-sm font-medium"
      >
        Search
      </label>
      <div className="relative">
        <FiSearch
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="transaction-search"
          type="search"
          placeholder="Search by description..."
          value={filters.search}
          onChange={update("search")}
          className="pl-10"
        />
      </div>
    </div>
  );
}
