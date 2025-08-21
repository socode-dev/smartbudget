import {
  collection,
  where,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

const createGoalNotification = async (userUID, data) => {
  if (
    !userUID ||
    !data?.type ||
    !data?.name ||
    !data?.key ||
    !data?.threshold
  ) {
    console.warn("Missing required notification data:", { userUID, ...data });
    return;
  }

  const notifRef = collection(db, "users", userUID, "notifications");

  // Use type + name + category key and threshold as a unique combo
  const q = query(
    notifRef,
    where("type", "==", data.type),
    where("name", "==", data.name),
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

export const checkGoalThreshold = async (
  userUID,
  goals,
  getAmountSaved,
  formattedAmount
) => {
  for (const goal of goals) {
    const { name, categoryKey, amount, date } = goal;
    const saved = getAmountSaved(categoryKey);

    if (!amount || amount <= 0) continue;

    const percentage = (saved / amount) * 100;

    // Fire notification if threshold condition is met
    if (percentage > 110) {
      await createGoalNotification(userUID, {
        subject: `Goal Surpassed: ${name}`,
        message: `Fantastic! You've exceeded your "${name}" goal by ${formattedAmount(
          saved - amount
        )}. Your total savings are now ${formattedAmount(
          saved
        )}. Consider setting a new goal or reallocating the extra funds.`,
        type: "goal",
        name,
        key: categoryKey,
        threshold: "GOAL_OVER_100",
      });
    } else if (percentage >= 100) {
      await createGoalNotification(userUID, {
        subject: `Goal Achieved: ${name}`,
        message: `Congratulations! 🎉 You've reached your savings goal of ${formattedAmount(
          amount
        )}. Time to celebrate your achievement.`,
        type: "goal",
        name,
        key: categoryKey,
        threshold: "GOAL_100",
      });
    } else if (percentage >= 80) {
      await createGoalNotification(userUID, {
        subject: `Goal Progress: 80% of ${name} Saved`,
        message: `Great job! You've saved 80% of your goal "${name}", which is ${formattedAmount(
          saved
        )} out of ${formattedAmount(amount)}. You're almost there, Keep it up.`,
        type: "goal",
        name,
        key: categoryKey,
        threshold: "GOAL_80",
      });
    }
  }
};
