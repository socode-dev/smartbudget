import { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle, FaApple } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import ScrollToTop from "../../layout/ScrollToTop";

const Login = () => {
  const { handleLogin } = useAuthContext();
  const [revealPassword, setRevealPassword] = useState(false);

  const togglePasswordReveal = () => setRevealPassword((prev) => !prev);

  const Icon = revealPassword ? FaEyeSlash : FaEye;

  return (
    <main className="w-full max-w-[500px] h-auto p-5 flex flex-col items-center mx-auto">
      <ScrollToTop />
      <h2 className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-center inline-block font-medium tracking-wide">
        Welcome Back
      </h2>
      <p className="text-sm text-[rgb(var(--color-muted))] text-center mt-2 mb-6">
        Please log in to access your SmartBudget
      </p>

      <form onSubmit={handleLogin} className="w-11/12">
        <fieldset className="flex flex-col gap-1 w-full mb-3">
          <label
            htmlFor="email"
            className="text-base text-[rgb(var(--color-muted))] font-medium"
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
        <fieldset className="flex flex-col gap-1 w-full mb-2">
          <label
            htmlFor="password"
            className="text-base text-[rgb(var(--color-muted))] font-medium"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={revealPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              className="w-full text-xs text-[rgb(var(--color-muted))] px-4 py-1 rounded-lg border-2 border-[rgb(var(--color-gray-border))] outline-none focus:border-[rgb(var(--color-brand))] transition"
            />
            <Icon
              onClick={togglePasswordReveal}
              className="text-xs text-gray-400 absolute top-[50%] -translate-y-[50%] right-2 cursor-pointer"
            />
          </div>
        </fieldset>

        <div className="flex justify-between items-center mb-3">
          <fieldset className="w-fit flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              name="remember-me"
              id="remember-me"
              className="cursor-pointer"
            />
            <label htmlFor="remember-me" className="cursor-pointer">
              Remember me
            </label>
          </fieldset>

          <a href="#" className="text-xs text-[rgb(var(--color-brand))]">
            Forget password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full text-sm font-medium text-center py-1 rounded-lg shadow bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-97 active:scale-103 transition cursor-pointer"
        >
          Sign In
        </button>
      </form>

      <section className="w-11/12 flex flex-col gap-3 mt-4">
        <p className="text-xs text-center">OR CONTINUE WITH:</p>

        <fieldset className="w-full flex gap-4">
          {/* Google login */}
          <button className="w-1/2 px-4 py-1 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-sm text-[rgb(var(--color-muted))] font-medium cursor-pointer">
            <FaGoogle />
            <span>Google</span>
          </button>

          {/* Apple login */}
          <button className="w-1/2 px-4 py-1 flex items-center justify-center gap-3 border-2 border-[rgb(var(--color-gray-border))] hover:bg-[rgb(var(--color-gray-bg))] transition rounded-lg text-sm text-[rgb(var(--color-muted))] font-medium cursor-pointer">
            <FaApple />
            <span>Apple</span>
          </button>
        </fieldset>
      </section>

      <p className="text-xs text-center text-[rgb(var(--color-muted))] mt-4">
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
