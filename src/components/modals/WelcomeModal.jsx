import { useCallback } from "react";
import { isDemoUser, useDemoMode } from "../../demo/useDemoMode";
import useAuthStore from "../../store/useAuthStore";
import useOnboardingStore from "../../store/useOnboardingStore";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import BrandMark from "../ui/BrandMark";
import { FiCompass, FiX } from "react-icons/fi";

const WelcomeModal = () => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompletedOnboarding);
  const completedOnboardingUsers = useOnboardingStore(state => state.completedOnboardingUsers);
  const setOnboardingCompleted = useOnboardingStore(state => state.setOnboardingCompleted);
  const enableTourForUser = useOnboardingStore(state => state.enableTourForUser);
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
    <Dialog
      ariaLabel="Welcome to Vydra"
      onClose={handleSkip}
      className="p-0! gap-0! items-stretch!"
    >
      <div className="border-b border-border bg-background p-6">
        <div className="flex items-center justify-between gap-3">
          <BrandMark />
          
          <Button
            variant="ghost"
            className="size-11 min-h-11 shrink-0 p-0!"
            onClick={handleSkip}
            aria-label="Close welcome"
            title="Close welcome"
          >
            <FiX size={18} aria-hidden="true" />
          </Button>
        </div>
        <h2 className="mt-5 font-display text-2xl font-semibold">
          Welcome to Vydra
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Take a quick tour of your dashboard, insights, budgets, goals, and
          reports.
        </p>
      </div>
      <ol className="divide-y divide-[rgb(var(--color-gray-border))]">
        {[
          [
            "Overview and transactions",
            "Review your income, expenses, and financial activity.",
          ],
          ["Budgets and goals", "Track spending limits and savings progress."],
          [
            "Insights and reports",
            "Explore your financial insights, trends, and reports.",
          ],
        ].map(([title, description], index) => (
          <li key={title} className="flex gap-4 px-6 py-4">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button onClick={handleTour}>
          <span className="flex items-center justify-center gap-2">
            <FiCompass aria-hidden="true" />
            Take a Tour
          </span>
        </Button>
      </div>
    </Dialog>
  );
};
export default WelcomeModal;
