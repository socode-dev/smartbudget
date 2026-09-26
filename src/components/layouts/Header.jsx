import HeaderActions from "./HeaderActions";
import { FiSidebar, FiMenu } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import Button from "../ui/Button";
import Tooltip from "../ui/Tooltip";
import { useMainContext } from "../../context/MainContext";
import { useDemoMode } from "../../demo/useDemoMode";

const pageTitles = {
  "/": "Overview",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/goals": "Goals",
  "/insights": "Smart Insights",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

const Header = ({ collapsed, onToggleSidebar }) => {
  const { pathname } = useLocation();
  const isDemoMode = useDemoMode();
  const path = isDemoMode ? pathname.replace(/^\/demo/, "") || "/" : pathname;
  const { handleSidebarOpen, isSidebarOpen } = useMainContext();

  return (
    <header className="relative z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Tooltip content="Open navigation" side="bottom">
          <Button
            variant="outline"
            className="size-11 min-h-11 shrink-0 p-0! lg:hidden"
            onClick={handleSidebarOpen}
            aria-controls="mobile-sidebar"
            aria-expanded={isSidebarOpen}
            aria-label="Open navigation"
          >
            <FiSidebar size={18} aria-hidden="true" />
          </Button>
        </Tooltip>

        <Tooltip
          content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          side="bottom"
        >
          <Button
            variant="outline"
            className="hidden size-11 min-h-11 shrink-0 p-0! lg:inline-flex max-lg:hidden"
            onClick={onToggleSidebar}
            aria-controls="app-sidebar"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <FiSidebar size={18} aria-hidden="true" />
          </Button>
        </Tooltip>

        <div className="min-w-0 leading-tight">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Vydra
          </p>
          <p
            className="truncate font-display text-sm font-semibold"
            title={pageTitles[path] || "Dashboard"}
          >
            {pageTitles[path] || "Dashboard"}
          </p>
        </div>
      </div>

      <HeaderActions />
    </header>
  );
};
export default Header;
