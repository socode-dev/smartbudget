import useOnboardingStore from "../../store/useOnboardingStore";
import { useCallback } from "react";
import Dialog from "../ui/Dialog";

const WelcomeModal = () => {
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding
  );
  const setOnboardingCompleted = useOnboardingStore(
    (state) => state.setOnboardingCompleted
  );
  const startTour = useOnboardingStore((state) => state.startTour);

  const handleTour = useCallback(() => {
    setOnboardingCompleted();
    startTour("overview"); // Start with overview tour
  }, [setOnboardingCompleted, startTour]);

  if (hasCompletedOnboarding) return null;

  return (
    <Dialog ariaLabel="welcome-dialog">
      <h2 className="text-2xl font-bold mb-4">👋🏻 Welcome to SmartBudget</h2>
      <p className="text-[rgb(var(--color-muted))] mb-6">
        Track your spending, set budgets and goals, and get smart insights to
        stay on top of your finances.
      </p>

      <div className="space-y-3 w-full">
        <button
          onClick={setOnboardingCompleted}
          className="w-full px-4 py-2 bg-[rgb(var(--color-brand-deep))] text-white rounded-md hover:bg-[rgb(var(--color-brand))] active:bg-[rgb(var(--color-brand))] transition cursor-pointer"
        >
          Get Started
        </button>

        <button
          onClick={handleTour}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 active:bg-green-500  transition cursor-pointer"
        >
          Take a Tour
        </button>

        <button
          onClick={setOnboardingCompleted}
          className="w-full px-4 py-2 bg-[rgb(var(--color-muted))] text-white rounded-md hover:opacity-90 active:opacity-90 transition cursor-pointer"
        >
          Skip for now
        </button>
      </div>
    </Dialog>
  );
};

export default WelcomeModal;
