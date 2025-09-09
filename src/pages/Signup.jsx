import { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaMicrosoft } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuthFormContext } from "../context/AuthFormContext";
import ScrollToTop from "../layout/ScrollToTop";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import useThresholdForm from "../hooks/useThresholdForm";
import { getThresholdsValue } from "../utils/getValues";
import useAuthStore from "../store/useAuthStore";

const Signup = () => {
  const {
    onSignup,
    onGoogleSignIn,
    onMicrosoftSignIn,
    onSignupErr,
    microsoftErr,
    googleErr,
  } = useAuthStore();

  const {
    signupRegister: register,
    signupErrors: errors,
    signupIsSubmitting: isSubmitting,
    signupHandleSubmit: handleSubmit,
  } = useAuthFormContext();

  const { getValues } = useThresholdForm();

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
    <main className="w-full max-w-[650px] h-auto px-2 py-8 flex flex-col items-center mx-auto">
      <ScrollToTop />
      <h2 className="text-3xl md:text-4xl text-[rgb(var(--color-brand))] text-center font-medium tracking-wide">
        Create an Account
      </h2>
      <p className="text-base text-[rgb(var(--color-muted))] text-center mt-4 mb-6">
        Let's get you set up with SmartBudget
      </p>

      {/* Display authentication error if there is any */}
      {onSignupErr && (
        <p className="max-w-11/12 bg-[rgb(var(--color-status-bg-red))] px-4 py-2 rounded text-red-600 text-sm mb-2">
          {onSignupErr}
        </p>
      )}

      {microsoftErr && (
        <p className="max-w-11/12 bg-[rgb(var(--color-status-bg-red))] px-4 py-2 rounded text-red-600 text-sm mb-2">
          {microsoftErr}
        </p>
      )}

      {googleErr && (
        <p className="max-w-11/12 bg-[rgb(var(--color-status-bg-red))] px-4 py-2 rounded text-red-600 text-sm mb-2">
          {googleErr}
        </p>
      )}

      <form
        onSubmit={handleSubmit((data) =>
          onSignup(data, getThresholdsValue(getValues))
        )}
        className="w-full grid grid-cols-2 gap-2"
      >
        {/* First Name field */}
        <fieldset>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="first-name"
              className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
            >
              First Name
            </label>
            <input
              {...register("firstName")}
              type="firstName"
              id="firstName"
              placeholder="Enter your first name"
              className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </fieldset>

        {/* Last Name field */}
        <fieldset>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="last-name"
              className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
            >
              Last Name
            </label>
            <input
              {...register("lastName")}
              type="lastName"
              id="last-name"
              placeholder="Enter your last name"
              className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </fieldset>

        {/* Email field */}
        <fieldset className="col-span-full">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </fieldset>

        {/* Password fields */}
        <fieldset className="col-span-full sm:col-span-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={revealPassword.password ? "text" : "password"}
                id="password"
                placeholder="Enter password"
                className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon.password
                onClick={() => togglePasswordReveal("password")}
                className="text-lg text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
              />
            </div>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </fieldset>

        {/* Confirm Password field */}
        <fieldset className="col-span-full sm:col-span-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm-password"
              className="text-base text-[rgb(var(--color-muted))] font-medium after:content-['*'] after:text-red-500 after:ml-0.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={revealPassword.confirmPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirm password"
                className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon.confirmPassword
                onClick={() => togglePasswordReveal("confirmPassword")}
                className="text-lg text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
              />
            </div>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </fieldset>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="col-span-full mt-6 text-base font-medium text-center py-2 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97
          active:scale-103 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {isSubmitting ? <LoadingSpinner size={25} /> : "Create Account"}
        </button>
      </form>

      <section className="w-11/12 flex flex-col gap-3 mt-6">
        <p className="text-base text-center">OR SIGN UP WITH:</p>

        <fieldset className="w-full flex gap-4">
          {/* Google sign up */}
          <button
            onClick={() => onGoogleSignIn(getThresholdsValue(getValues))}
            className="w-1/2 px-4 py-2 flex items-center justify-center gap-4 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-base text-[rgb(var(--color-muted))] font-medium cursor-pointer"
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          {/* Microsoft sign up */}
          <button
            onClick={() => onMicrosoftSignIn(getThresholdsValue(getValues))}
            className="w-1/2 px-4 py-2 flex items-center justify-center gap-4 border-2 border-[rgb(var(--color-gray-border))] rounded-lg text-base text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-gray-bg))] transition font-medium cursor-pointer"
          >
            <FaMicrosoft />
            <span>Microsoft</span>
          </button>
        </fieldset>
      </section>

      <p className="text-base text-center text-[rgb(var(--color-muted))] mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[rgb(var(--color-brand))] font-medium"
        >
          Log in
        </Link>
      </p>
    </main>
  );
};

export default Signup;
