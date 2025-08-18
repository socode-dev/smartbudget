import { createContext, useContext, useEffect, useState } from "react";
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
  doSignOut,
  doSignInWithMicrosoft,
} from "../firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useAuthFormContext } from "./AuthFormContext";
import { getAuthErrorMessage } from "../utils/authErrorrs";
import { getUserName } from "../utils/getUserName";
import { createWelcomeNotification } from "../firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserEmailVerified, setIsUserEmailVerified] = useState(false);
  const [userName, setUserName] = useState({ initials: "", fullName: "" });
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onLoginErr, setOnLoginErr] = useState(null);
  const [onSignupErr, setOnSignupErr] = useState(null);
  const [googleErr, setGoogleErr] = useState(null);
  const [microsoftErr, setMicrosoftErr] = useState(null);
  const [isSignoutPromptOpen, setIsSignoutPromptOpen] = useState(false);
  const [resetLinkModalOpen, setResetLinkModalOpen] = useState(false);
  const {
    loginHandleSubmit,
    loginFormReset,
    signupHandleSubmit,
    signupFormReset,
    forgotHandleSubmit,
    forgotFormReset,
  } = useAuthFormContext();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
          const { userInitials, userFirstName, userLastName } = getUserName(
            userDocSnap.data()
          );
          setUserName((prev) => ({
            ...prev,
            initials: userInitials,
            fullName: `${userFirstName} ${userLastName}`,
          }));
        } else {
          setCurrentUser({ uid: user.uid });
        }

        setUserLoggedIn(true);
        setIsUserEmailVerified(user.emailVerified);
      } else {
        setCurrentUser(null);
        setUserLoggedIn(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle login with email and password
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
        const { userInitials, userFirstName, userLastName } = getUserName(
          userDocSnap.data()
        );

        setCurrentUser({
          uid: user.uid,
          ...userDocSnap.data(),
        });
        setUserName((prev) => ({
          ...prev,
          initials: userInitials,
          fullName: `${userFirstName} ${userLastName}`,
        }));
      } else {
        throw new Error("No profile found for this user");
      }
    } catch (err) {
      console.log(err);

      setOnLoginErr(getAuthErrorMessage(err));

      setTimeout(() => setOnLoginErr(null), 10000);
    } finally {
      setTimeout(() => loginFormReset(), 10);
    }
  });

  // Handle signup with email and password
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
      await setDoc(doc(db, "users", user.uid), { profile: userDocData });

      // Set current user
      setCurrentUser({ uid: user.uid, ...userDocData });

      // Set current userName
      setUserName((prev) => ({
        ...prev,
        initials:
          userDocData.firstName.slice(0, 1) + userDocData.lastName.slice(0, 1),
        fullName: `${userDocData.firstName} ${userDocData.lastName}`,
      }));

      createWelcomeNotification(user.uid);

      // Send email verification
      await sendEmailVerification(user, {
        url: "http://localhost:5173/email-verified",
        handleCodeInApp: true,
      });
    } catch (err) {
      setOnSignupErr(getAuthErrorMessage(err));

      setTimeout(() => setOnSignupErr(null), 10000);
    } finally {
      setTimeout(() => signupFormReset(), 10);
    }
  });

  // Handle google sign in
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
      await setDoc(doc(db, "users", user.uid), { profile: userDocData });

      setCurrentUser({ uid: user.uid, ...userDocData });

      setUserName((prev) => ({
        ...prev,
        initials:
          userDocData?.firstName?.slice(0, 1) +
          userDocData?.lastName?.slice(0, 1),
        fullName: `${userDocData?.firstName} ${userDocData?.lastName}`,
      }));
    } catch (err) {
      setGoogleErr(getAuthErrorMessage(err, "google"));

      setTimeout(() => setGoogleErr(null), 10000);
    }
  };

  // Handle microsoft sign in
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
      await setDoc(doc(db, "users", user.uid), { profile: userDocData });

      setCurrentUser({ uid: user.uid, ...userDocData });

      setUserName((prev) => ({
        ...prev,
        initials:
          userDocData?.firstName?.slice(0, 1) +
          userDocData?.lastName?.slice(0, 1),
        fullName: `${userDocData?.firstName} ${userDocData?.lastName}`,
      }));
    } catch (err) {
      setMicrosoftErr(getAuthErrorMessage(err, "microsoft"));

      setTimeout(() => setMicrosoftErr(null), 10000);
    }
  };

  // Handle sign out
  const onSignOut = () => {
    setIsSignoutPromptOpen(false);
    doSignOut();
    setCurrentUser(null);
    setUserName((prev) => ({ ...prev, initials: "", fullName: "" }));
  };

  const sendResetEmail = forgotHandleSubmit(async (data) => {
    if (!data) return;

    try {
      await sendPasswordResetEmail(auth, data.email, {
        url: "http://localhost:5173/login",
        handleCodeInApp: true,
      });
      console.log(data.email);
      setResetLinkModalOpen(true);
    } catch (err) {
      console.log(err);
    } finally {
      setTimeout(() => forgotFormReset(), 10);
    }
  });

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userName,
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
        isSignoutPromptOpen,
        setIsSignoutPromptOpen,
        sendResetEmail,
        resetLinkModalOpen,
        setResetLinkModalOpen,
        isUserEmailVerified,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
