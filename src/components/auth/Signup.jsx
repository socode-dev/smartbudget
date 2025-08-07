import { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import ScrollToTop from "../../layout/ScrollToTop";

const Signup = () => {
  const { handleSignup } = useAuthContext();
  const [revealPassword, setRevealPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordReveal = (type) =>
    setRevealPassword((prev) => ({ ...prev, [type]: !prev[type] }));

  const PasswordIcon = revealPassword.password ? FaEyeSlash : FaEye;
  const ConfirmPasswordIcon = revealPassword.confirmPassword
    ? FaEyeSlash
    : FaEye;

  return (
    <main className="w-full max-w-[600px] h-auto py-4 flex flex-col items-center mx-auto">
      <ScrollToTop />
      <h2 className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center inline-block font-medium tracking-wide">
        Create an Account
      </h2>
      <p className="text-sm text-[rgb(var(--color-muted))] text-center mt-2 mb-6">
        Let's get you set up with SmartBudget
      </p>

      <form onSubmit={handleSignup} className="w-11/12 grid grid-cols-2 gap-2">
        {/* First Name field */}
        <fieldset className="flex flex-col gap-1">
          <label
            htmlFor="firstName"
            className="text-sm text-[rgb(var(--color-muted))] font-medium"
          >
            First Name
          </label>
          <input
            type="firstName"
            id="firstName"
            placeholder="Enter your first name"
            className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
          />
        </fieldset>

        {/* Last Name field */}
        <fieldset className="flex flex-col gap-1">
          <label
            htmlFor="lastName"
            className="text-sm text-[rgb(var(--color-muted))] font-medium"
          >
            Last Name
          </label>
          <input
            type="lastName"
            id="lastName"
            placeholder="Enter your last name"
            className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
          />
        </fieldset>

        {/* Email field */}
        <fieldset className="flex flex-col gap-1 col-span-full">
          <label
            htmlFor="email"
            className="text-sm text-[rgb(var(--color-muted))] font-medium"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
          />
        </fieldset>

        {/* Password fields */}
        <fieldset className="flex flex-col gap-1 col-span-full">
          <label
            htmlFor="password"
            className="text-sm text-[rgb(var(--color-muted))] font-medium"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={revealPassword.password ? "text" : "password"}
              id="password"
              placeholder="Enter password"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
            <PasswordIcon
              onClick={() => togglePasswordReveal("password")}
              className="text-xs text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
            />
          </div>
        </fieldset>

        {/* Confirm Password field */}
        <fieldset className="flex flex-col gap-1 col-span-full">
          <label
            htmlFor="confirm-password"
            className="text-sm text-[rgb(var(--color-muted))] font-medium"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={revealPassword.confirmPassword ? "text" : "password"}
              id="confirm-password"
              placeholder="Confirm password"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
            <ConfirmPasswordIcon
              onClick={() => togglePasswordReveal("confirmPassword")}
              className="text-xs text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
            />
          </div>
        </fieldset>

        {/* Submit Button */}
        <button
          type="submit"
          className="col-span-full mt-3 text-sm font-medium text-center py-1 rounded-lg shadow bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-97
          active:scale-103 transition cursor-pointer"
        >
          Create Account
        </button>
      </form>

      <section className="w-11/12 flex flex-col gap-3 mt-4">
        <p className="text-xs text-center">OR SIGN UP WITH:</p>

        <fieldset className="w-full flex gap-4">
          {/* Google login */}
          <button className="w-1/2 px-4 py-1 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-sm text-[rgb(var(--color-muted))] font-medium cursor-pointer">
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
