import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import useTransactionStore from "../store/useTransactionStore";
import useNotificationStore from "../store/useNotificationStore";

// attach a realtime listenerfor a given subcollection
export const subcollectionListener = (uid, subcollection, setter) => {
  const ref = collection(db, "users", uid, subcollection);

  return onSnapshot(ref, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setter(items);
  });
};

// intialize user listener
export const initUserListener = (uid) => {
  const { setTransactions, setBudgets, setGoals, setContributions } =
    useTransactionStore.getState();
  const { setNotifications } = useNotificationStore.getState();

  const unsubscribeTransactions = subcollectionListener(
    uid,
    "transactions",
    setTransactions
  );

  const unsubscribeBudgets = subcollectionListener(uid, "budgets", setBudgets);

  const unsubscribeGoals = subcollectionListener(uid, "goals", setGoals);

  const unsubscribeContributions = subcollectionListener(
    uid,
    "contributions",
    setContributions
  );

  const unsubscribeNotif = subcollectionListener(
    uid,
    "notifications",
    setNotifications
  );

  // Return unsubscribe cleanup for when user logs out
  return () => {
    unsubscribeTransactions();
    unsubscribeBudgets();
    unsubscribeGoals();
    unsubscribeContributions();
    unsubscribeNotif();
  };
};
