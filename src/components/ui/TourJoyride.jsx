import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import useOnboardingStore from "../../store/useOnboardingStore";
import {
  overviewSteps,
  transactionsSteps,
  budgetsSteps,
  goalsSteps,
  insightsSteps,
  reportsSteps,
} from "../../data/joyrideSteps";

const TourJoyride = () => {
  const tourActive = useOnboardingStore((state) => state.tourActive);
  const currentPage = useOnboardingStore((state) => state.currentPage);
  const stopTour = useOnboardingStore((state) => state.stopTour);

  // State to force Joyride restart when page changes
  const [joyrideKey, setJoyrideKey] = useState(0);

  // Reset Joyride when page changes and tour is active
  useEffect(() => {
    if (tourActive) {
      setJoyrideKey((prev) => prev + 1);
    }
  }, [currentPage, tourActive]);

  if (!tourActive) return null;

  // Get steps based on current page
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

  const currentSteps = getStepsForPage(currentPage);

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
        const { status, type } = data;
        if (["finished", "skipped"].includes(status)) {
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
