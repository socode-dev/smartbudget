import { initUserListener } from "../firebase/firestoreListener";
// import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import useTransactionStore from "../store/useTransactionStore";
import useThresholdStore from "../store/useThresholdStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useInsightsStore from "../store/useInsightsStore";
import useAuthStore from "../store/useAuthStore";

const AppInitializer = () => {
  const { currentUser: user } = useAuthStore();
  const setThresholds = useThresholdStore((state) => state.setThresholds);
  const { transactions, budgets, goals, contributions } = useTransactionStore();
  const generateInsights = useInsightsStore((state) => state.generateInsights);

  // Auth listener
  useEffect(() => {
    // Start the firebase auth listener once on app mount. We must not wait
    // for `user` to exist because that creates a circular dependency: the
    // listener is responsible for setting `currentUser` on load. If we
    // only start the listener when `user` exists, the listener is never
    // registered and the app appears to log the user out on refresh.
    const { startAuthListener, stopAuthListener } = useAuthStore.getState();
    startAuthListener();

    return () => stopAuthListener();
  }, [user?.uid]);

  // Real-time listener for thresholds
  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribeThresholds = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setThresholds(data.thresholds ?? null);
      }
    });

    const unsubscribe = initUserListener(user?.uid);

    return () => {
      unsubscribe();
      unsubscribeThresholds();
    };
  }, [user?.uid]);

  useEffect(() => {
    if (
      transactions.length ||
      budgets.length ||
      goals.length ||
      contributions
    ) {
      generateInsights(transactions, budgets, goals, contributions);
    }
  }, [transactions, budgets, goals, contributions]);

  return null;
};

export default AppInitializer;
