import {
  initUserListener,
  subcollectionListener,
} from "../firebase/firestoreListener";
import { useEffect } from "react";
import useTransactionStore from "../store/useTransactionStore";
import useThresholdStore from "../store/useThresholdStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import useInsightsStore from "../store/useInsightsStore";
import useAuthStore from "../store/useAuthStore";
import { generateInsight } from "../insight_engines/runInsights";
import { isDemoUser, useDemoMode } from "../demo/useDemoMode";

const AppInitializer = () => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const isDemoSession = isDemoMode || isDemoUser(user);
  const userId = user?.uid;
  const setThresholds = useThresholdStore((state) => state.setThresholds);
  const transactions = useTransactionStore((state) => state.transactions);
  const setCategories = useTransactionStore((state) => state.setCategories);
  const budgets = useTransactionStore((state) => state.budgets);
  const initInsights = useInsightsStore((state) => state.initInsights);
  
  const startAuthListener = useAuthStore((state) => state.startAuthListener);
  const stopAuthListener = useAuthStore((state) => state.stopAuthListener);

  // Auth listener
  useEffect(() => {
    if (isDemoSession) return;

    startAuthListener();

    return () => stopAuthListener();
  }, [isDemoSession, startAuthListener, stopAuthListener]);

  // Real-time listener for thresholds
  useEffect(() => {
    if (isDemoSession) return;
    if (!userId) return;

    const userDocRef = doc(db, "users", userId);

    const unsubscribeThresholds = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setThresholds(data.thresholds ?? null);
      }
    });

    const unsubscribeUser = initUserListener(userId);
    const unsubscribeInsights = initInsights(userId);

    return () => {
      unsubscribeUser();
      unsubscribeInsights();
      unsubscribeThresholds();
    };
  }, [isDemoSession, userId, initInsights, setThresholds]);

  // Listen to transaction categories
  useEffect(() => {
    if (isDemoSession) return;
    if (!userId) return;

    const unsubscribe = subcollectionListener(userId, "categories", setCategories);

    return () => {
      unsubscribe();
    };
  }, [isDemoSession, userId, setCategories]);

  // Generate AI insights
  useEffect(() => {
    if (isDemoSession) return;
    if (!userId) return;
    if (!(transactions ?? []).length) return;

    let cancelled = false;

    const runInsights = async () => {
      try {
        await generateInsight({userId, transactions: transactions ?? [], budgets: budgets ?? []});
      } catch (err) {
        if (cancelled) return;
        console.log(err);
        useInsightsStore.getState().setInsightError(err.message);
      }
    };

    runInsights();

    return () => {
      cancelled = true;
    };
  }, [isDemoSession, userId, transactions?.length, budgets?.length]);
  
  return null;
};


export default AppInitializer;
