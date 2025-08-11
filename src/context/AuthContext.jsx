import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithGoogle,
  doSignUserWithEmailAndPassword,
  doSignOut,
} from "../firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthFormContext } from "./AuthFormContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onLoginErr, setOnLoginErr] = useState(null);
  const [onSignupErr, setOnSignupErr] = useState(null);
  const [isSignoutPromptOpen, setIsSignoutPromptOpen] = useState(false);
  const [resetLinkModalOpen, setResetLinkModalOpen] = useState(false);
  const [openResetSuccessModal, setOpenResetSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [oobCode, setOobCode] = useState("");
  const [resetLinkErr, setResetLinkErr] = useState(null);
  const {
    loginHandleSubmit,
    loginFormReset,
    signupHandleSubmit,
    signupFormReset,
    forgotHandleSubmit,
    forgotFormReset,
    resetHandleSubmit,
    resetFormReset,
  } = useAuthFormContext();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
        } else {
          setCurrentUser({ uid: user.uid });
        }

        setUserLoggedIn(true);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const code = searchParams.get("oobCode");
    setOobCode(code);

    if (code) {
      verifyPasswordResetCode(auth, code)
        .then((email) => setUserEmail(email))
        .catch((err) => {
          setResetLinkErr(err ?? "Invalid or expired reset link");

          setTimeout(() => {
            setResetLinkErr("");
          }, 5000);
        });
    }

    return () => setOobCode("");
  }, []);

  const onLogin = loginHandleSubmit(async (data) => {
    try {
      const userCredential = await doSignUserWithEmailAndPassword(
        data.email,
        data.password
      );

      const user = userCredential.user;

      //  Fetch user profile from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setCurrentUser({
          uid: user.uid,
          ...userDocSnap.data(),
        });
      } else {
        console.warn("No profile found for this user");
      }
    } catch (err) {
      switch (err.code) {
        case "auth/invalid-credential":
          setOnLoginErr("Invalid email or password");
          break;
        case "auth/user-disabled":
          setOnLoginErr("This account has been disabled");
          break;
        default:
          setOnLoginErr("Something went wrong. Please try again");
      }
    } finally {
      setTimeout(() => loginFormReset(), 10);
    }
  });

  const onSignup = signupHandleSubmit(async (data) => {
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
      await setDoc(doc(db, "users", user.uid), userDocData);

      setCurrentUser({ uid: user.uid, ...userDocData });
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setOnSignupErr("This email is already registered to an account");
          break;
        case "auth/weak-password":
          setOnSignupErr("Password must be at least 6 characters");
          break;
        default:
          setOnSignupErr("Something went wrong. Please try again");
      }
    } finally {
      setTimeout(() => signupFormReset(), 10);
    }
  });

  const onGoogleSignIn = (e) => {
    e.preventDefault();
    doSignInWithGoogle().catch((err) => {
      setErr(err);
      setIsSigningIn(false);
    });
  };

  const onSignOut = () => {
    doSignOut();
    setIsSignoutPromptOpen(false);
  };

  const sendResetEmail = forgotHandleSubmit(async (data) => {
    if (!data) return;

    try {
      await sendPasswordResetEmail(auth, data.email);
      console.log(data.email);
      setResetLinkModalOpen(true);
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => forgotFormReset(), 10);
    }
  });

  const onPasswordReset = resetHandleSubmit(async (data) => {
    try {
      await confirmPasswordReset(auth, oobCode, data.password);

      setOpenResetSuccessModal(true);
    } catch (err) {
      setResetLinkErr(err.message);

      setTimeout(() => setResetLinkErr(""), 5000);
    } finally {
      setTimeout(() => resetFormReset(), 10);
    }
  });

  const userFirstName = currentUser?.firstName;
  const userLastName = currentUser?.lastName;
  const userInitials = userFirstName?.slice(0, 1) + userLastName?.slice(0, 1);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userFirstName,
        userLastName,
        userInitials,
        userLoggedIn,
        loading,
        onLoginErr,
        onSignupErr,
        onLogin,
        onSignup,
        onSignOut,
        onGoogleSignIn,
        onPasswordReset,
        isSignoutPromptOpen,
        setIsSignoutPromptOpen,
        sendResetEmail,
        userEmail,
        resetLinkErr,
        resetLinkModalOpen,
        setResetLinkModalOpen,
        openResetSuccessModal,
        setOpenResetSuccessModal,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
