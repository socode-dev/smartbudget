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
import { generateInsight } from "../ml/runInsights";
import sampleTransactions from "../data/sampleTransactions";

const initializedAIInsightsForUsers = new Set();

const AppInitializer = () => {
  const user = useAuthStore((state) => state.currentUser);
  const uid = user?.uid;
  const setThresholds = useThresholdStore((state) => state.setThresholds);
  const transactions = useTransactionStore((state) => state.transactions);
  const setCategories = useTransactionStore((state) => state.setCategories);
  const budgets = useTransactionStore((state) => state.budgets);
  const goals = useTransactionStore((state) => state.goals);
  const contributions = useTransactionStore((state) => state.contributions);
  const addInsight = useInsightsStore((state => state.addInsight));
  const initInsights = useInsightsStore((state) => state.initInsights);
  const generateRuleBasedInsights = useInsightsStore(
    (state) => state.generateRuleBasedInsights,
  );
  const startAuthListener = useAuthStore((state) => state.startAuthListener);
  const stopAuthListener = useAuthStore((state) => state.stopAuthListener);

  // Auth listener
  useEffect(() => {
    startAuthListener();

    return () => stopAuthListener();
  }, [startAuthListener, stopAuthListener]);

  // Real-time listener for thresholds
  useEffect(() => {
    if (!uid) return;

    const userDocRef = doc(db, "users", uid);

    const unsubscribeThresholds = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setThresholds(data.thresholds ?? null);
      }
    });

    const unsubscribeUser = initUserListener(uid);
    const unsubscribeInsights = initInsights(uid);

    return () => {
      unsubscribeUser();
      unsubscribeInsights();
      unsubscribeThresholds();
    };
  }, [uid, initInsights, setThresholds]);

  // Listen to transaction categories
  useEffect(() => {
    if (!uid) return;

    const unsubscribe = subcollectionListener(uid, "categories", setCategories);

    return () => {
      unsubscribe();
    };
  }, [uid, setCategories]);

  // Generate rule-based insights
  useEffect(() => {
    if (!uid) return;

    if (
      transactions?.length ||
      budgets?.length ||
      goals?.length ||
      contributions?.length
    ) {
      generateRuleBasedInsights(
        uid,
        transactions,
        budgets,
        goals,
        contributions,
      );
    }
  }, [
    uid,
    transactions,
    budgets,
    goals,
    contributions,
    generateRuleBasedInsights,
  ]);

  // Generate AI insights
  useEffect(() => {
    if (!uid) return;
    if (!transactions?.length) return;
    if (initializedAIInsightsForUsers.has(uid)) return;

    let cancelled = false;

    const runMLInsights = async () => {
      try {
        const insights = await generateInsight(uid, sampleTransactions);
        if (cancelled) return;
        
        initializedAIInsightsForUsers.add(uid);
        
        for(const ins of insights) {
          addInsight(uid, ins);
        }
      } catch (err) {
        throw new Error(err);
      }
    };

    runMLInsights();

    return () => {
      cancelled = true;
    };
  }, [uid, addInsight]);
  
  return null;
};


export default AppInitializer;
