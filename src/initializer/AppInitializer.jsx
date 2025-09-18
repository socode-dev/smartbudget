import { initUserListener } from "../firebase/firestoreListener";
import { useEffect } from "react";
import useTransactionStore from "../store/useTransactionStore";
import useThresholdStore from "../store/useThresholdStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useInsightsStore from "../store/useInsightsStore";
import useAuthStore from "../store/useAuthStore";
import { generateInsight } from "../ml/runInsights";
// import { detectAnomalies } from "../ml/anomalyDetection";

// const tx = [
//   { category: "Food", amount: 130, date: "2025-04-03" },
//   { category: "Food", amount: 124, date: "2025-05-12" },
//   { category: "Food", amount: 135, date: "2025-06-17" },
//   { category: "Food", amount: 100, date: "2025-07-27" },
//   { category: "Food", amount: 210, date: "2025-08-13" },
//   { category: "Food", amount: 2100, date: "2025-09-27" },
// ];

const AppInitializer = () => {
  const { currentUser: user } = useAuthStore();
  const setThresholds = useThresholdStore((state) => state.setThresholds);
  const { transactions, budgets, goals, contributions } = useTransactionStore();
  const { initInsights, generateRuleBasedInsights } = useInsightsStore();

  // console.log(detectAnomalies(tx));
  // Auth listener
  useEffect(() => {
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

    const unsubscribeUser = initUserListener(user?.uid);
    const unsubscribeInsights = initInsights(user?.uid);

    return () => {
      unsubscribeUser();
      unsubscribeInsights();
      unsubscribeThresholds();
    };
  }, [user?.uid]);

  // Generate rule-based insights
  useEffect(() => {
    if (!user) return;
    if (
      transactions?.length ||
      budgets?.length ||
      goals?.length ||
      contributions?.length
    ) {
      generateRuleBasedInsights(
        user.uid,
        transactions,
        budgets,
        goals,
        contributions
      );
    }
  }, [user?.uid, transactions, budgets, goals, contributions]);

  // Generate ML insights
  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;

    generateInsight(user?.uid, transactions);

    return () => {
      isMounted = false;
    };
  }, [user?.uid, transactions]);

  return null;
};

export default AppInitializer;
