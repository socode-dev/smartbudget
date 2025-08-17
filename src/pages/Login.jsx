import { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaMicrosoft } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuthFormContext } from "../context/AuthFormContext.jsx";
import { useAuthContext } from "../context/AuthContext";
import ScrollToTop from "../layout/ScrollToTop";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

const Login = () => {
  const {
    loginRegister: register,
    loginErrors: errors,
    loginIsSubmitting: isSubmitting,
  } = useAuthFormContext();
  const {
    onLogin,
    onLoginErr,
    onGoogleSignIn,
    onMicrosoftSignIn,
    microsoftErr,
    googleErr,
  } = useAuthContext();

  const [revealPassword, setRevealPassword] = useState(false);

  const togglePasswordReveal = () => setRevealPassword((prev) => !prev);

  const Icon = revealPassword ? FaEye : FaEyeSlash;

  return (
    <main className="w-full max-w-[500px] h-auto px-2 py-8 flex flex-col items-center mx-auto">
      <ScrollToTop />
      <h2 className="text-3xl md:text-4xl text-[rgb(var(--color-brand))] text-center font-medium tracking-wide">
        Welcome Back
      </h2>
      <p className="text-base text-[rgb(var(--color-muted))] text-center mt-4 mb-6">
        Please log in to access your SmartBudget
      </p>

      {/* Display authentication error if there is any */}
      {microsoftErr && (
        <p className="max-w-11/12 bg-red-50 px-4 py-2 rounded text-red-600 text-sm mb-2">
          {microsoftErr}
        </p>
      )}

      {googleErr && (
        <p className="max-w-11/12 bg-red-50 px-4 py-2 rounded text-red-600 text-sm mb-2">
          {googleErr}
        </p>
      )}

      {onLoginErr && (
        <p className="bg-red-50 px-4 py-2 rounded text-red-600 text-sm mb-2">
          {onLoginErr}
        </p>
      )}

      <form onSubmit={onLogin} className="w-11/12">
        <fieldset className=" w-full mb-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-base text-[rgb(var(--color-muted))] font-medium"
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
            <p className="text-[12px] text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </fieldset>
        <fieldset className="w-full mb-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="loginPassword"
              className="text-base text-[rgb(var(--color-muted))] font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={revealPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="w-full text-sm text-[rgb(var(--color-muted))] px-4 py-2 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
              />
              <Icon
                onClick={togglePasswordReveal}
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

        <div className="flex justify-between items-center mb-6">
          <fieldset className="w-fit flex items-center gap-1 text-sm">
            <input
              {...register("remember")}
              type="checkbox"
              id="remember-me"
              className="cursor-pointer"
            />
            <label htmlFor="remember-me" className="cursor-pointer">
              Remember me
            </label>
          </fieldset>

          <Link
            to="/forgot-password"
            className="text-sm text-[rgb(var(--color-brand))]"
          >
            Forget password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-base text-center font-medium py-1 rounded-lg shadow bg-[rgb(var(--color-brand))] text-white hover:scale-97 active:scale-103 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoadingSpinner size={25} /> : "Sign In"}
        </button>
      </form>

      <section className="w-11/12 flex flex-col gap-3 mt-6">
        <p className="text-sm text-center">OR CONTINUE WITH:</p>

        <fieldset className="w-full flex gap-4">
          {/* Google login */}
          <button
            onClick={onGoogleSignIn}
            className="w-1/2 px-4 py-2 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-base text-[rgb(var(--color-muted))] font-medium cursor-pointer"
          >
            <FaGoogle />
            <span>Google</span>
          </button>

          {/* Apple login */}
          <button
            onClick={onMicrosoftSignIn}
            className="w-1/2 px-4 py-2 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-base text-[rgb(var(--color-muted))] font-medium cursor-pointer"
          >
            <FaMicrosoft />
            <span>Microsoft</span>
          </button>
        </fieldset>
      </section>

      <p className="text-sm text-center text-[rgb(var(--color-muted))] mt-6">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-[rgb(var(--color-brand))] font-medium"
        >
          Sign up
        </Link>
      </p>
    </main>
  );
};

export default Login;
