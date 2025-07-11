import { forwardRef } from "react";

const Input = forwardRef(
  (
    { type = "text", value, onChange, placeholder, className = "", ...props },
    ref
  ) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ref={ref}
      className={`block w-full border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
);

export default Input;
