import { initUserListener } from "../firebase/firestoreListener";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import useThresholdStore from "../store/useThresholdStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AppInitializer = () => {
  const { currentUser } = useAuthContext();
  const setThresholds = useThresholdStore((state) => state.setThresholds);
  // console.log(authContext);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDocRef = doc(db, "users", currentUser.uid);

    const unsubscribeThresholds = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setThresholds(data.thresholds ?? null);
      }
    });

    const unsubscribe = initUserListener(currentUser?.uid);

    return () => {
      unsubscribe();
      unsubscribeThresholds();
    };
  }, [currentUser?.uid]);

  return null;
};

export default AppInitializer;
