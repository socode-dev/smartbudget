import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layouts/Header";
import Sidebar from "../components/layouts/Sidebar";
import { useModalContext } from "../context/ModalContext";
import Modal from "../components/modals/Modal";
import { Toaster } from "react-hot-toast";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { modalState } = useModalContext();

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

  // Disable window scroll when modal is open
  useEffect(() => {
    if (
      modalState.expense ||
      modalState.budget ||
      modalState.goal ||
      modalState.contribution ||
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
      {/* Modals */}
      {modalState.expense && (
        <Modal
          label="expense"
          title="Add Expense"
          description="Track your spending in real time."
        />
      )}
      {modalState.budget && (
        <Modal
          label="budget"
          title="Set Budget"
          description="Set a financial target to track and achieve."
        />
      )}
      {modalState.goal && (
        <Modal
          label="goal"
          title="Set Goal"
          description="Set a financial target to track and achieve."
        />
      )}
      {modalState.contribution && (
        <Modal
          label="contribution"
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
