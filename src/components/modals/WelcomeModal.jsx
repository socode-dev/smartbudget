import { useCallback } from "react";
import { isDemoUser, useDemoMode } from "../../demo/useDemoMode";
import useAuthStore from "../../store/useAuthStore";
import useOnboardingStore from "../../store/useOnboardingStore";
import Dialog from "../ui/Dialog";

const WelcomeModal = () => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );
  const completedOnboardingUsers = useOnboardingStore(
    (state) => state.completedOnboardingUsers
  );
  const setOnboardingCompleted = useOnboardingStore(
    (state) => state.setOnboardingCompleted
  );
  const enableTourForUser = useOnboardingStore(
    (state) => state.enableTourForUser
  );
  const startTour = useOnboardingStore((state) => state.startTour);
  const hasSeenWelcome = user?.uid
    ? completedOnboardingUsers.includes(user.uid) ||
      (hasCompletedOnboarding && completedOnboardingUsers.length === 0)
    : hasCompletedOnboarding;

  const handleTour = useCallback(() => {
    enableTourForUser(user?.uid);
    startTour("overview", user?.uid);
  }, [enableTourForUser, startTour, user?.uid]);

  const handleSkip = useCallback(() => {
    setOnboardingCompleted(user?.uid);
  }, [setOnboardingCompleted, user?.uid]);

  if (!user || isDemoMode || isDemoUser(user) || hasSeenWelcome) {
    return null;
  }

  return (
    <Dialog ariaLabel="welcome-dialog">
      <h2 className="text-2xl font-bold mb-4">Welcome to SmartBudget</h2>
      <p className="text-[rgb(var(--color-muted))] mb-6">
        Take a quick tour of the dashboard, insights, budgets, goals, and
        reports that help you understand customer financial behavior.
      </p>

      <div className="space-y-3 w-full">
        <button
          onClick={handleTour}
          className="w-full px-4 py-2 bg-[rgb(var(--color-brand-deep))] text-white rounded-md hover:bg-[rgb(var(--color-brand))] active:bg-[rgb(var(--color-brand))] transition cursor-pointer"
        >
          Take a Tour
        </button>

        <button
          onClick={handleSkip}
          className="w-full px-4 py-2 bg-transparent text-gray-500 rounded-md hover:opacity-90 active:opacity-90 transition cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </Dialog>
  );
};

export default WelcomeModal;
