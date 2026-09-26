import { forwardRef } from "react";

const Checkbox = forwardRef(function Checkbox({ id, label, ...props }, ref) {
  return (
    <label
      htmlFor={id}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2"
    >
      <input
        {...props}
        ref={ref}
        id={id}
        type="checkbox"
        className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <span>{label}</span>
    </label>
  );
});
export default Checkbox;
