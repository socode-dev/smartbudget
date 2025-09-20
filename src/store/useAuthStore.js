import { create } from "zustand";
import { auth, db } from "../firebase/firebase";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignUserWithEmailAndPassword,
  doSignInWithMicrosoft,
} from "../firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { getAuthErrorMessage } from "../utils/authErrorrs";
import { getUserName } from "../utils/getUserName";
import {
  createWelcomeNotification,
  createNotification,
  addDocument,
} from "../firebase/firestore";

import useThresholdStore from "./useThresholdStore";
import useTransactionStore from "./useTransactionStore";
import useNotificationStore from "./useNotificationStore";
import useCurrencyStore from "./useCurrencyStore";
import useInsightsStore from "./useInsightsStore";
import toast from "react-hot-toast";

const emailVerificationEmail = {
  subject: "Verify Your Email Address",
  message:
    'To complete your SmartBudget registration and unlock all features, please verify your email address. To receive a new verification link, please click on the "Resend" bottun on the top of the page. A new verification link will be sent to the email you provided during sign-up. Kindly check your inbox(or spam). Once you click the verification link, your account will be fully activated and ready to help you manage your finances smarter.',
  type: "System",
};

export const useAuthStore = create((set, get) => ({
  // state
  currentUser: null,
  isUserEmailVerified: false,
  userName: { initials: "", fullName: "" },
  userLoggedIn: false,
  loading: true,
  onLoginErr: null,
  onSignupErr: null,
  googleErr: null,
  microsoftErr: null,
  resetLinkModalOpen: false,
  openResetSuccessfulModal: false,

  // internal
  _authUnsubscribe: null,

  // setters
  setCurrentUser: (user) => set({ currentUser: user }),
  setUserName: (userName) => set({ userName }),
  setUserLoggedIn: (value) => set({ userLoggedIn: value }),
  setLoading: (value) => set({ loading: value }),
  setOnLoginErr: (value) => set({ onLoginErr: value }),
  setOnSignupErr: (value) => set({ onSignupErr: value }),
  setGoogleErr: (value) => set({ googleErr: value }),
  setMicrosoftErr: (value) => set({ microsoftErr: value }),
  setResetLinkModalOpen: (value) => set({ resetLinkModalOpen: value }),
  setOpenResetSuccessfulModal: (value) =>
    set({ openResetSuccessfulModal: value }),

  // start the firebase auth listener (call once during app init)
  startAuthListener: () => {
    // avoid subscribing twice
    if (get()._authUnsubscribe) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({
          currentUser: { uid: user.uid, email: user.email },
        });
        const userDocRef = doc(db, "users", user?.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          const profile = data.profile ?? {};

          set((state) => ({
            currentUser: { ...state.currentUser, ...profile },
          }));

          const { userInitials, userFirstName, userLastName } =
            getUserName(data);
          useThresholdStore.getState().setThresholds(data.thresholds ?? null);
          set({
            userName: {
              initials: userInitials,
              fullName: `${userFirstName} ${userLastName}`,
            },
          });
        } else {
          set({ currentUser: { uid: user.uid } });
        }

        set({ userLoggedIn: true, isUserEmailVerified: user.emailVerified });
      } else {
        // sign out: clear local stores + localStorage
        const storageItems = [
          "finances-storage",
          "notifications-storage",
          "insights-storage",
          "thresholds-storage",
          "currency-storage",
        ];
        set({ currentUser: null, userLoggedIn: false });

        storageItems.forEach((item) => localStorage.removeItem(item));

        // clear zustand stores via getState
        useTransactionStore.getState().clearFinanceStore?.();
        useInsightsStore.getState().clearInsightsStore?.();
        useNotificationStore.getState().clearNotificationStore?.();
        useThresholdStore.getState().clearThresholdStore?.();
        useCurrencyStore.getState().clearCurrencyStore?.();
      }

      set({ loading: false });
    });

    set({ _authUnsubscribe: unsubscribe });
  },

  stopAuthListener: () => {
    const unsub = get()._authUnsubscribe;
    if (unsub) {
      unsub();
      set({ _authUnsubscribe: null });
    }
  },

  // auth actions - these accept plain data. If your forms use
  // wrapper handlers, call those wrappers and then call these methods
  onLogin: async (data) => {
    try {
      const userCredential = await doSignUserWithEmailAndPassword(
        data.email,
        data.password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        set({ currentUser: { uid: user.uid, ...userDocSnap.data() } });

        const { userInitials, userFirstName, userLastName } = getUserName(
          userDocSnap.data()
        );
        set({
          userName: {
            initials: userInitials,
            fullName: `${userFirstName} ${userLastName}`,
          },
        });

        if (!user.emailVerified) {
          createNotification(user.uid, emailVerificationEmail);
        }
      } else {
        throw new Error("No profile found for this user");
      }
    } catch (err) {
      console.error(err);
      set({ onLoginErr: getAuthErrorMessage(err) });
      setTimeout(() => set({ onLoginErr: null }), 10000);
    }
  },

  onSignup: async (data, thresholdsData = null) => {
    try {
      const userCredential = await doCreateUserWithEmailAndPassword(
        data.email,
        data.password
      );
      const user = userCredential.user;

      const userDocData = {
        firstName:
          data.firstName.slice(0, 1).toUpperCase() + data.firstName.slice(1),
        lastName:
          data.lastName.slice(0, 1).toUpperCase() + data.lastName.slice(1),
        email: data.email,
        createdAt: serverTimestamp(),
      };

      // Create user document in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        { profile: userDocData },
        { merge: true }
      );

      set({ currentUser: { uid: user.uid, ...userDocData } });

      set({
        userName: {
          initials:
            userDocData?.firstName?.slice(0, 1) +
            userDocData?.lastName?.slice(0, 1),
          fullName: `${userDocData?.firstName} ${userDocData?.lastName}`,
        },
      });

      // Send email verification
      await sendEmailVerification(user, {
        url: "http://localhost:5173/email-verified",
        handleCodeInApp: true,
      });

      // thresholdsData may be passed from the form; otherwise null
      if (thresholdsData) {
        await setDoc(
          doc(db, "users", user.uid),
          { thresholds: thresholdsData },
          { merge: true }
        );
      }

      // Send welcome notification
      createWelcomeNotification(user.uid);
    } catch (err) {
      set({ onSignupErr: getAuthErrorMessage(err) });
      setTimeout(() => set({ onSignupErr: null }), 10000);
    }
  },

  onGoogleSignIn: async (thresholdsData = null) => {
    try {
      const result = await doSignInWithGoogle();
      const user = result.user;

      const splitName = user.displayName?.split(" ") || [];
      const firstName = splitName?.[0] ?? "";
      const lastName = splitName?.[1] ?? "";

      const userDocData = {
        firstName: firstName
          ? firstName.slice(0, 1).toUpperCase() + firstName.slice(1)
          : "",
        lastName: lastName
          ? lastName.slice(0, 1).toUpperCase() + lastName.slice(1)
          : "",
        email: user.email,
        createdAt: serverTimestamp(),
      };

      set({ currentUser: { uid: user.uid, ...userDocData } });
      set({
        userName: {
          initials:
            (userDocData.firstName?.[0] || "") +
            (userDocData.lastName?.[0] || ""),
          fullName: `${userDocData.firstName} ${userDocData.lastName}`,
        },
      });

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create user document & thresholds if provided
        await setDoc(
          doc(db, "users", user.uid),
          { profile: userDocData },
          { merge: true }
        );
        if (thresholdsData) {
          await setDoc(
            doc(db, "users", user.uid),
            { thresholds: thresholdsData },
            { merge: true }
          );
        }
        createWelcomeNotification(user.uid);
      }
      if (userDocSnap.exists() && !user.emailVerified) {
        createNotification(user.uid, emailVerificationEmail);
      }
    } catch (err) {
      set({ googleErr: getAuthErrorMessage(err, "google") });
      setTimeout(() => set({ googleErr: null }), 10000);
    }
  },

  onMicrosoftSignIn: async (thresholdsData = null) => {
    try {
      const result = await doSignInWithMicrosoft();
      const user = result.user;

      const splitName = user.displayName?.split(" ") || [];
      const firstName = splitName?.[0] ?? "";
      const lastName = splitName?.[1] ?? "";

      const userDocData = {
        firstName: firstName
          ? firstName.slice(0, 1).toUpperCase() + firstName.slice(1)
          : "",
        lastName: lastName
          ? lastName.slice(0, 1).toUpperCase() + lastName.slice(1)
          : "",
        email: user.email,
        createdAt: serverTimestamp(),
      };

      set({ currentUser: { uid: user.uid, ...userDocData } });
      set({
        userName: {
          initials:
            (userDocData.firstName?.[0] || "") +
            (userDocData.lastName?.[0] || ""),
          fullName: `${userDocData.firstName} ${userDocData.lastName}`,
        },
      });

      // Create or update profile in firestore
      await setDoc(
        doc(db, "users", user.uid),
        { profile: userDocData },
        { merge: true }
      );

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        if (thresholdsData) {
          await setDoc(
            doc(db, "users", user.uid),
            { thresholds: thresholdsData },
            { merge: true }
          );
        }
        createWelcomeNotification(user.uid);
      }
    } catch (err) {
      set({ microsoftErr: getAuthErrorMessage(err, "microsoft") });
      setTimeout(() => set({ microsoftErr: null }), 10000);
    }
  },

  sendResetEmail: async (email) => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:5173/login",
        handleCodeInApp: true,
      });
      set({ resetLinkModalOpen: true });
    } catch (err) {
      console.error(err);
    }
  },

  resendVerificationLink: async (user) => {
    await sendEmailVerification(auth.currentUser, {
      url: "http://localhost:5173/email-verified",
      handleCodeInApp: true,
    });

    const notification = {
      subject: "A new email verification link has been sent",
      message:
        "We've just sent a fresh verification link to your email address. Please check your inbox, and if you don't see it there within a few minutes, don't forget to look in your spam or junk folder.",
      type: "System",
      read: false,
      createdAt: serverTimestamp(),
    };

    await addDocument(user.uid, "notifications", notification);
    toast.success("Verification link sent. Check your inbox or spam folder.", {
      position: "top-center",
      duration: 5000,
    });
  },
}));

export default useAuthStore;
