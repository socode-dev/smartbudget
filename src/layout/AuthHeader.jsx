import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const AuthHeader = () => {
  const location = useLocation();

  return (
    <header className="fixed left-5 right-5 z-50 max-w-[550px] flex justify-between items-center gap-4 bg-[rgb(var(--color-bg))] shadow px-3 py-2 mx-auto rounded-lg">
      <h1 className="text-base text-white font-bold bg-[rgb(var(--color-brand))] px-4 py-1 rounded">
        SB
      </h1>

      <nav className="flex gap-4 text-xs font-medium text-[rgb(var(--color-muted))] ">
        <Link
          to="/login"
          className={clsx(
            "px-2 py-1",
            location.pathname === "/login" &&
              "text-[rgb(var(--color-brand))] border-2 border-[rgb(var(--color-brand))] rounded"
          )}
        >
          LOG IN
        </Link>
        <Link
          to="/signup"
          className={clsx(
            "px-2 py-1 ",
            location.pathname === "/signup" &&
              "text-[rgb(var(--color-brand))] border-2 border-[rgb(var(--color-brand))] rounded"
          )}
        >
          SIGN UP
        </Link>
      </nav>
    </header>
  );
};

export default AuthHeader;
