import { triggerAnomalyTransactional } from "./anomaly/triggerAnomaly";
import { detectAnomalies } from "./anomaly/anomalyDetection";
import { runAnomalyAgent } from "./agent/anomalyAgent";
import { triggerBudgetComplianceTransactional } from "./budget/triggerBudget";
import { buildBudgetComplianceData } from "./budget/budgetData";
import { runBudgetAgent } from "./agent/budgetAgent";
// import { getForecastSeverity } from "./getForecastSeverity";
import useTransactionStore from "../store/useTransactionStore";
import useCurrencyStore from "../store/useCurrencyStore";
// import { formatAmount } from "../utils/formatAmount";

// Create a module Web Worker for training to keep the main thread responsive
const createWorker = () =>
  new Worker(new URL("./trainWorker.js", import.meta.url), { type: "module" });

export const generateInsight = async (uid, transactions) => {
  const { budgets } = useTransactionStore.getState();
  const { selectedCurrency } = useCurrencyStore.getState();

  const processedInsights = [];

  // Detect anomalies
  const anomalies = detectAnomalies(transactions);

  // Atomically check and trigger anomalies
  for (const anomaly of anomalies) {
    try {
      const result = await triggerAnomalyTransactional(uid, anomaly);

      if(!result.triggered) continue;
      
        const anomalyInsight = await runAnomalyAgent(anomaly, uid);
        
      if (anomalyInsight) {
        processedInsights.push(anomalyInsight);
      }
    } catch (err) {
      throw err;
    }
  }

  // Atomically check and trigger budget compliance
  for(const budget of budgets) {
    const complianceData = buildBudgetComplianceData(budget, transactions, selectedCurrency); 
    
    
    try {
      const triggerResult = await triggerBudgetComplianceTransactional(uid, complianceData);

      if(!triggerResult.triggered) continue;

      const budgetInsight = await runBudgetAgent(complianceData, uid);

      if(budgetInsight) processedInsights.push(budgetInsight);
    } catch (err) {
      throw err;
    }

  }
  
  return processedInsights;


  // // 2) Forecasts - process per category using a worker
  // const categories = [...new Set(transactions.map((t) => t.category))];
  // if (categories.length === 0) return;

  // // Worker instance to handle training tasks
  // const worker = createWorker();

  // // Map to hold pending callbacks keyed by requestId
  // const pending = new Map();

  // // Listen for worker responses and compose insights from predictions
  // worker.addEventListener("message", (event) => {
  //   const { requestId, category, predictedValue, durationMs, error } =
  //     event.data || {};
  //   const cb = pending.get(requestId);
  //   if (cb) {
  //     pending.delete(requestId);
  //     if (error) {
  //       // console.warn("Forecast worker error for", category, error);
  //       cb(null, { category, error });
  //     } else if (predictedValue == null) {
  //       cb(null, { category, predictedValue: null });
  //     } else {
  //       // Get user's budgets array (per-category numeric budgets)
  //       const budgets = useTransactionStore.getState().budgets || [];
  //       const budgetEntry = budgets.find(
  //         (budget) => budget.category === category,
  //       );
  //       // Numeric budget amount for severity calculation
  //       const budgetAmount = budgetEntry?.amount ?? null;
  //       // Compute severity from predicted value and budget amount
  //       let severity = "low";
  //       try {
  //         severity = getForecastSeverity(predictedValue, budgetAmount);
  //       } catch (err) {
  //         console.warn("Failed to compute forecast severity:", err);
  //         severity = "low";
  //       }

  //       // Compose the final insight object if predicted is greater than 0 and add it to the store
  //       if (predictedValue > 0) {
  //         const insight = {
  //           id: `tmp_${Math.random().toString(36).slice(2)}`,
  //           type: "forecast",
  //           subject: "Next month spending forecast",
  //           message: `You are likely to spend ${formatAmount(
  //             predictedValue,
  //             selectedCurrency,
  //           )} on "${category}" next month`,
  //           category,
  //           actionType: "suggestion",
  //           actionText: `Adjust your "${category}" budget for next month.`,
  //           createdAt: new Date(),
  //           severity,
  //           source: "ml",
  //           confidence: 0.8,
  //         };

  //         addInsight(uid, insight);
  //         cb(insight, { category, durationMs });
  //       }
  // }
  // }
  // });

  // // Post tasks to worker for each detected category
  // for (const category of categories) {
  //   const requestId = Math.random().toString(36).slice(2);
  //   // Store a noop callback; insights are written to the store in the listener
  //   pending.set(requestId, (insight) => {
  //     /* no-op */
  //   });

  //   worker.postMessage({
  //     requestId,
  //     uid,
  //     transactions,
  //     category,
  //     options: { epochs: 12, cache: true },
  //   });
  // }

  // // Poll until all pending tasks are complete then terminate worker
  // const interval = setInterval(() => {
  //   if (pending.size === 0) {
  //     worker.terminate();
  //     clearInterval(interval);
  //   }
  // }, 500);
};
