import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import useTransactionStore from "../store/useTransactionStore";

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

  const unsubscribeTransactions = subcollectionListener(
    uid,
    "transactions",
    setTransactions
  );

  const unsubscribeBudgtes = subcollectionListener(uid, "budgets", setBudgets);

  const unsubscribeGoals = subcollectionListener(uid, "goals", setGoals);

  const unsubscribeContributions = subcollectionListener(
    uid,
    "contributions",
    setContributions
  );

  // Return unsubscribe cleanup for when user logs out
  return () => {
    unsubscribeTransactions();
    unsubscribeBudgtes();
    unsubscribeGoals();
    unsubscribeContributions();
  };
};
