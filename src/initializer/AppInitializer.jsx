import {
  initUserListener,
  subcollectionListener,
} from "../firebase/firestoreListener";
import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";
import useTransactionStore from "../store/useTransactionStore";
import useThresholdStore from "../store/useThresholdStore";
import useInsightsStore from "../store/useInsightsStore";
import useCurrencyStore from "../store/useCurrencyStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { runInsightPipeline } from "../api/insights";
import { isDemoUser, useDemoMode } from "../demo/useDemoMode";

const AppInitializer = () => {
  const isDemoMode = useDemoMode();
  
  const user = useAuthStore((state) => state.currentUser);
  const userId = user?.uid;
  
  const isDemoSession = isDemoMode || isDemoUser(user);
  
  const setCategories = useTransactionStore((state) => state.setCategories);

  const setThresholds = useThresholdStore((state) => state.setThresholds);
  
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

  // Generate insights
  useEffect(() => {
    if (isDemoSession) return;
    if (!userId) return;
    
    let cancelled = false;

    const runInsights = async () => {
      const selectedCurrency = useCurrencyStore.getState().selectedCurrency;
  
      try {
        await runInsightPipeline({ 
          userId, 
          currency: selectedCurrency, 
          isDemo: false
        });
      } catch (err) {
        if (cancelled) return;

        console.error(err)
        useInsightsStore.getState().setInsightError(err.message)
      }
  }

  runInsights();

    return () => {
      cancelled = true;
    }
  }, [isDemoSession, userId]);
  
  return null;
};


export default AppInitializer;
