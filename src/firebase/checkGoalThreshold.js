import {
  collection,
  where,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  setDoc,
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

  const id = `${data.type}_${data.key}_${data.threshold}`
    .replace(/\s+/g, "_")
    .toLowerCase();
  const notifDocRef = doc(db, "users", userUID, "notifications", id);

  // Use type + name + category key and threshold as a unique combo
  // const q = query(
  //   notifRef,
  //   where("type", "==", data.type),
  //   where("name", "==", data.name),
  //   where("key", "==", data.key),
  //   where("threshold", "==", data.threshold)
  // );

  try {
    const existing = await getDoc(notifDocRef);
    if (existing.exists()) return; // Notification already exist -> skip

    // console.log("Comencing notification creation!");
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

export const checkGoalThreshold = async (
  userUID,
  goals,
  getAmountSaved,
  formattedAmount,
  goalThreshold50,
  goalThreshold80,
  goalThreshold100
) => {
  for (const goal of goals) {
    const { name, categoryKey, amount, date } = goal;
    const saved = getAmountSaved(categoryKey);

    if (!amount || amount <= 0) continue;

    const percentage = (saved / amount) * 100;

    // Fire notification if threshold condition is met
    if (percentage > goalThreshold100) {
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
        threshold: `GOAL_OVER_${goalThreshold100}`,
      });
    } else if (percentage >= goalThreshold80) {
      await createGoalNotification(userUID, {
        subject: `Goal Achieved: ${name}`,
        message: `Congratulations! 🎉 You've reached your savings goal of ${formattedAmount(
          amount
        )}. Time to celebrate your achievement.`,
        type: "goal",
        name,
        key: categoryKey,
        threshold: `GOAL_${goalThreshold80}`,
      });
    } else if (percentage >= goalThreshold50) {
      await createGoalNotification(userUID, {
        subject: `Goal Progress: ${goalThreshold50}% of ${name} Saved`,
        message: `Great job! You've saved ${goalThreshold50}% of your goal "${name}", which is ${formattedAmount(
          saved
        )} out of ${formattedAmount(amount)}. You're almost there, Keep it up.`,
        type: "goal",
        name,
        key: categoryKey,
        threshold: `GOAL_${goalThreshold50}`,
      });
    }
  }
};
