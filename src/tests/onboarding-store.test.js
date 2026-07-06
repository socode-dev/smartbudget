import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

let useOnboardingStore;

const createLocalStorage = () => {
  let items = {};

  return {
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => {
      items[key] = String(value);
    },
    removeItem: (key) => {
      delete items[key];
    },
    clear: () => {
      items = {};
    },
  };
};

const resetOnboarding = () => {
  useOnboardingStore.getState().resetTours();
};

describe("onboarding store", () => {
  beforeAll(async () => {
    vi.stubGlobal("localStorage", createLocalStorage());
    const storeModule = await import("../store/useOnboardingStore");
    useOnboardingStore = storeModule.default;
  });

  beforeEach(() => {
    localStorage.clear();
    resetOnboarding();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("marks the welcome modal as completed for the current user only", () => {
    const store = useOnboardingStore.getState();

    store.setOnboardingCompleted("user-a");

    expect(useOnboardingStore.getState().hasSeenWelcome("user-a")).toBe(true);
    expect(useOnboardingStore.getState().hasSeenWelcome("user-b")).toBe(false);
  });

  it("does not start page tours unless the user chose to take the tour", () => {
    const store = useOnboardingStore.getState();

    store.setOnboardingCompleted("user-a");
    store.startTourIfNotCompleted("transactions", "user-a");

    expect(useOnboardingStore.getState().tourActive).toBe(false);
  });

  it("tracks completed page tours per user", () => {
    const store = useOnboardingStore.getState();

    store.enableTourForUser("user-a");
    store.startTourIfNotCompleted("transactions", "user-a");
    useOnboardingStore.getState().stopTour();

    expect(
      useOnboardingStore.getState().isTourCompleted("transactions", "user-a")
    ).toBe(true);
    expect(
      useOnboardingStore.getState().isTourCompleted("transactions", "user-b")
    ).toBe(false);
  });

  it("disables future page tours when a user skips Joyride", () => {
    const store = useOnboardingStore.getState();

    store.enableTourForUser("user-a");
    store.startTourIfNotCompleted("transactions", "user-a");
    store.disableTourForUser("user-a");
    store.startTourIfNotCompleted("budgets", "user-a");

    expect(useOnboardingStore.getState().tourActive).toBe(false);
    expect(useOnboardingStore.getState().hasTourEnabled("user-a")).toBe(false);
  });
});
