import useTransactionStore from "../../store/useTransactionStore";
import { useModalContext } from "../../context/ModalContext";
import useFormSubmit from "../../hooks/useFormSubmit";
import { useFormContext } from "../../context/FormContext";
import { useAuthContext } from "../../context/AuthContext";
import { useRef } from "react";

const ModalForm = ({ label, mode }) => {
  const formRef = useRef(null);
  const { currentUser } = useAuthContext();
  const { onCloseModal, transactionID } = useModalContext();
  const { onSubmit, handleSubmit } = useFormSubmit(label, mode);
  const forms = useFormContext(label);
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = forms;

  const { CATEGORY_OPTIONS, currencySymbol } = useTransactionStore();

  const categoryValue = watch("category");

  const transactionLabel = label === "transactions";
  const budgetLabel = label === "budgets";
  const goalLabel = label === "goals";
  const contributionLabel = label === "contributions";

  // Get current date
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  setValue("date", getTodayDate());

  const txID = mode === "edit" ? transactionID : null;

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, currentUser.uid, txID))}
      className="space-y-4"
    >
      {/* Category Dropdown */}
      {(transactionLabel || budgetLabel) && (
        <div>
          <label className="block text-base font-medium mb-2">Category</label>
          <select
            ref={formRef}
            {...register("category")}
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-sm w-full p-2 cursor-pointer"
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
        </div>
      )}

      {/* Goal and budget name for goal and budget */}
      {(categoryValue?.toLowerCase() === "other" ||
        goalLabel ||
        contributionLabel) && (
        <div>
          <label htmlFor="name" className="block text-base font-medium mb-2">
            {budgetLabel
              ? "Budget Name"
              : transactionLabel
              ? "Transaction Name"
              : "Name"}
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            placeholder={`Input ${
              transactionLabel ? "transaction" : budgetLabel ? "budget" : "goal"
            } name`}
            readOnly={contributionLabel}
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-sm w-full p-2"
          />
          {errors.name && (
            <p className="text-[13px] text-red-500 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>
      )}

      {/* Show type radio buttons if category is other */}
      {categoryValue?.toLowerCase() === "other" && transactionLabel && (
        <div className="flex flex-col">
          <h3 className="text-base font-medium mb-2">Type</h3>
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
                className="text-sm border-2 rounded-lg border-[rgb(var(--color-gray-border))] px-4 py-2 peer-checked:border-[rgb(var(--color-brand))] transition cursor-pointer"
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
                className="text-sm border-2 rounded-lg border-[rgb(var(--color-gray-border))] px-4 py-2 peer-checked:border-[rgb(var(--color-brand))] transition cursor-pointer"
              >
                Expense
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Amount and Date */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount Input */}
        <div>
          <label className="block text-base font-medium mb-2">
            {budgetLabel ? "Limit" : goalLabel ? "Target" : "Amount"}
          </label>
          <div className="flex items-center">
            <input
              {...register("amount")}
              type="number"
              className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-sm w-full p-2 cursor-pointer"
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
          <label className="block text-base font-medium mb-2">
            {transactionLabel
              ? "Date"
              : budgetLabel
              ? "Start Date"
              : goalLabel
              ? "Due Date"
              : "Contribution Date"}
          </label>
          <input
            {...register("date")}
            type="date"
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-sm w-full p-2 cursor-pointer"
          />
          {errors.date && (
            <p className="text-[13px] text-red-500 mt-1">
              {errors.date.message}
            </p>
          )}
        </div>
      </div>

      {/* Description || Notes Textarea */}
      <div>
        <label className="block text-base font-medium mb-2">
          {transactionLabel ? "Description" : "Notes"}{" "}
          <span className="text-[rgb(var(--color-muted))]">(optional)</span>
        </label>
        <textarea
          className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] textsm w-full p-2 resize-none"
          rows={3}
          placeholder={transactionLabel ? "Short description" : "Short notes"}
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
          className="text-[rgb(var(--color-text))] bg-[rgb(var(--color-gray-bg))] hover:bg-[rgb(var(--color-gray-bg-settings))] cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition"
          onClick={() => onCloseModal(label)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[rgb(var(--color-brand))] text-white hover:bg-[rgb(var(--color-brand-hover))] transition cursor-pointer px-4 py-2 rounded-md text-sm font-medium"
        >
          {mode === "add" ? "Save" : "Edit"}{" "}
          {transactionLabel
            ? "Transaction"
            : budgetLabel
            ? "Budget"
            : goalLabel
            ? "Goal"
            : "Contribution"}
        </button>
      </footer>
    </form>
  );
};

export default ModalForm;
