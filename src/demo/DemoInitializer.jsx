import { useEffect, useRef, useState } from "react";
import { CATEGORY_OPTIONS } from "../data/categoryData";
import useAuthStore from "../store/useAuthStore";
import useCurrencyStore from "../store/useCurrencyStore";
import useInsightsStore from "../store/useInsightsStore";
import useNotificationStore from "../store/useNotificationStore";
import useThresholdStore from "../store/useThresholdStore";
import useTransactionStore from "../store/useTransactionStore";
import {
  demoBudgets,
  demoContributions,
  demoGoals,
  demoInsights,
  demoInsightsHistory,
  demoNotifications,
  demoThresholds,
  demoTransactions,
  demoUser,
  demoUserName,
} from "./fixtures";

const DemoInitializer = ({ children }) => {
  const previousStateRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    previousStateRef.current = captureCurrentState();
    hydrateDemoState();
    setIsReady(true);

    return () => {
      restorePreviousState(previousStateRef.current);
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-[rgb(var(--color-bg))] text-[rgb(var(--color-muted))]">
        Loading demo...
      </div>
    );
  }

  return children;
};

const hydrateDemoState = () => {
  useAuthStore.setState({
    currentUser: demoUser,
    isUserEmailVerified: true,
    userLoggedIn: true,
    loading: false,
    userName: demoUserName,
  });

  useTransactionStore.setState({
    transactions: demoTransactions,
    budgets: demoBudgets,
    goals: demoGoals,
    contributions: demoContributions,
    categories: CATEGORY_OPTIONS,
    editTransaction: null,
  });

  useInsightsStore.setState({
    insights: demoInsights,
    insightsHistory: demoInsightsHistory,
    insightError: null,
    aiLimitReached: false,
  });

  useNotificationStore.setState({
    notifications: demoNotifications,
    selectedNotification: null,
    isOpen: false,
  });

  useThresholdStore.setState({ thresholds: demoThresholds });
  useCurrencyStore.setState({
    selectedCurrency: "USD",
    currencySymbol: "$",
    currencies: ["USD", "NGN", "EUR", "GBP"],
  });
};

const captureCurrentState = () => ({
  auth: {
    currentUser: useAuthStore.getState().currentUser,
    isUserEmailVerified: useAuthStore.getState().isUserEmailVerified,
    userLoggedIn: useAuthStore.getState().userLoggedIn,
    loading: useAuthStore.getState().loading,
    userName: useAuthStore.getState().userName,
  },
  finances: {
    transactions: useTransactionStore.getState().transactions,
    budgets: useTransactionStore.getState().budgets,
    goals: useTransactionStore.getState().goals,
    contributions: useTransactionStore.getState().contributions,
    categories: useTransactionStore.getState().categories,
    editTransaction: useTransactionStore.getState().editTransaction,
  },
  insights: {
    insights: useInsightsStore.getState().insights,
    insightsHistory: useInsightsStore.getState().insightsHistory,
    insightError: useInsightsStore.getState().insightError,
    aiLimitReached: useInsightsStore.getState().aiLimitReached,
  },
  notifications: {
    notifications: useNotificationStore.getState().notifications,
    selectedNotification: useNotificationStore.getState().selectedNotification,
    isOpen: useNotificationStore.getState().isOpen,
  },
  thresholds: {
    thresholds: useThresholdStore.getState().thresholds,
  },
  currency: {
    selectedCurrency: useCurrencyStore.getState().selectedCurrency,
    currencySymbol: useCurrencyStore.getState().currencySymbol,
    currencies: useCurrencyStore.getState().currencies,
  },
});

const restorePreviousState = (previousState) => {
  if (!previousState) return;

  useAuthStore.setState(previousState.auth);
  useTransactionStore.setState(previousState.finances);
  useInsightsStore.setState(previousState.insights);
  useNotificationStore.setState(previousState.notifications);
  useThresholdStore.setState(previousState.thresholds);
  useCurrencyStore.setState(previousState.currency);
};

export default DemoInitializer;
