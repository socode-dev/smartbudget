import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(
  (
    { type = "text", value, onChange, placeholder, className = "", ...props },
    ref,
  ) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ref={ref}
      className={clsx(
        "block h-11 min-w-0 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-base leading-6 text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-65 motion-reduce:transition-none md:text-sm",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export default Input;
