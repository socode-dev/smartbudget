import { serverTimestamp, getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useCurrencyStore from "../store/useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";
import { getAmountSpent } from "../utils/getAmountSpent";

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

  const id = `${data.type}_${data.key}_${data.threshold}`
    .replace(/\s+/g, "_")
    .toLowerCase();
  const notifDocRef = doc(db, "users", userUID, "notifications", id);

  try {
    const existing = await getDoc(notifDocRef);
    if (existing.exists()) {
      return;
    } // Notification already exist -> skip

    await setDoc(notifDocRef, {
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
  budgetThreshold50,
  budgetThreshold80,
  budgetThreshold100
) => {
  const { selectedCurrency } = useCurrencyStore.getState();

  // Expense budgets
  const expenseBudgets = budgets?.filter((budget) => budget.type === "expense");

  // Income budgets
  const incomeBudgets = budgets?.filter((budget) => budget.type === "income");

  // Generate notification for expense budgets thresholds
  for (const budget of expenseBudgets) {
    const { category, amount, categoryKey, date } = budget;
    const spent = getAmountSpent(categoryKey, date, "expense");

    if (!amount || amount <= 0) continue;

    const percentage = (spent / amount) * 100;

    // Fire notification if threshold condition is met
    if (percentage > budgetThreshold100) {
      await createBudgetNotification(userUID, {
        subject: `Over Budget in ${category}`,
        message: `You've exceeded your "${category}" by ${formatAmount(
          Math.abs(spent - amount),
          selectedCurrency
        )}. Your total in this category is now ${formatAmount(
          spent,
          selectedCurrency
        )}, while the budget limit was ${formatAmount(
          amount,
          selectedCurrency
        )}.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: `EXPENSE_OVER_${budgetThreshold100}`,
      });
    } else if (percentage >= budgetThreshold80) {
      await createBudgetNotification(userUID, {
        subject: `Budget reached: ${category}`,
        message: `Your "${category}" budget of ${formatAmount(
          amount,
          selectedCurrency
        )} has now been completely used up. Any additional expenses in this category will push you over your set limit.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: `EXPENSE_${budgetThreshold80}`,
      });
    } else if (percentage >= budgetThreshold50) {
      await createBudgetNotification(userUID, {
        subject: `Budget Alert: ${budgetThreshold50}% of ${category} Used`,
        message: `You have spent ${budgetThreshold50}% of your "${category}" budget. That's ${formatAmount(
          spent,
          selectedCurrency
        )} out of ${formatAmount(
          amount,
          selectedCurrency
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
    const received = getAmountSpent(categoryKey, date, "income");

    if (!amount || amount <= 0) continue;

    const percentage = (received / amount) * 100;

    // Fire notification if threshold condition is met
    if (percentage >= 110) {
      await createBudgetNotification(userUID, {
        subject: `Income Goal Surpassed: ${category}`,
        message: `Great jobs! You've exceeded your "${category}" income goal by ${formatAmount(
          Math.abs(received - amount),
          selectedCurrency
        )}, Your earnings in this category are now ${formatAmount(
          received,
          selectedCurrency
        )}. Think about saving or reallocating the extra funds.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: "INCOME_OVER_100",
      });
    } else if (percentage >= 100) {
      await createBudgetNotification(userUID, {
        subject: `Income Goal Achieved: ${category}`,
        message: `Congrats! You've hit your "${category}" income goal of ${formatAmount(
          amount,
          selectedCurrency
        )}. Excellent work toward your financial target.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: "INCOME_100",
      });
    } else if (percentage >= 80) {
      await createBudgetNotification(userUID, {
        subject: `Income Goal: 80% of ${category} Reached`,
        message: `You've earned 80% of your "${category}" income goal, reaching ${formatAmount(
          received,
          selectedCurrency
        )} out of ${formatAmount(
          amount,
          selectedCurrency
        )}. You're on track to meet this goal.`,
        type: "budget",
        category,
        key: categoryKey,
        threshold: "INCOME_80",
      });
    }
  }
};
