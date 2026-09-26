import Input from "../ui/Input";
import { getCurrencySymbol } from "../../utils/getCurrencyCode";

export default function ThresholdFields({
  group,
  isSubmitting,
  register,
  errors,
  currency,
}) {

  return (
    <fieldset
      className="grid min-w-0 gap-5 [&>legend]:mb-4 [&>legend]:text-xs [&>legend]:font-medium [&>legend]:text-muted-foreground"
      disabled={isSubmitting}
    >
      {group.fields.map(([key, label, desc]) => (
        <div
          className="grid grid-cols-1 items-center gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-6 [&>*]:min-w-0"
          key={key}
        >
          <div>
            <label htmlFor={`settings-${key}`} className="font-medium">{label}</label>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>

          <div className="min-w-0">
            <div className="relative">
              <Input
                id={`settings-${key}`}
                type="number"
                step="any"
                className="pr-14"
                {...register(key)}
                aria-invalid={!!errors[key]}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
              />
              <span
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground"
                aria-hidden="true"
              >
                {key === "transactionThreshold"
                  ? getCurrencySymbol(currency)
                  : "%"}
              </span>
            </div>
            {errors[key] && (
              <p
                id={`${key}-error`}
                className="mt-1.5 text-xs leading-5 text-danger"
              >
                {errors[key].message}
              </p>
            )}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
