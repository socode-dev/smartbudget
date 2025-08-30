export const scheduleThresholdCheck = (
  mounted,
  checkThreshold,
  userUid,
  firstData,
  secondData,
  getAmount,
  formattedAmount,
  threshold50,
  threshold80,
  threshold100
) => {
  const run = async () => {
    if (!mounted) return;

    try {
      await checkThreshold(
        userUid,
        firstData,
        secondData,
        getAmount,
        formattedAmount,
        threshold50,
        threshold80,
        threshold100
      );
    } catch (err) {
      if (mounted) {
        console.error("generateNotifications error:", err);
      }
    }
  };

  // Prefer requestIdleCallback when available, fallback to setTimeout
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 200); // small delay so UI renders first
  }
};
