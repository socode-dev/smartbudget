import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import useOnboardingStore from "../../store/useOnboardingStore";
import useAuthStore from "../../store/useAuthStore";
import {
  overviewSteps,
  transactionsSteps,
  budgetsSteps,
  goalsSteps,
  insightsSteps,
  reportsSteps,
} from "../../data/joyrideSteps";

const TourJoyride = () => {
  const userId = useAuthStore((state) => state.currentUser?.uid);
  const tourActive = useOnboardingStore((state) => state.tourActive);
  const currentPage = useOnboardingStore((state) => state.currentPage);
  const stopTour = useOnboardingStore((state) => state.stopTour);
  const disableTourForUser = useOnboardingStore(
    (state) => state.disableTourForUser
  );

  
  const [joyrideKey, setJoyrideKey] = useState(0);

  useEffect(() => {
    if (tourActive) {
      setJoyrideKey((prev) => prev + 1);
    }
  }, [currentPage, tourActive]);

  if (!tourActive) return null;

  const getStepsForPage = (page) => {
    switch (page) {
      case "overview":
        return overviewSteps;
      case "transactions":
        return transactionsSteps;
      case "budgets":
        return budgetsSteps;
      case "goals":
        return goalsSteps;
      case "insights":
        return insightsSteps;
      case "reports":
        return reportsSteps;
      default:
        return overviewSteps;
    }
  };

  const currentSteps = getStepsForPage(currentPage).filter((step) => {
    if (typeof document === "undefined") return true;
    return Boolean(document.querySelector(step.target));
  });

  if (!currentSteps.length) return null;

  return (
    <Joyride
      key={joyrideKey}
      steps={currentSteps}
      continuous
      showSkipButton
      run={tourActive}
      disableBeacon
      disableOverlayClose
      hideCloseButton
      callback={(data) => {
        const { status } = data;
        if (status === "skipped") {
          disableTourForUser(userId);
          return;
        }

        if (status === "finished") {
          stopTour();
        }
      }}
      styles={{
        options: {
          arrowColor: `rgb(var(--color-bg-card))`,
          background: `rgb(var(--color-bg-card))`,
          overlayColor: "rgba(0, 0, 0, 0.5)",
          primaryColor: `rgb(var(--color-brand-deep))`,
          textColor: `rgb(var(--color-text))`,
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: 8,
          backgroundColor: `rgb(var(--color-bg-card))`,
          color: `rgb(var(--color-text))`,
          border: `1px solid rgb(var(--color-gray-border))`,
        },
        tooltipContent: {
          color: `rgb(var(--color-text))`,
          fontSize: 14,
          lineHeight: 1.5,
        },
        buttonNext: {
          backgroundColor: `rgb(var(--color-brand-deep))`,
          borderRadius: 6,
          color: "white",
          fontSize: 14,
          padding: "8px 16px",
          border: "none",
        },
        buttonBack: {
          color: `rgb(var(--color-muted))`,
          fontSize: 14,
          marginRight: 20,
          backgroundColor: "transparent",
          border: `1px solid rgb(var(--color-gray-border))`,
          borderRadius: 6,
          padding: "6px 12px",
        },
        buttonSkip: {
          color: `rgb(var(--color-muted))`,
          fontSize: 14,
          backgroundColor: "transparent",
          border: "none",
        },
        spotlight: {
          backgroundColor: `transparent`,
          borderRadius: 6,
          boxShadow: "0 0 0 2px rgb(var(--color-brand-deep))",
        },
      }}
    />
  );
};

export default TourJoyride;
