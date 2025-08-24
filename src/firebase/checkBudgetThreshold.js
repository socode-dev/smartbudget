import {
  collection,
  where,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const createBudgetNotification = async (userUID, data) => {
  if (
    !userUID ||
    !data.type ||
    !data.category ||
    !data.key ||
    !data.threshold
  ) {
    console.warn("Missing required notification data:", { userUID, ...data });
    return;
  }

  const notifRef = collection(db, "users", userUID, "notifications");

  // Use type + category + category key as a unique combo
  const q = query(
    notifRef,
    where("type", "==", data.type),
    where("category", "==", data.category),
    where("key", "==", data.key),
    where("threshold", "==", data.threshold)
  );

  try {
    const existing = await getDocs(q);
    if (!existing.empty) return; // Notification already exist -> skip

    // console.log("Comencing notification creation!");
    await addDoc(notifRef, {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const checkBudgetThreshold = async (
  userUID,
  budgets,
  transactions,
  getAmountSpent,
  formattedAmount,
  budgetThreshold50,
  budgetThreshold80,
  budgetThreshold100
) => {
  // Expense budgets
  const expenseBudgets = budgets?.filter((budget) => budget.type === "expense");

  // Income budgets
  const incomeBudgets = budgets?.filter((budget) => budget.type === "income");

  // Generate notification for expense budgets thresholds
  for (const budget of expenseBudgets) {
    const { category, amount, categoryKey, date } = budget;
    const spent = getAmountSpent(categoryKey, date, transactions);

    if (!amount || amount <= 0) continue;

    const percentage = (spent / amount) * 100;

    // Fire notification if threshold condition is met
    if (percentage > budgetThreshold100) {
      await createBudgetNotification(userUID, {
        subject: `Over Budget in ${category}`,
        message: `You've exceeded your "${category}" by ${formattedAmount(
          Math.abs(spent - amount)
        )}. Your total in this category is now ${formattedAmount(
          spent
        )}, while the budget limit was ${formattedAmount(amount)}.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: `EXPENSE_OVER_${budgetThreshold100}`,
      });
    } else if (percentage >= budgetThreshold80) {
      await createBudgetNotification(userUID, {
        subject: `Budget reached: ${category}`,
        message: `Your "${category}" budget of ${formattedAmount(
          amount
        )} has now been completely used up. Any additional expenses in this category will push you over your set limit.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: `EXPENSE_${budgetThreshold80}`,
      });
    } else if (percentage >= budgetThreshold50) {
      await createBudgetNotification(userUID, {
        subject: `Budget Alert: ${budgetThreshold50}% of ${category} Used`,
        message: `You have spent ${budgetThreshold50}% of your "${category}" budget. That's ${formattedAmount(
          spent
        )} out of ${formattedAmount(
          amount
        )}. Keep an eye on this category to make sure you don't overshoot before the end of the period.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: `EXPENSE_${budgetThreshold50}`,
      });
    }
  }

  // Generate notification for income budgets thresholds
  for (const budget of incomeBudgets) {
    const { category, amount, categoryKey, date } = budget;
    const received = getAmountSpent(categoryKey, date, transactions);

    if (!amount || amount <= 0) continue;

    const percentage = (received / amount) * 100;

    // Fire notification if threshold condition is met
    if (percentage >= 110) {
      await createBudgetNotification(userUID, {
        subject: `Income Goal Surpassed: ${category}`,
        message: `Great jobs! You've exceeded your "${category}" income goal by ${formattedAmount(
          Math.abs(received - amount)
        )}, Your earnings in this category are now ${formattedAmount(
          received
        )}. Think about saving or reallocating the extra funds.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: "INCOME_OVER_100",
      });
    } else if (percentage >= 100) {
      await createBudgetNotification(userUID, {
        subject: `Income Goal Achieved: ${category}`,
        message: `Congrats! You've hit your "${category}" income goal of ${formattedAmount(
          amount
        )}. Excellent work toward your financial target.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: "INCOME_100",
      });
    } else if (percentage >= 80) {
      await createBudgetNotification(userUID, {
        subject: `Income Goal: 80% of ${category} Reached`,
        message: `You've earned 80% of your "${category}" income goal, reaching ${formattedAmount(
          received
        )} out of ${formattedAmount(
          amount
        )}. You're on track to meet this goal.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: "INCOME_80",
      });
    }
  }
};
