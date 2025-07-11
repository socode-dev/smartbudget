import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layouts/Header";
import Sidebar from "../components/layouts/Sidebar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleSidebarClose = () => setSidebarOpen(false);

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
    <div className="relative flex clex-col h-screen bg-[rgb(var(--color-bg))]">
      <Header onSidebarToggle={handleSidebarToggle} />
      <div className="grow flex">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        <main className="bg-[rgb(var(--color-bg))] grow pt-16 pl-5 md:pl-10 md:pr-0 transition-all duration-200">
          {/* pt-16 for header, md:pl-16 for sidebar */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
