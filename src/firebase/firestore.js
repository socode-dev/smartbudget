import {
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

// Helper to get colection reference
const userColRef = (userID, columnName) =>
  collection(db, "users", userID, columnName);

// Add new document to user's subcollection
export const addTransaction = async (userID, type, data) => {
  return await addDoc(userColRef(userID, type), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateTransaction = async (userID, type, itemID, data) => {
  return await updateDoc(doc(db, "users", userID, type, itemID), {
    ...data,
    updatedAt: new Date(),
  });
};

export const deleteTransaction = async (userUID, type, dataID) => {
  return await deleteDoc(doc(db, "users", userUID, type, dataID));
};

export const getAllTransactions = async (userID, type) => {
  try {
    const q = query(userColRef(userID, type), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.log(error);
  }
};
