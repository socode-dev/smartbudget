import { forwardRef } from "react";
import clsx from "clsx";
import LoadingSpinner from "./LoadingSpinner";

const Button = forwardRef(function Button(
  {
    as: Component = "button",
    variant = "primary",
    type = "button",
    loading = false,
    loadingText,
    disabled = false,
    className,
    children,
    onClick,
    ...props
  },
  ref,
) {
  const unavailable = disabled || loading;

  return (
    <Component
      {...props}
      ref={ref}
      type={Component === "button" ? type : undefined}
      disabled={Component === "button" ? unavailable : undefined}
      aria-disabled={unavailable || undefined}
      aria-busy={loading || undefined}
      tabIndex={unavailable && Component !== "button" ? -1 : props.tabIndex}
      onClick={(event) => {
        if (unavailable) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={clsx(
        "inline-flex min-h-10 min-w-0 flex-row cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2 text-center text-sm leading-5 font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 motion-reduce:transition-none",
        {
          "border-transparent": variant !== "outline",
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90":
            variant === "primary",
          "border-border bg-background text-foreground shadow-xs hover:bg-surface":
            variant === "outline",
          "text-muted-foreground hover:bg-surface hover:text-foreground":
            variant === "ghost",
          "bg-danger text-danger-foreground hover:bg-danger/90":
            variant === "destructive",
        },
        className,
      )}
    >
      {loading && (
        <LoadingSpinner
          compact
          size={16}
          color="currentColor"
          borderTopColor="transparent"
        />
      )}
      <span className="flex items-center justify-center gap-2">{loading ? loadingText || children : children}</span>
    </Component>
  );
});

export default Button;
