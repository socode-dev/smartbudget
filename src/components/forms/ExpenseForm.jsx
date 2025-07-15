import useTransactionStore from "../../store/useTransactionStore";

const ExpenseForm = () => {
  const {
    category,
    setCategory,
    type,
    setType,
    amount,
    setAmount,
    date,
    setDate,
    description,
    setDescription,
    isFormValid,
    CATEGORY_OPTIONS,
    handleSave,
    currencySymbol,
    setDisplayModal,
  } = useTransactionStore();

  const formIsValid = isFormValid();

  return (
    <form onSubmit={handleSave}>
      {/* Category Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 cursor-pointer"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
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
        {/* Show type radio buttons if category is other */}
        {category.toLowerCase() === "other" && (
          <div className="flex flex-col mt-2">
            <h3 className="text-sm font-medium mb-1">Type</h3>
            <div className="flex items-center gap-2">
              {/* Income Radio Button */}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  checked={type === "income"}
                  value="income"
                  id="income"
                  onChange={(e) => setType(e.target.value)}
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
                  type="radio"
                  name="type"
                  checked={type === "expense"}
                  value="expense"
                  id="expense"
                  onChange={(e) => setType(e.target.value)}
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

      {/* Amount and Date */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount Input */}
        <fieldset>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <div className="flex items-center">
            <span className="text-[rgb(var(--color-muted))] mr-2">
              {currencySymbol}
            </span>
            <input
              type="number"
              className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 cursor-pointer"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </fieldset>

        {/* Date Picker */}
        <fieldset>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 cursor-pointer"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </fieldset>
      </div>

      {/* Notes Textarea */}
      <fieldset className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Description{" "}
          <span className="text-[rgb(var(--color-muted))]">(optional)</span>
        </label>
        <textarea
          className="rounded border border-[rgb(var(--color-gray-border))] bg-[rgb(var(--color-bg-card))] outline-none focus:border-[rgb(var(--color-brand))] text-xs w-full p-2 resize-none"
          rows={3}
          placeholder="Short notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </fieldset>
      {/* Buttons Row */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="text-[rgb(var(--color-text))] bg-[rgb(var(--color-gray-bg))] hover:bg-[rgb(var(--color-gray-bg-settings))] cursor-pointer px-4 py-2 rounded-md text-xs font-medium transition"
          onClick={() => setDisplayModal(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[rgb(var(--color-brand))] text-white hover:bg-[rgb(var(--color-brand-hover))] transition cursor-pointer px-4 py-2 rounded-md text-xs font-medium"
          disabled={!formIsValid}
        >
          Save Expense
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
