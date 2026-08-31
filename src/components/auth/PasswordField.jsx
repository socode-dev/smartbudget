import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const PasswordField = ({
  autoComplete = "new-password",
  id,
  label,
  name,
  onChange,
  placeholder,
  value,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const Icon = isRevealed ? FaEye : FaEyeSlash;

  return (
    <fieldset className="w-full mb-4">
      <div className="flex flex-col gap-1">
        <label
          htmlFor={id}
          className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
        >
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={name}
            type={isRevealed ? "text" : "password"}
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            required
            placeholder={placeholder}
            className="w-full text-base text-[rgb(var(--color-muted))] px-4 py-2 pr-10 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] focus:ring-2 focus:ring-[rgb(var(--color-brand))] focus:ring-offset-2 transition"
          />

          <button
            type="button"
            aria-label={isRevealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            onClick={() => setIsRevealed((prev) => !prev)}
            className="text-lg text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
          >
            <Icon aria-hidden="true" />
          </button>
        </div>
      </div>
    </fieldset>
  );
};

export default PasswordField;
