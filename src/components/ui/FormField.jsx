import { useId } from "react";

const FormField = ({
  id,
  label,
  required = false,
  error,
  hint,
  labelAction,
  children,
  className,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const message = typeof error === "string" ? error : error?.message;
  const descriptionId = message
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && (
            <span className="text-danger" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {labelAction}
      </div>
      {children({
        id: inputId,
        required,
        "aria-invalid": Boolean(message),
        "aria-describedby": descriptionId,
      })}
      {message ? (
        <p
          id={descriptionId}
          role="alert"
          className="mt-1.5 text-xs leading-5 text-danger"
        >
          {message}
        </p>
      ) : hint ? (
        <p
          id={descriptionId}
          className="mt-1.5 text-xs leading-5 text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default FormField;
