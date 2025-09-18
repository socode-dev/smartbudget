import { detectAnomalies } from "./anomalyDetection";
import { getForecastSeverity } from "./getForecastSeverity";
import useInsightsStore from "../store/useInsightsStore";
import useTransactionStore from "../store/useTransactionStore";
import useCurrencyStore from "../store/useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";

// Create a module Web Worker for training to keep the main thread responsive
const createWorker = () =>
  new Worker(new URL("./trainWorker.js", import.meta.url), { type: "module" });

//  Generate insights: run anomaly detection synchronously and offload forecast training to a Web Worker to avoid blocking the UI.

export const generateInsight = async (uid, transactions) => {
  // Access insight store's addInsight action
  const { addInsight } = useInsightsStore.getState();
  const { selectedCurrency } = useCurrencyStore.getState();

  // 1) Anomalies - synchronous and fast
  const anomalies = detectAnomalies(transactions);
  // Add each anomaly insight immediately

  anomalies.forEach((insight) => addInsight(uid, insight));

  // 2) Forecasts - process per category using a worker
  const categories = [...new Set(transactions.map((t) => t.category))];
  if (categories.length === 0) return;

  // Worker instance to handle training tasks
  const worker = createWorker();

  // Map to hold pending callbacks keyed by requestId
  const pending = new Map();

  // Listen for worker responses and compose insights from predictions
  worker.addEventListener("message", (event) => {
    const { requestId, category, predictedValue, durationMs, error } =
      event.data || {};
    const cb = pending.get(requestId);
    if (cb) {
      pending.delete(requestId);
      if (error) {
        // console.warn("Forecast worker error for", category, error);
        cb(null, { category, error });
      } else if (predictedValue == null) {
        cb(null, { category, predictedValue: null });
      } else {
        // Get user's budgets array (per-category numeric budgets)
        const budgets = useTransactionStore.getState().budgets || [];
        const budgetEntry = budgets.find(
          (budget) => budget.category === category
        );
        // Numeric budget amount for severity calculation
        const budgetAmount = budgetEntry?.amount ?? null;
        // Compute severity from predicted value and budget amount
        let severity = "low";
        try {
          severity = getForecastSeverity(predictedValue, budgetAmount);
        } catch (err) {
          console.warn("Failed to compute forecast severity:", err);
          severity = "low";
        }

        // Compose the final insight object if predicted is greater than 0 and add it to the store
        if (predictedValue > 0) {
          console.log(predictedValue);
          const insight = {
            id: `tmp_${Math.random().toString(36).slice(2)}`,
            type: "forecast",
            subject: "Next month spending forecast",
            message: `You are likely to spend ${formatAmount(
              predictedValue,
              selectedCurrency
            )} on "${category}" next month`,
            actionType: "suggestion",
            actionText: `Adjust your "${category}" budget for next month.`,
            createdAt: new Date(),
            severity,
            source: "ml",
            confidence: 0.8,
          };

          addInsight(uid, insight);
          cb(insight, { category, durationMs });
        }
      }
    }
  });

  // Post tasks to worker for each detected category
  for (const category of categories) {
    const requestId = Math.random().toString(36).slice(2);
    // Store a noop callback; insights are written to the store in the listener
    pending.set(requestId, (insight) => {
      /* no-op */
    });

    worker.postMessage({
      requestId,
      uid,
      transactions,
      category,
      options: { epochs: 12, cache: true },
    });
  }

  // Poll until all pending tasks are complete then terminate worker
  const interval = setInterval(() => {
    if (pending.size === 0) {
      worker.terminate();
      clearInterval(interval);
    }
  }, 500);
};
