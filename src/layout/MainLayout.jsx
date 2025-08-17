import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layouts/Header";
import Sidebar from "../components/layouts/Sidebar";
import SignoutPrompt from "../components/modals/SignoutPrompt";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useTransactionStore from "../store/useTransactionStore";
import useNotificationStore from "../store/useNotificationStore";
import FormModal from "./FormModal";
import NotificationDialog from "../components/modals/NotificationDialog";

const MainLayout = () => {
  const { loadTransactions } = useTransactionStore();
  const { loadNotifications } = useNotificationStore();
  const { currentUser, isSignoutPromptOpen } = useAuthContext();
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
        <main className="bg-[rgb(var(--color-bg))] overflow-y-auto grow px-5 md:px-10 transition-all duration-200 lg:pt-0 pt-14">
          {/* pt-14 for mobile header, lg:pt-0 for desktop */}

          {/* Outlet for nested routes */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
