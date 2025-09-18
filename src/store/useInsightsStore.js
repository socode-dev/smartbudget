import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { addDocument, getAllDocuments } from "../firebase/firestore";
import useCurrencyStore from "./useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";

const EXPIRY_MS = 2 * 24 * 60 * 60 * 1000;

const useInsightsStore = create(
  persist(
    (set, get) => ({
      insights: [],

      // Generation lock to prevent multiple simultaneous insight generation
      isGeneratingInsights: false,
      lastGenerationTime: 0,

      // Subscribe to realtime updates and clean expired ones
      initInsights: (uid) => {
        const colRef = collection(db, "users", uid, "insights");

        return onSnapshot(colRef, async (snapshot) => {
          const now = Date.now();
          const list = [];

          for (const document of snapshot.docs) {
            const data = document.data();
            const expired = data.expiresAt && data.expiresAt < now;

            if (expired) {
              // Delete from firestore
              await deleteDoc(doc(db, "users", uid, "insights", document.id));
              continue;
            }
            list.push({ id: document.id, ...data });
          }

          set({ insights: list });
        });
      },

      // Add new insight with expiry (persist all insights to Firestore)
      addInsight: async (uid, insight) => {
        // Lightweight dedupe: normalize message and look for similar insights in recent window
        const normalize = (s) =>
          (s || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();

        const dedupeWindowMs = 2 * 60 * 1000; // 2 minutes
        const now = Date.now();

        const existing = get().insights || [];
        const normalizedMessage = normalize(
          insight.message || insight.subject || ""
        );

        const isDuplicate = existing.some((ex) => {
          try {
            const exCreated =
              ex.createdAt && ex.createdAt.toMillis
                ? ex.createdAt.toMillis()
                : new Date(ex.createdAt).getTime();
            if (now - exCreated > dedupeWindowMs) return false;
            return (
              ex.type === insight.type &&
              normalize(ex.subject || ex.message || "") === normalizedMessage &&
              (ex.source || "") === (insight.source || "")
            );
          } catch (e) {
            return false;
          }
        });

        if (isDuplicate) {
          // Skip adding duplicate insight
          return;
        }

        const insightWithExpiry = {
          ...insight,
          createdAt: serverTimestamp(),
          expiresAt: Date.now() + EXPIRY_MS,
        };

        // Optimistic update: show locally immediately
        set((state) => ({ insights: [...state.insights, insightWithExpiry] }));

        // nothing to persist without a user id
        if (!uid) return;

        try {
          await addDocument(uid, "insights", insightWithExpiry);

          // Refetch all insights
          const docs = await getAllDocuments(uid, "insights");

          set({ insights: docs });
        } catch (err) {
          console.warn("Failed to persist insight to Firestore:", err);
        }
      },

      generateRuleBasedInsights: (
        uid,
        transactions,
        budgets,
        goals,
        contributions
      ) => {
        const state = get();
        const now = Date.now();
        const { selectedCurrency } = useCurrencyStore.getState();

        // Prevent multiple simultaneous generations
        if (state.isGeneratingInsights) return;

        // Debounce: prevent generation if called within 2 seconds of last generation
        if (now - state.lastGenerationTime < 2) return;

        // Set generation lock
        set({ isGeneratingInsights: true, lastGenerationTime: now });

        const insights = [];

        const thisMonth = new Date().getMonth();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const thisYear = new Date().getFullYear();
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
              type: "info",
              message: `You're spending ${Math.round(
                ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
              )}% more on ${transaction[0].category} compared to last month.`,
              actionType: "suggestion",
              actionText: `Set a spending limit on "${transaction[0].category}"`,
              severity: "medium",
              createdAt: new Date(),
              expiresAt: Date.now() + EXPIRY_MS,
              source: "rule",
              confidence: 0.6,
            });
          }
        });

        // Budget insight: notify unused near month end
        budgets.forEach((budget) => {
          // Total spent this month for budget category
          const spent = transactions
            .filter(
              (tx) =>
                tx.categoryKey === budget.categoryKey &&
                tx.type === "expense" &&
                new Date(tx.date).getMonth() === thisMonth &&
                new Date(tx.date).getFullYear() === thisYear
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

          // Avoid division by zero
          const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
          const today = new Date().getDate();

          // Unused budgets near end of month: low severity tip
          if (percent < 30 && today >= daysInMonth - 5) {
            insights.push({
              id: uuid(),
              type: "info",
              message: `You've only used ${Math.round(percent)}% of your "${
                budget.category
              }" budget this month.`,
              actionType: "tip",
              actionText: "Consider reallocating unused budget to savings.",
              severity: "low",
              createdAt: new Date(),
              expiresAt: Date.now() + EXPIRY_MS,
              source: "rule",
              confidence: 0.6,
            });
          }
        });

        // Goal progress forecast (rule-based), respect due dates and use contribution history
        goals.forEach((goal) => {
          // Total contributed to goal
          const contributionsForGoal = contributions
            .filter((c) => c.categoryKey === goal.categoryKey)
            .map((c) => ({ amount: c.amount, date: new Date(c.date) }))
            .sort((a, b) => a.date - b.date);

          const amountContributed = contributionsForGoal.reduce(
            (sum, c) => sum + c.amount,
            0
          );

          // Determine months elapsed since first contribution
          let monthsElapsed = 0;
          if (contributionsForGoal.length > 0) {
            const first = contributionsForGoal[0].date;
            monthsElapsed =
              (thisYear - first.getFullYear()) * 12 +
              (thisMonth - first.getMonth()) +
              1; // include current month
            if (monthsElapsed < 1) monthsElapsed = 1;
          } else {
            // No contributions yet: monthsElapsed = 0
            monthsElapsed = 0;
          }

          // Average weekly contribution based on history
          const avgWeeklyContribution =
            monthsElapsed > 0
              ? amountContributed / contributionsForGoal?.length
              : 0;

          // Months remaining until due date (if provided)
          let monthsRemaining = null;
          const due = new Date(goal.date);

          if (isNaN(due)) monthsRemaining = null;
          else {
            monthsRemaining =
              (due.getFullYear() - thisYear) * 12 +
              (due.getMonth() - thisMonth) +
              1;
            if (monthsRemaining < 0) monthsRemaining = 0;
          }

          // If there is a positive average contribution, estimate months to finish
          let monthsToGoal = Infinity;
          if (avgWeeklyContribution > 0) {
            monthsToGoal = Math.ceil(
              Math.max(0, goal.amount - amountContributed) /
                avgWeeklyContribution
            );
          }

          // If there's a due date, compute required monthly contribution to meet it
          let requiredWeekly = null;
          if (monthsRemaining !== null && monthsRemaining > 0) {
            const weeks = monthsRemaining * 4;
            requiredWeekly = Math.ceil(
              Math.max(0, goal.amount - amountContributed) / weeks
            );
          }

          if (
            monthsRemaining !== null &&
            monthsRemaining === 0 &&
            amountContributed < goal.amount
          ) {
            // Due date has passed
            insights.push({
              id: uuid(),
              type: "goal",
              message: `The due date for goal "${goal.name}" is ${goal.date} and the goal is not yet met. Consider revising the goal or increasing contributions.`,
              actionType: "suggestion",
              actionText: `Review goal settings`,
              severity: "high",
              createdAt: new Date(),
              expiresAt: Date.now() + EXPIRY_MS,
              source: "rule",
              confidence: 0.6,
            });
            return;
          }

          // If avg contributions already meet requiredWeekly, optimistic message
          if (
            requiredWeekly !== null &&
            avgWeeklyContribution >= requiredWeekly &&
            avgWeeklyContribution > 0
          ) {
            insights.push({
              id: uuid(),
              type: "info",
              message: `You're on track to meet your "${
                goal.name
              }" goal by ${new Date(
                goal.date
              ).toLocaleDateString()}. Keep it up!`,
              actionType: "tip",
              actionText: "No changes needed.",
              severity: "low",
              createdAt: new Date(),
              expiresAt: Date.now() + EXPIRY_MS,
              source: "rule",
              confidence: 0.6,
            });
            return;
          }

          // If we have a due date and current pace won't meet it, recommend requiredWeekly
          if (requiredWeekly !== null && monthsToGoal > monthsRemaining) {
            insights.push({
              id: uuid(),
              type: "prediction",
              message: `At your current pace, you'll not be able to reach your goal target for "${goal.name}".`,
              actionType: "tip",
              actionText: `Increase weekly contributions to ${formatAmount(
                requiredWeekly,
                selectedCurrency
              )} to meet the due date.`,
              severity:
                monthsToGoal <= (monthsRemaining || Infinity)
                  ? "low"
                  : "medium",
              createdAt: new Date(),
              expiresAt: Date.now() + EXPIRY_MS,
              source: "rule",
              confidence: 0.6,
            });
            return;
          }

          const twoDaysLater =
            new Date(goal.date).getTime() + 2 * 60 * 60 * 1000;

          // Suggest starting a monthly contribution if no contribution history after 2 days of adding goal
          console.log(Date.now() > twoDaysLater);
          if (Date.now() >= twoDaysLater && amountContributed === 0) {
            insights.push({
              id: uuid(),
              type: "info",
              message: `You haven't started contributing to "${
                goal.name
              }" yet. Consider setting up a monthly contribution to reach ${formatAmount(
                goal.amount,
                selectedCurrency
              )}.`,
              actionType: "suggestion",
              actionText: `Set a weekly or monthly contribution`,
              severity: "low",
              createdAt: new Date(),
              expiresAt: Date.now() + EXPIRY_MS,
              source: "rule",
              confidence: 0.6,
            });
          }
        });

        const { addInsight } = get();

        insights.forEach((insight) => {
          if (!insight.id) insight.id = uuid();
          // addInsight will optimistically add to local state and persist to Firestore
          addInsight(uid, insight);
        });
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
