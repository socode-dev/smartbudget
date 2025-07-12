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
    <div className="relative flex h-screen bg-[rgb(var(--color-bg))]">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
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
