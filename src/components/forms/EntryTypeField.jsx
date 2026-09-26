import clsx from "clsx";
import { FiCheck } from "react-icons/fi";

export default function EntryTypeField({ errors, fieldId, register }) {
  return (
    <fieldset
      className="space-y-2"
      aria-describedby={errors.type ? fieldId("type-error") : undefined}
    >
      <legend className="text-sm font-semibold">
        Type{" "}
        <span className="text-red-500" aria-hidden="true">
          *
        </span>
        <span className="sr-only"> (required)</span>
      </legend>

      <div className="flex flex-wrap gap-2">
        {["income", "expense"].map((type) => (
          <div key={type} className="relative">
            <input
              {...register("type")}
              id={fieldId(type)}
              type="radio"
              value={type}
              required
              className="peer sr-only"
            />
            <label
              htmlFor={fieldId(type)}
              className={clsx(
                "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-checked:[&>svg]:block",
                type === "income"
                  ? "peer-checked:border-emerald-600 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-600 [.dark_&]:peer-checked:text-emerald-400"
                  : "peer-checked:border-red-500 peer-checked:bg-red-500/10 peer-checked:text-red-600 [.dark_&]:peer-checked:text-red-400",
              )}
            >
              <FiCheck className="hidden size-4" aria-hidden="true" />
              {type === "income" ? "Income" : "Expense"}
            </label>
          </div>
        ))}
      </div>

      {errors.type && (
        <p
          id={fieldId("type-error")}
          role="alert"
          className="text-xs text-red-500"
        >
          {errors.type.message}
        </p>
      )}
    </fieldset>
  );
}
