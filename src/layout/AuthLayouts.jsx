import { Outlet } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="p-5 bg-[rgb(var(--color-bg-card))] flex flex-col gap-7">
      <header className="flex justify-center gap-4 text-sm text-[rgb(var(--color-muted))] font-medium">
        <Link
          to="/login"
          className={clsx(
            location.pathname === "/login" &&
              "text-[rgb(var(--color-brand))] border-b-2 border-[rgb(var(--color-brand))] font-bold"
          )}
        >
          LOG IN
        </Link>
        <Link
          to="/signup"
          className={clsx(
            location.pathname === "/signup" &&
              "text-[rgb(var(--color-brand))] border-b-2 border-[rgb(var(--color-brand))] font-bold"
          )}
        >
          SIGN UP
        </Link>
      </header>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
