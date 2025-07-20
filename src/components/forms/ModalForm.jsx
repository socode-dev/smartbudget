import useTransactionStore from "../../store/useTransactionStore";
import { useModalContext } from "../../context/ModalContext";
import useFormSubmit from "../../hooks/useFormSubmit";

const ModalForm = ({ label }) => {
  const { onCloseModal } = useModalContext();
  const { onSubmit, register, watch, errors, isValid } = useFormSubmit(label);

  const { CATEGORY_OPTIONS, currencySymbol } = useTransactionStore();

  const categoryValue = watch("category");

  const transactions = label === "transactions";
  const budgets = label === "budgets";
  const goals = label === "goals";
  const contributions = label === "contributions";

  return (
    <form onSubmit={onSubmit}>
      {/* Goal name for goal */}
      {(goals || contributions) && (
        <div className="mb-4">
          <label htmlFor="goal" className="block text-sm font-medium mb-1">
            Goal Name
          </label>
          <input
            {...register("name")}
            type="text"
            id="goal"
            placeholder="Input goal name"
            readOnly={label === "contributions"}
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2"
          />
        </div>
      )}

      {/* Category Dropdown */}
      {(transactions || budgets) && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            {...register("category")}
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 cursor-pointer"
          >
            <option value="" disabled>
              Select category
            </option>
            {CATEGORY_OPTIONS.map((opt, i) => (
              <option key={i} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[13px] text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}
          {/* Show type radio buttons if category is other */}
          {categoryValue?.toLowerCase() === "other" && transactions && (
            <div className="flex flex-col mt-2">
              <h3 className="text-sm font-medium mb-1">Type</h3>
              <div className="flex items-center gap-2">
                {/* Income Radio Button */}
                <div className="flex items-center gap-2">
                  <input
                    {...register("type")}
                    type="radio"
                    name="type"
                    id="income"
                    value="income"
                    className="hidden peer"
                  />
                  <label
                    htmlFor="income"
                    className="text-xs border-2 rounded-lg border-[rgb(var(--color-gray-border))] px-4 py-1 peer-checked:border-[rgb(var(--color-brand))] transition cursor-pointer"
                  >
                    Income
                  </label>
                </div>

                {/* Expense Radio Button */}
                <div className="flex items-center gap-2">
                  <input
                    {...register("type")}
                    type="radio"
                    name="type"
                    id="expense"
                    value="expense"
                    className="hidden peer"
                  />
                  <label
                    htmlFor="expense"
                    className="text-xs border-2 rounded-lg border-[rgb(var(--color-gray-border))] px-4 py-1 peer-checked:border-[rgb(var(--color-brand))] transition cursor-pointer"
                  >
                    Expense
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Amount and Date */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {transactions
              ? "Amount"
              : budgets
              ? "Budget Limit"
              : goals
              ? "Target Amount"
              : "Contribution Amount"}
          </label>
          <div className="flex items-center">
            <span className="text-[rgb(var(--color-muted))] mr-2">
              {currencySymbol}
            </span>
            <input
              {...register("amount")}
              type="number"
              className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 cursor-pointer"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          {errors.amount && (
            <p className="text-[13px] text-red-500 mt-1">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {transactions
              ? "Date"
              : budgets
              ? "Start Date"
              : goals
              ? "Due Date"
              : "Contribution Date"}
          </label>
          <input
            {...register("date")}
            type="date"
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 cursor-pointer"
          />
          {errors.date && (
            <p className="text-[13px] text-red-500 mt-1">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      {/* Description || Notes Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          {transactions ? "Description" : "Notes"}{" "}
          <span className="text-[rgb(var(--color-muted))]">(optional)</span>
        </label>
        <textarea
          className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 resize-none"
          rows={3}
          placeholder={transactions ? "Short description" : "Short notes"}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-[13px] text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>
      {/* Buttons Row */}
      <footer className="flex justify-end gap-2">
        <button
          type="button"
          className="text-[rgb(var(--color-text))] bg-[rgb(var(--color-gray-bg))] hover:bg-[rgb(var(--color-gray-bg-settings))] cursor-pointer px-4 py-2 rounded-md text-xs font-medium transition"
          onClick={() => onCloseModal(label)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[rgb(var(--color-brand))] text-white hover:bg-[rgb(var(--color-brand-hover))] transition cursor-pointer px-4 py-2 rounded-md text-xs font-medium"
          disabled={!isValid}
        >
          Save{" "}
          {transactions
            ? "Transaction"
            : budgets
            ? "Budget"
            : goals
            ? "Goal"
            : "Contribution"}
        </button>
      </footer>
    </form>
  );
};

export default ModalForm;
