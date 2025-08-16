import { initUserListener } from "../firebase/firestoreListener";
import { useAuthContext } from "../context/AuthContext";
import { useEffect } from "react";

const AppInitializer = () => {
  const { currentUser } = useAuthContext();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = initUserListener(currentUser?.uid);

    return () => unsubscribe();
  }, [currentUser]);

  return null;
};

export default AppInitializer;
