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
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Helper to get colection reference
const userColRef = (userUID, collectionName) =>
  collection(db, "users", userUID, collectionName);

// Add new document to user's subcollection
export const addDocument = async (userID, collectionName, data) => {
  return await addDoc(userColRef(userID, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateDocument = async (userID, collectionName, itemUID, data) => {
  return await updateDoc(doc(db, "users", userID, collectionName, itemUID), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (userUID, collectionName, dataID) => {
  try {
    await deleteDoc(doc(db, "users", userUID, collectionName, dataID));
  } catch (err) {
    console.warn(err);
  }
};

export const getAllDocuments = async (userUID, collectionName) => {
  try {
    const q = query(
      userColRef(userUID, collectionName),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn(error);
  }
};

export const createWelcomeNotification = (userUID) => {
  const notifRef = userColRef(userUID, "notifications");

  const datas = [
    {
      subject: "Welcome to SmartBudget. Let's take charge of your finances!",
      message:
        "We're thrilled to welcome you to SmartBudget! 🎉 By opening your account, you've taken the first step toward smarter money management, clearer insights, and achieving your financial goals with confidence.",
      type: "info",
      read: false,
      createdAt: serverTimestamp(),
    },
    {
      subject: "Verify Your Email Address",
      message:
        "To complete your SmartBudget registration and unlock all features, please verify your email address. We've sent a verification link to the email you provided during sign-up. Kindly check your inbox(or spam). Once you click thee verification link, your account will be fully activated and ready to help you manage your finances smarter.",
      type: "System",
      read: false,
      createdAt: serverTimestamp(),
    },
  ];

  try {
    datas.forEach(async (data) => await addDoc(notifRef, data));
  } catch (err) {
    console.error(err);
  }
};

export const createNotification = async (uid, { subject, message, type }) => {
  const id = `${uid}_${type}_${message}`.replace(/\s+/g, "_").toLowerCase();
  const notifDocRef = doc(db, "users", uid, "notifications", id);

  try {
    await setDoc(notifDocRef, {
      subject,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.log(err);
  }
};

export const getUserThresholds = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    const data = userSnapshot.data();
    return data.thresholds || null;
  } else {
    return null;
  }
};
