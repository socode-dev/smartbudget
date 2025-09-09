import useAuthStore from "../store/useAuthStore";
import { shallow } from "zustand/shallow";
// import {useShallow} from "zustand/react/shallow";

// Simple selector hooks for common auth state
export const useCurrentUser = () => useAuthStore((state) => state.currentUser);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useIsUserEmailVerified = () =>
  useAuthStore((state) => state.isUserEmailVerified);
export const useUserName = () => useAuthStore((state) => state.userName);
export const useUserLoggedIn = () =>
  useAuthStore((state) => state.userLoggedIn);

// Error hooks - use shallow equality so the returned object identity is stable
export const useAuthErrors = () =>
  useAuthStore(
    (state) => ({
      onLoginErr: state.onLoginErr,
      onSignupErr: state.onSignupErr,
      googleErr: state.googleErr,
      microsoftErr: state.microsoftErr,
    }),
    shallow
  );

// Modal state
export const useResetLinkModal = () =>
  useAuthStore(
    (state) => ({
      resetLinkModalOpen: state.resetLinkModalOpen,
      setResetLinkModalOpen: state.setResetLinkModalOpen,
    }),
    shallow
  );

// Auth actions (returns stable references to actions)
export const useAuthActions = () =>
  useAuthStore(
    (state) => ({
      onLogin: state.onLogin,
      onSignup: state.onSignup,
      onGoogleSignIn: state.onGoogleSignIn,
      onMicrosoftSignIn: state.onMicrosoftSignIn,
      sendResetEmail: state.sendResetEmail,
      // startAuthListener: state.startAuthListener,
      // stopAuthListener: state.stopAuthListener,
    }),
    shallow
  );

export default useAuthStore;
