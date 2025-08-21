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
const userColRef = (userUID, columnName) =>
  collection(db, "users", userUID, columnName);

// Add new document to user's subcollection
export const addDocument = async (userID, type, data) => {
  return await addDoc(userColRef(userID, type), {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const updateDocument = async (userID, type, itemUID, data) => {
  return await updateDoc(doc(db, "users", userID, type, itemUID), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (userUID, type, dataID) => {
  return await deleteDoc(doc(db, "users", userUID, type, dataID));
};

export const getAllDocuments = async (userUID, type) => {
  try {
    const q = query(userColRef(userUID, type), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.log(error);
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
  } finally {
    console.log("notification initiation completed");
  }
};

export const createNotification = async (
  uid,
  { subject, message, type, meta = {} }
) => {
  const ref = userColRef(uid, "notifications");

  try {
    await addDoc(ref, {
      subject,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
      meta,
    });
  } catch (err) {
    console.log(err);
  }
};
