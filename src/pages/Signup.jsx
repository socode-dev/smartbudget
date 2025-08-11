import { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuthFormContext } from "../context/AuthFormContext";
import { useAuthContext } from "../context/AuthContext";
import ScrollToTop from "../layout/ScrollToTop";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const Signup = () => {
  const {
    signupRegister: register,
    signupErrors: errors,
    signupIsSubmitting: isSubmitting,
  } = useAuthFormContext();
  const { onSignup, onSignupErr, onGoogleSignIn } = useAuthContext();
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
    <main className="w-full max-w-[650px] h-auto py-4 flex flex-col items-center mx-auto">
      <ScrollToTop />
      <h2 className="text-2xl text-[rgb(var(--color-brand))] text-center font-medium tracking-wide">
        Create an Account
      </h2>
      <p className="text-sm text-[rgb(var(--color-muted))] text-center mt-2 mb-6">
        Let's get you set up with SmartBudget
      </p>

      <form onSubmit={onSignup} className="w-11/12 grid grid-cols-2 gap-2">
        {/* First Name field */}
        <fieldset>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="firstName"
              className="text-sm text-[rgb(var(--color-muted))] font-medium"
            >
              First Name
            </label>
            <input
              {...register("firstName")}
              type="firstName"
              id="firstName"
              placeholder="Enter your first name"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.firstName && (
            <p className="text-[12px] text-red-600 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </fieldset>

        {/* Last Name field */}
        <fieldset>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="lastName"
              className="text-sm text-[rgb(var(--color-muted))] font-medium"
            >
              Last Name
            </label>
            <input
              {...register("lastName")}
              type="lastName"
              id="lastName"
              placeholder="Enter your last name"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.lastName && (
            <p className="text-[12px] text-red-600 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </fieldset>

        {/* Email field */}
        <fieldset className="col-span-full">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm text-[rgb(var(--color-muted))] font-medium"
            >
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
          </div>
          {errors.email && (
            <p className="text-[12px] text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </fieldset>

        {/* Password fields */}
        <fieldset className="col-span-full sm:col-span-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm text-[rgb(var(--color-muted))] font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={revealPassword.password ? "text" : "password"}
                id="password"
                placeholder="Enter password"
                className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon.password
                onClick={() => togglePasswordReveal("password")}
                className="text-xs text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
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
        <fieldset className="col-span-full sm:col-span-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirm-password"
              className="text-sm text-[rgb(var(--color-muted))] font-medium"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type={revealPassword.confirmPassword ? "text" : "password"}
                id="confirm-password"
                placeholder="Confirm password"
                className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon.confirmPassword
                onClick={() => togglePasswordReveal("confirmPassword")}
                className="text-xs text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
              />
            </div>
          </div>
          {errors.confirmPassword && (
            <p className="text-[12px] text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </fieldset>

        {/* Display sign up error if there is any */}
        {onSignupErr && (
          <p className="text-red-600 text-[14px] col-span-full">
            {onSignupErr}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="col-span-full mt-3 text-sm font-medium text-center py-1 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97
          active:scale-103 disabled:opacity-50 transition cursor-pointer"
        >
          {isSubmitting ? <LoadingSpinner size={25} /> : "Create Account"}
        </button>
      </form>

      <section className="w-11/12 flex flex-col gap-3 mt-4">
        <p className="text-xs text-center">OR SIGN UP WITH:</p>

        <fieldset className="w-full flex gap-4">
          {/* Google login */}
          <button
            onClick={onGoogleSignIn}
            className="w-1/2 px-4 py-1 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-sm text-[rgb(var(--color-muted))] font-medium cursor-pointer"
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          {/* Apple login */}
          <button className="w-1/2 px-4 py-1 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] rounded-lg text-sm text-[rgb(var(--color-muted))] hover:bg-[rgb(var(--color-gray-bg))] transition font-medium cursor-pointer">
            <FaApple />
            <span>Apple</span>
          </button>
        </fieldset>
      </section>

      <p className="text-xs text-center text-[rgb(var(--color-muted))] mt-4">
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
