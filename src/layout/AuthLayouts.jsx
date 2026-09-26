import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ResetLink from "../components/modals/ResetLink";
import ResetSuccessful from "../components/modals/ResetSuccessful";
import BrandMark from "../components/ui/BrandMark";

const AuthLayout = () => {
  return (
    <div className="grid h-screen bg-card font-sans text-foreground tracking-normal lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <Toaster />
      <ResetLink />
      <ResetSuccessful />
      
      <aside className="hidden border-r border-border bg-background p-12 lg:flex lg:flex-col lg:justify-between lg:gap-12">
        <BrandMark />
        
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            Personal Financial Intelligence
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            understand financial flow, plan with confidence and make informed decisions.
          </p>
        </div>

        <div />
      </aside>
      <div className="flex min-w-0 flex-col px-6 py-8 lg:p-12">
        <div className="mb-10 flex justify-center lg:hidden">
          <BrandMark />
        </div>
        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;
