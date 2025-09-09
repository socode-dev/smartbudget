import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { id } from "zod/v4/locales";

const useInsightsStore = create(
  persist(
    (set) => ({
      insights: [],

      generateInsights: (transactions, budgets, goals, contributions) => {
        const insights = [];

        const now = new Date();
        const thisMonth = now.getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = now.getFullYear();
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        // Group transactions by category & month
        const groupBy = (arr, fn) => {
          return arr.reduce((acc, item) => {
            const key = fn(item);
            acc[key] = acc[key] || [];
            acc[key].push(item);

            return acc;
          }, {});
        };

        // Spending trends
        const byCategory = groupBy(transactions, (tx) => tx.category);
        Object.entries(byCategory).forEach(([key, transaction]) => {
          const thisMonthSpent = transaction
            .filter(
              (tx) =>
                new Date(tx.date).getMonth() === thisMonth &&
                new Date(tx.date).getFullYear() === thisYear &&
                tx.type === "expense"
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

          const lastMonthSpent = transaction
            .filter(
              (tx) =>
                new Date(tx.date).getMonth() === lastMonth &&
                new Date(tx.date).getFullYear() === lastMonthYear &&
                tx.type === "expense"
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

          if (lastMonthSpent > 0 && thisMonthSpent > lastMonthSpent * 1.2) {
            insights.push({
              id: uuid(),
              type: "trend",
              message: `You're spending ${Math.round(
                ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
              )}% more on ${transaction[0].category} compared to last month.`,
              actionType: "suggestion",
              actionText: `Set a spending limit on "${transaction[0].category}"`,
              severity: "medium",
              date: new Date(),
            });
          }
        });

        // Unused budgets
        budgets.forEach((budget) => {
          const spent = transactions
            .filter(
              (tx) =>
                tx.categoryKey === budget.categoryKey &&
                tx.type === "expense" &&
                new Date(tx.date).getMonth() === thisMonth &&
                new Date(tx.date).getFullYear() === thisYear
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

          const percent = (spent / budget.amount) * 100;
          const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
          const today = now.getDate();

          if (percent < 30 && today >= daysInMonth - 5) {
            insights.push({
              id: uuid(),
              type: "budget",
              message: `You've only used ${Math.round(percent)}% of your "${
                budget.category
              }" budget this month.`,
              actionType: "tip",
              actionText: "Consider reallocating unused budget to savings.",
              severity: "low",
              date: new Date(),
            });
          }
        });

        /// Goal progress forecast (rule-based)
        goals.forEach((goal) => {
          const amountContributed = contributions
            .filter(
              (contribution) => contribution.categoryKey === goal.categoryKey
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

          const avgMonthlyContribution =
            amountContributed / (thisMonth + 1 || 1);

          if (avgMonthlyContribution > 0) {
            const monthsToGoal = Math.ceil(
              (goal.amount - amountContributed) / avgMonthlyContribution
            );

            if (monthsToGoal > 0) {
              insights.push({
                id: uuid(),
                type: "goal",
                message: `At your current pace, you will reach your "${goal.name}" goal in about ${monthsToGoal} months.`,
                actionType: "forecast",
                actionText:
                  "Increase monthly contributions by 10-20% to shorten this timeline",
                severity: "medium",
                date: new Date(),
              });
            }
          }
        });

        set({ insights });
      },

      clearInsightsStore: () => set({ insights: [] }),
    }),
    {
      name: "insights-storage",
      partialize: (state) => ({ insights: state.insights }),
    }
  )
);

export default useInsightsStore;
