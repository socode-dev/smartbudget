import clsx from "clsx";
import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

const PasswordField = forwardRef(function PasswordField(
  {
    autoComplete = "new-password",
    id,
    label,
    error,
    hint,
    labelAction,
    required = true,
    className = "mb-4",
    ...props
  },
  ref,
) {
  const [isRevealed, setIsRevealed] = useState(false);
  const Icon = isRevealed ? FiEyeOff : FiEye;
  const toggleLabel = `${isRevealed ? "Hide" : "Show"} ${label.toLowerCase()}`;
  
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      hint={hint}
      labelAction={labelAction}
      required={required}
      className={className}
    >
      {(fieldProps) => (
        <div className="relative">
          <Input
            {...props}
            {...fieldProps}
            ref={ref}
            type={isRevealed ? "text" : "password"}
            autoComplete={autoComplete}
            className="pr-12"
          />
          
          <button
            type="button"
            disabled={props.disabled}
            aria-label={toggleLabel}
            aria-controls={fieldProps.id}
            aria-pressed={isRevealed}
            title={toggleLabel}
            onClick={() => setIsRevealed((value) => !value)}
            className={clsx(
              "absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-md text-muted-foreground",
              "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:cursor-not-allowed",
            )}
          >
            <Icon aria-hidden="true" size={18} />
          </button>
        </div>
      )}
    </FormField>
  );
});
export default PasswordField;
