import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layouts/Header";
import Sidebar from "../components/layouts/Sidebar";
import SignoutPrompt from "../components/modals/SignoutPrompt";
import toast, { Toaster } from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useTransactionStore from "../store/useTransactionStore";
import useNotificationStore from "../store/useNotificationStore";
import FormModal from "./FormModal";
import NotificationDialog from "../components/modals/NotificationDialog";
import { useNotificationContext } from "../context/NotificationContext";

const MainLayout = () => {
  const { loadTransactions } = useTransactionStore();
  const { loadNotifications } = useNotificationStore();
  const { currentUser, isUserEmailVerified, isSignoutPromptOpen } =
    useAuthContext();
  const { resendVerificationLink } = useNotificationContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

  // Load all transactions, budgets, goals on mount
  useEffect(() => {
    let isMounted = true;
    const loadTXN = () => {
      const labels = ["transactions", "budgets", "goals", "contributions"];
      labels.forEach(async (label) => {
        await loadTransactions(currentUser.uid, label);
      });
    };

    const loadNotifs = async () => await loadNotifications(currentUser.uid);

    loadTXN();
    loadNotifs();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Close sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 922 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  return (
    <div className="relative flex h-svh bg-[rgb(var(--color-bg))]">
      <Toaster />

      {/* Sign out confirmation */}
      {isSignoutPromptOpen && <SignoutPrompt />}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* Modals */}
      <FormModal sidebarOpen={sidebarOpen} />

      {/* Notification dialog */}
      <NotificationDialog />

      {/* Main Content */}
      <div className="flex flex-col grow">
        <Header onSidebarToggle={handleSidebarToggle} />
        <main className="bg-[rgb(var(--color-bg))] overflow-y-auto grow transition-all duration-200 lg:pt-0 pt-14">
          {/* pt-14 for mobile header, lg:pt-0 for desktop */}
          {/* Display under header if user email is not verified */}
          {!isUserEmailVerified && (
            <div className="w-full max-w-[500px] mx-auto mt-2 lg:mt-0 rounded-bl-lg rounded-br-lg px-6 py-3 shadow bg-[rgb(var(--color-bg-card))] border-t-2 border-[rgb(var(--color-brand-deep))] flex justify-between items-center gap-5">
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
