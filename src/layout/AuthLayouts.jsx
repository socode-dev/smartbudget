import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="p-5 bg-[rgb(var(--color-bg-card))]">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
