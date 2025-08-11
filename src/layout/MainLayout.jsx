import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layouts/Header";
import Sidebar from "../components/layouts/Sidebar";
import { useModalContext } from "../context/ModalContext";
import Modal from "../components/modals/Modal";
import SignoutPrompt from "../components/modals/SignoutPrompt";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { modalState } = useModalContext();
  const { isSignoutPromptOpen } = useAuthContext();

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

  // Disable window scroll when modal is open
  useEffect(() => {
    if (
      modalState.transactions.open ||
      modalState.budgets.open ||
      modalState.goals.open ||
      modalState.contributions.open ||
      sidebarOpen
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => (document.body.style.overflow = "");
  }, [modalState, sidebarOpen]);

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

      {/* Modals */}
      {modalState.transactions.open && (
        <Modal
          label="transactions"
          mode={modalState.transactions.mode}
          title={
            modalState.transactions.mode === "add"
              ? "Add Transaction"
              : "Edit Transaction"
          }
          description="Track your spending in real time."
        />
      )}
      {modalState.budgets.open && (
        <Modal
          label="budgets"
          mode={modalState.budgets.mode}
          title={
            modalState.budgets.mode === "add" ? "Set Budget" : "Edit Budget"
          }
          description="Set a financial target to track and achieve."
        />
      )}
      {modalState.goals.open && (
        <Modal
          label="goals"
          mode={modalState.goals.mode}
          title={modalState.goals.mode === "add" ? "Set Goal" : "Edit Goal"}
          description="Set a financial target to track and achieve."
        />
      )}
      {modalState.contributions.open && (
        <Modal
          label="contributions"
          mode={modalState.contributions.mode}
          title="Add Contribution"
          description="Make progress towards your savings goal."
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content */}
      <div className="flex flex-col grow">
        <Header onSidebarToggle={handleSidebarToggle} />
        <main className="bg-[rgb(var(--color-bg))] overflow-y-auto grow px-5 md:px-10 transition-all duration-200 lg:pt-0 pt-14">
          {/* pt-14 for mobile header, lg:pt-0 for desktop */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
