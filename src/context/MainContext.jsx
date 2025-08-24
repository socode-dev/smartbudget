import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuthContext } from "./AuthContext";
import useNotificationStore from "../store/useNotificationStore";
import useTransactionStore from "../store/useTransactionStore";
import { useDropdownClose } from "../hooks/useDropdownClose";
import useCurrencyStore from "../store/useCurrencyStore";
// import useThresholdStore from "../store/useThresholdStore";
// import { getUserThresholds } from "../firebase/firestore";

const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const { loadTransactions } = useTransactionStore();
  const { loadNotifications } = useNotificationStore();
  // const { loadThresholds } = useThresholdStore();
  const { currentUser } = useAuthContext();
  const { fetchCurrencies } = useCurrencyStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSignoutPromptOpen, setIsSignoutPromptOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAISettingsOpen, setIsAISettingsOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const aiSettingsRef = useRef(null);
  const currencyRef = useRef(null);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  useDropdownClose(isSettingsOpen, settingsRef, setIsSettingsOpen);
  useDropdownClose(isProfileOpen, profileRef, setIsProfileOpen);
  useDropdownClose(isAISettingsOpen, aiSettingsRef, setIsAISettingsOpen);
  useDropdownClose(isCurrencyOpen, currencyRef, setIsCurrencyOpen);

  const handleSidebarOpen = () => setIsSidebarOpen((prev) => !prev);
  const handleSidebarClose = () => setIsSidebarOpen(false);

  // Handle to open and close preferences
  const handlePreferencesOpen = () => {
    setIsPreferencesOpen(true);
    setIsSettingsOpen(false);
  };
  const handlePreferencesClose = () => setIsPreferencesOpen(false);

  // Handle to open and close settings
  const handleSettingsToggle = () => setIsSettingsOpen((prev) => !prev);

  // Handle to open and close profile
  const handleProfileToggle = () => setIsProfileOpen((prev) => !prev);

  // Handle AI Settings open and close
  const handleAISettingsToggle = () => setIsAISettingsOpen((prev) => !prev);

  // Handle currency open and close
  const handleCurrencyToggle = () => setIsCurrencyOpen((prev) => !prev);
  const handleCurrencyClose = () => setIsCurrencyOpen(false);

  // Handle Open Sign out prompt and close profile
  const handleSignoutPromptOpen = () => {
    setIsSignoutPromptOpen(true);
    setIsProfileOpen(false);
  };
  const handleSignoutPromptClose = () => setIsSignoutPromptOpen(false);

  // Load all transactions, budgets, goals on mount
  useEffect(() => {
    let isMounted = true;

    // Fetch all currencies
    fetchCurrencies();

    // Fetch user's data
    const fetchUserData = async () => {
      if (!currentUser?.uid) return;

      try {
        // Load all transactions, budgets, goals and contributions
        const types = ["transactions", "budgets", "goals", "contributions"];
        types.forEach(async (label) => {
          await loadTransactions(currentUser.uid, label);
        });

        // Load notifications
        await loadNotifications(currentUser.uid);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  // Close sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 922 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  return (
    <MainContext.Provider
      value={{
        settingsRef,
        aiSettingsRef,
        currencyRef,
        profileRef,
        isSidebarOpen,
        isSettingsOpen,
        isProfileOpen,
        isPreferencesOpen,
        isAISettingsOpen,
        isCurrencyOpen,
        isSignoutPromptOpen,
        handleSidebarOpen,
        handleSidebarClose,
        handlePreferencesOpen,
        handlePreferencesClose,
        handleSettingsToggle,
        handleProfileToggle,
        handleAISettingsToggle,
        handleCurrencyToggle,
        handleCurrencyClose,
        handleSignoutPromptOpen,
        handleSignoutPromptClose,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
