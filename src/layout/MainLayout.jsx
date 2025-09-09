import { Outlet } from "react-router-dom";
import Header from "../components/layouts/Header";
import Sidebar from "../components/layouts/Sidebar";
import SignoutPrompt from "../components/modals/SignoutPrompt";
import { Toaster } from "react-hot-toast";
import { useNotificationContext } from "../context/NotificationContext";
import FormModal from "../components/modals/FormModal";
import NotificationDialog from "../components/modals/NotificationDialog";
import Preferences from "../components/modals/Preferences";
import LazyWrapper from "../routes/LazyWrapper";
import HeaderSkeleton from "../components/skeletons/HeaderSkeleton";
import SidebarSkeleton from "../components/skeletons/SidebarSkeleton";
import useAuthStore from "../store/useAuthStore";

const MainLayout = () => {
  const { isUserEmailVerified } = useAuthStore();
  const { resendVerificationLink } = useNotificationContext();

  return (
    <div className="relative flex h-svh bg-[rgb(var(--color-bg))]">
      <Toaster />

      {/* Sign out confirmation dialog */}
      <SignoutPrompt />

      {/* Form Modal */}
      <FormModal />

      {/* Notification dialog */}
      <NotificationDialog />

      {/* Preferences dialog */}
      <Preferences />

      {/* Sidebar */}
      <LazyWrapper loadingFallback={SidebarSkeleton}>
        <Sidebar />
      </LazyWrapper>

      {/* Main Content */}
      <div className="flex flex-col grow">
        <LazyWrapper loadingFallback={<HeaderSkeleton />}>
          <Header />
        </LazyWrapper>
        <main className="bg-[rgb(var(--color-bg))] overflow-y-auto grow transition-all duration-200 lg:pt-0 pt-14">
          {/* pt-14 for mobile header, lg:pt-0 for desktop */}
          {/* Display under header if user email is not verified */}
          {!isUserEmailVerified && (
            <div className="w-full mx-auto mt-2 lg:mt-0 px-6 py-3 shadow bg-[rgb(var(--color-bg-card))] border-t-2 border-[rgb(var(--color-brand-deep))] flex justify-between items-center gap-5">
              <p className="text-[rgb(var(--color-muted))] text-sm">
                Your account is not verified. Resend link to verify.
              </p>

              <button
                onClick={resendVerificationLink}
                className="px-4 py-2 bg-[rgb(var(--color-brand-deep))] hover:bg-[rgb(var(--color-brand))] text-white rounded-lg shadow-2xl cursor-pointer font-medium"
              >
                Resend
              </button>
            </div>
          )}

          {/* Outlet for nested routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
