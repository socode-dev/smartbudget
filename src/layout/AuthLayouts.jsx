import { Outlet } from "react-router-dom";
import AuthHeader from "./AuthHeader";
import { Toaster } from "react-hot-toast";
import ResetLink from "../components/modals/ResetLink";
import ResetSuccessful from "../components/modals/ResetSuccessful";

const AuthLayout = () => {
  return (
    <div className="relative p-5 bg-[rgb(var(--color-bg-card))] flex flex-col gap-7 h-screen w-full">
      <Toaster />

      {/* Modals */}
      <ResetLink />
      <ResetSuccessful />

      {/* Main Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
