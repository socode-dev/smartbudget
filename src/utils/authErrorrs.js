export const AUTH_ERROR_MESSAGES = {
  // Email & Password - Sign Up
  "auth/email-already-in-use":
    "This email is already registered. Try logging in instead.",
  "auth/invalid-email": "The email address is not valid.",
  "auth/operation-not-allowed": "Email/password accounts are not enabled.",
  "auth/weak-password": "Your password is too weak.",

  // Email & Password Login
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password. Please try again",
  "auth/invalid-credential": "Invalid email or password. Plase try again",

  // Shared / Common
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/cancelled-popup-request": "Another sign-in attempt was in progress.",
  "auth/popup-closed-by-user":
    "The sign-in popup was closed before completing the process.",
  "auth/account-exists-with-different-credential":
    "An account with this email exist with different sign-in method.",

  // Fallback
  default: "Something went wrong. Please try again.",
};

export const PROVIDER_ERROR_MESSAGES = {
  google: {
    "popup-blocked": "Your browser blocked the Google sign-in popup.",
    idpiframe_initialization_failed:
      "Google sign-in failed to intiate. Please try again.",
  },
  microsoft: {
    "auth/invalid-tenant":
      "The microsoft tenant is not authorized for this app.",
    "auth/expired-action-code": "your microsft login session expired.",
  },
};

export const getAuthErrorMessage = (error, provider = null) => {
  const code = error?.code || "default";

  // Check provider for specific messages
  if (provider && PROVIDER_ERROR_MESSAGES[provider]?.[code]) {
    return PROVIDER_ERROR_MESSAGES[provider][code];
  }

  // Fallback to shared messages
  return AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES.default;
};
