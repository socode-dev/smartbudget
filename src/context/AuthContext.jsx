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
  doSignInWithMicrosoft,
} from "../firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthFormContext } from "./AuthFormContext";
import { getAuthErrorMessage } from "../utils/authErrorrs";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onLoginErr, setOnLoginErr] = useState(null);
  const [onSignupErr, setOnSignupErr] = useState(null);
  const [googleErr, setGoogleErr] = useState(null);
  const [microsoftErr, setMicrosoftErr] = useState(null);
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
        throw new Error("No profile found for this user");
      }
    } catch (err) {
      console.log(err);

      setOnLoginErr(getAuthErrorMessage(err));
      // switch (err.code) {
      //   case "auth/invalid-credential":
      //     setOnLoginErr("Invalid email or password");
      //     break;
      //   case "auth/user-disabled":
      //     setOnLoginErr("This account has been disabled");
      //     break;
      //   default:
      //     setOnLoginErr("Something went wrong. Please try again");
      // }

      setTimeout(() => setOnLoginErr(null), 10000);
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
      setOnSignupErr(getAuthErrorMessage(err));
      // switch (err.code) {
      //   case "auth/email-already-in-use":
      //     setOnSignupErr("This email is already registered to an account");
      //     break;
      //   case "auth/weak-password":
      //     setOnSignupErr("Password must be at least 6 characters");
      //     break;
      //   default:
      //     setOnSignupErr("Something went wrong. Please try again");
      // }

      setTimeout(() => setOnSignupErr(null), 10000);
    } finally {
      setTimeout(() => signupFormReset(), 10);
    }
  });

  const onGoogleSignIn = async () => {
    try {
      const result = await doSignInWithGoogle();
      const user = result.user;

      const splitName = user.displayName.split(" ");
      const firstName = splitName?.at(0);
      const lastName = splitName?.at(1);

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

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), userDocData);

      setCurrentUser({ uid: user.uid, ...userDocData });
    } catch (err) {
      setGoogleErr(getAuthErrorMessage(err, "google"));
      // switch (err.code) {
      //   case "auth/account-exists-with-different-credential":
      //     setGoogleErr(
      //       "This email is already linked to another sign-in method"
      //     );
      //     break;
      //   case "auth/invalid-credential":
      //     setGoogleErr(
      //       "You Microsoft login link expired or is invalid. Please try again"
      //     );
      //     break;
      //   case "auth/operation-not-allowed":
      //     setGoogleErr(
      //       "Microsoft sign-in is currently disabled. Please use anotehr method"
      //     );
      //     break;
      //   case "auth/network-request-failed":
      //     setGoogleErr(
      //       "Network error. Please check your internet connection"
      //     );
      //     break;
      //   case "auth/popup-closed-by-user":
      //     setGoogleErr(
      //       "Sign-in was canceled. Please complete the sign-in process"
      //     );
      //     break;
      //   case "auth/cancelled-popup-request":
      //     setGoogleErr(
      //       "Another sign-inn attempt is already in progress. Please wait."
      //     );
      //     break;
      //   case err.code?.startsWith("AADSTS"):
      //     setGoogleErr("Microsoft authentication failed. Please try again");
      //     break;
      //   default:
      //     setGoogleErr("An unexpected error occured. Please try again");
      // }

      setTimeout(() => setGoogleErr(null), 10000);
    }
  };

  const onMicrosoftSignIn = async () => {
    try {
      const result = await doSignInWithMicrosoft();
      const user = result.user;
      console.log(user);

      const splitName = user.displayName.split(" ");
      const firstName = splitName?.at(0);
      const lastName = splitName?.at(1);

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

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), userDocData);

      setCurrentUser({ uid: user.uid, ...userDocData });
    } catch (err) {
      setMicrosoftErr(getAuthErrorMessage(err, "microsoft"));
      // switch (err.code) {
      //   case "auth/account-exists-with-different-credential":
      //     setMicrosoftErr(
      //       "This email is already linked to another sign-in method"
      //     );
      //     break;
      //   case "auth/invalid-credential":
      //     setMicrosoftErr(
      //       "You Microsoft login link expired or is invalid. Please try again"
      //     );
      //     break;
      //   case "auth/operation-not-allowed":
      //     setMicrosoftErr(
      //       "Microsoft sign-in is currently disabled. Please use anotehr method"
      //     );
      //     break;
      //   case "auth/network-request-failed":
      //     setMicrosoftErr(
      //       "Network error. Please check your internet connection"
      //     );
      //     break;
      //   case "auth/popup-closed-by-user":
      //     setMicrosoftErr(
      //       "Sign-in was canceled. Please complete the sign-in process"
      //     );
      //     break;
      //   case "auth/cancelled-popup-request":
      //     setMicrosoftErr(
      //       "Another sign-inn attempt is already in progress. Please wait."
      //     );
      //     break;
      //   case err.code?.startsWith("AADSTS"):
      //     setMicrosoftErr("Microsoft authentication failed. Please try again");
      //     break;
      //   default:
      //     setMicrosoftErr("An unexpected error occured. Please try again");
      // }
    }

    setTimeout(() => setMicrosoftErr(null), 10000);
  };

  const onSignOut = () => {
    doSignOut();
    setCurrentUser(null);
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
        microsoftErr,
        googleErr,
        onLogin,
        onSignup,
        onGoogleSignIn,
        onMicrosoftSignIn,
        onSignOut,
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
