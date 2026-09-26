import { lazy } from "react";
import OverviewSkeleton from "../components/skeletons/overview/OverviewSkeleton";
import TransactionSkeleton from "../components/skeletons/TransactionSkeleton";
import BudgetSkeleton from "../components/skeletons/BudgetSkeleton";
import GoalSkeleton from "../components/skeletons/GoalSkeleton";
import ReportSkeleton from "../components/skeletons/ReportSkeleton";
import InsightSkeleton from "../components/skeletons/InsightSkeleton";
import ErrorFallback from "./ErrorFallback"; 

export const dashboardPages = [
  {
    Component: lazy(() => import("../pages/Overview")),
    fallback: <OverviewSkeleton />,
  },
  {
    path: "transactions",
    Component: lazy(() => import("../pages/Transactions")),
    fallback: <TransactionSkeleton />,
  },
  {
    path: "budgets",
    Component: lazy(() => import("../pages/Budgets")),
    fallback: <BudgetSkeleton />,
  },
  {
    path: "goals",
    Component: lazy(() => import("../pages/Goals")),
    fallback: <GoalSkeleton />,
  },
  {
    path: "insights",
    Component: lazy(() => import("../pages/Insights")),
    fallback: <InsightSkeleton />,
  },
  {
    path: "reports",
    Component: lazy(() => import("../pages/Reports")),
    fallback: <ReportSkeleton />,
  },
  {
    path: "settings",
    Component: lazy(() => import("../pages/Settings")),
    fallback: (
      <div className="px-6 py-8 text-sm text-muted-foreground" role="status">
        Loading settings...
      </div>
    ),
  },
  {
    path: "notifications",
    Component: lazy(() => import("../pages/Notifications")),
    fallback: (
      <div className="px-6 py-8 text-sm text-muted-foreground" role="status">
        Loading notifications...
      </div>
    ),
  },
];
