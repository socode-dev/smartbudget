import FormField from "../ui/FormField";
import { getCurrencySymbol } from "../../utils/getCurrencyCode";
import clsx from "clsx";

export default function EntryAmountDateFields({
  fieldId,
  budgetLabel,
  goalLabel,
  errors,
  currency,
  register,
  controlClass,
}) {

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <FormField
        id={fieldId("amount")}
        label={budgetLabel ? "Limit" : goalLabel ? "Target" : "Amount"}
        required
        error={errors.amount}
      >
        {(props) => (
          <div className="relative">
            <span
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
              aria-hidden="true"
            >
              {getCurrencySymbol(currency)}
            </span>
            <input
              {...props}
              {...register("amount")}
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className={clsx(controlClass, "pl-12")}
              aria-label={`${budgetLabel ? "Limit" : goalLabel ? "Target" : "Amount"} (${currency})`}
            />
          </div>
        )}
      </FormField>

      <FormField
        id={fieldId("date")}
        label={budgetLabel ? "Start Date" : goalLabel ? "Due Date" : "Date"}
        required
        error={errors.date}
        className="min-w-0"
      >
        {(props) => (
          <input
            {...props}
            {...register("date")}
            type="date"
            className={clsx(controlClass, "max-w-full appearance-none")}
          />
        )}
      </FormField>
    </div>
  );
}
