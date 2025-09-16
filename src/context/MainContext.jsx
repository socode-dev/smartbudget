import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import useNotificationStore from "../store/useNotificationStore";
import useTransactionStore from "../store/useTransactionStore";
import { useDropdownClose } from "../hooks/useDropdownClose";
import useCurrencyStore from "../store/useCurrencyStore";
import useAuthStore from "../store/useAuthStore";

const MainContext = createContext();

export const MainProvider = ({ children }) => {
  const { currentUser: user } = useAuthStore();
  const { loadTransactions } = useTransactionStore();
  const { loadNotifications } = useNotificationStore();
  const { fetchCurrencies } = useCurrencyStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isSignoutPromptOpen, setIsSignoutPromptOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  useDropdownClose(
    isSettingsOpen,
    settingsRef,
    setIsSettingsOpen,
    setIsCurrencyOpen,
    setIsExportOpen
  );
  useDropdownClose(isProfileOpen, profileRef, setIsProfileOpen);

  const handleSidebarOpen = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    []
  );
  const handleSidebarClose = useCallback(() => setIsSidebarOpen(false), []);

  // Handle to open and close preferences
  const handlePreferencesOpen = useCallback(() => {
    setIsPreferencesOpen(true);
    setIsSettingsOpen(false);
  }, []);
  const handlePreferencesClose = useCallback(
    () => setIsPreferencesOpen(false),
    []
  );

  // Handle to open and close settings
  const handleSettingsToggle = useCallback(
    () => setIsSettingsOpen((prev) => !prev),
    []
  );

  // Handle to open and close profile
  const handleProfileToggle = useCallback(
    () => setIsProfileOpen((prev) => !prev),
    []
  );

  // Handle currency open and close
  const handleCurrencyToggle = useCallback(
    () => setIsCurrencyOpen((prev) => !prev),
    []
  );
  const handleCurrencyClose = useCallback(() => setIsCurrencyOpen(false), []);

  const handleExportToggle = useCallback(
    () => setIsExportOpen((prev) => !prev),
    []
  );

  // Handle Open Sign out prompt and close profile
  const handleSignoutPromptOpen = useCallback(() => {
    setIsSignoutPromptOpen(true);
    setIsProfileOpen(false);
  }, []);
  const handleSignoutPromptClose = useCallback(
    () => setIsSignoutPromptOpen(false),
    []
  );

  // Load all transactions, budgets, goals on mount
  useEffect(() => {
    let isMounted = true;

    // Fetch all currencies
    fetchCurrencies();

    // Fetch user's data
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        // Load all transactions, budgets, goals and contributions
        const types = ["transactions", "budgets", "goals", "contributions"];
        types.forEach(async (label) => {
          await loadTransactions(user.uid, label);
        });

        // Load notifications
        await loadNotifications(user.uid);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, [user]);

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
        profileRef,
        isSidebarOpen,
        isSettingsOpen,
        isProfileOpen,
        isPreferencesOpen,
        isCurrencyOpen,
        isExportOpen,
        isSignoutPromptOpen,
        handleSidebarOpen,
        handleSidebarClose,
        handlePreferencesOpen,
        handlePreferencesClose,
        handleSettingsToggle,
        handleProfileToggle,
        handleCurrencyToggle,
        handleCurrencyClose,
        handleSignoutPromptOpen,
        handleSignoutPromptClose,
        handleExportToggle,
        setIsExportOpen,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
