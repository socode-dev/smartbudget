import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import useTransactionStore from "../store/useTransactionStore";
import useNotificationStore from "../store/useNotificationStore";

// attach a realtime listener for a given subcollection
export const subcollectionListener = (userUID, subcollection, setter) => {
  const ref = collection(db, "users", userUID, subcollection);

  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setter(items);
    } else {
      setter([]);
    }
  });
};

// intialize user listener
export const initUserListener = (userUID) => {
  const { setTransactions, setBudgets, setGoals, setContributions } =
    useTransactionStore.getState();
  const { setNotifications } = useNotificationStore.getState();

  const unsubscribeTransactions = subcollectionListener(
    userUID,
    "transactions",
    setTransactions
  );

  const unsubscribeBudgets = subcollectionListener(
    userUID,
    "budgets",
    setBudgets
  );

  const unsubscribeGoals = subcollectionListener(userUID, "goals", setGoals);

  const unsubscribeContributions = subcollectionListener(
    userUID,
    "contributions",
    setContributions
  );

  const unsubscribeNotif = subcollectionListener(
    userUID,
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
