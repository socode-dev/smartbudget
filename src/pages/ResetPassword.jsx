import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useAuthFormContext } from "../context/AuthFormContext";
import { useAuthContext } from "../context/AuthContext";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const ResetPassword = () => {
  const {
    resetRegister: register,
    resetErrors: errors,
    resetIsSubmitting: isSubmitting,
  } = useAuthFormContext();
  const { onPasswordReset, userEmail, resetLinkErr } = useAuthContext();

  const [revealPassword, setRevealPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const Icon = {
    password: revealPassword.password ? FaEye : FaEyeSlash,
    confirmPassword: revealPassword.confirmPassword ? FaEye : FaEyeSlash,
  };

  const togglePasswordReveal = (type) =>
    setRevealPassword((prev) => ({ ...prev, [type]: !prev[type] }));

  return (
    <main className="w-full max-w-[500px] h-auto p-5 flex flex-col items-center mx-auto">
      <h2 className="text-3xl md:text-4xl text-[rgb(var(--color-brand))] text-center font-medium tracking-wide">
        Reset Password
      </h2>
      <p className="text-base text-[rgb(var(--color-muted))] text-center mt-4 mb-6">
        Please set a new password for{" "}
        <strong>{userEmail ?? "your SmartBudget account"}</strong>
      </p>

      {resetLinkErr && (
        <p className="w-11/12 bg-red-50 px-3 py-2 rounded text-center text-red-500 text-sm ">
          {resetLinkErr}
        </p>
      )}

      <form className="w-full flex flex-col">
        {/* Password fields */}
        <fieldset className="mt-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-base text-[rgb(var(--color-muted))] font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={revealPassword.password ? "text" : "password"}
                id="password"
                placeholder="Enter New password"
                className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon.password
                onClick={() => togglePasswordReveal("password")}
                className="text-lg text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
              />
            </div>
          </div>
          {errors.password && (
            <p className="text-[12px] text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </fieldset>

        {/* Confirm Password field */}
        <fieldset className="mt-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm-password"
              className="text-base text-[rgb(var(--color-muted))] font-medium"
            >
              Re-type New Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={revealPassword.confirmPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirm New password"
                className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon.confirmPassword
                onClick={() => togglePasswordReveal("confirmPassword")}
                className="text-lg text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
              />
            </div>
          </div>
          {errors.confirmPassword && (
            <p className="text-[12px] text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </fieldset>

        <button
          onClick={onPasswordReset}
          disabled={isSubmitting}
          className="w-1/2 self-start text-base text-center font-medium px-4 py-2 mt-6 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 transition cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? <LoadingSpinner size={25} /> : "Reset Password"}
        </button>
      </form>
    </main>
  );
};

export default ResetPassword;
