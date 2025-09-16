import * as tf from "@tensorflow/tfjs";
import { createForecastModel } from "./forecastModel";
import { preprocessTransaction } from "./preprocessTransactions";
import useCurrencyStore from "../store/useCurrencyStore";

export const trainForecastModel = async (
  transactions,
  category,
  formatAmount,
  { epochs = 12, cache = true, uid = null } = {}
) => {
  const { selectedCurrency } = useCurrencyStore.getState();

  // If the environment supports Web Workers, delegate heavy work to the worker so the main thread remains responsive. The worker returns the predictedValue.

  if (typeof Worker !== "undefined") {
    try {
      // Worker instance used to offload training to a module worker
      const worker = new Worker(new URL("./trainWorker.js", import.meta.url), {
        type: "module",
      });
      // Unique ID to correlate requests/responses with the worker
      const requestId = Math.random().toString(36).slice(2);

      return await new Promise((resolve) => {
        // Timeout fallback in case worker hangs
        const to = setTimeout(() => {
          worker.terminate();
          resolve(null);
        }, 30_000);

        // Message handler for worker responses
        const handler = (event) => {
          const { requestId: rid, predictedValue, error } = event.data || {};
          if (rid !== requestId) return;
          worker.removeEventListener("message", handler);
          clearTimeout(to);
          worker.terminate();

          if (error || predictedValue == null) return resolve(null);

          // Compose a standardized insight object from the predicted value
          const insight = {
            id: `tmp_${Math.random().toString(36).slice(2)}`,
            type: "forecast",
            subject: "Next month spending forecast",
            message: `You are likely to spend ${formatAmount(
              predictedValue,
              selectedCurrency
            )} on "${category}" next month`,
            category,
            actionType: "suggestion",
            actionText: `Adjust your "${category}" budget for next month.`,
            createdAt: new Date(),
            severity: "low",
            source: "ml",
            confidence: 0.8,
          };

          resolve(insight);
        };

        worker.addEventListener("message", handler);

        // Post data to worker (it will preprocess and train)
        worker.postMessage({
          requestId,
          uid,
          transactions,
          category,
          options: { epochs, cache },
        });
      });
    } catch (err) {
      console.warn(
        "Failed to use worker, falling back to inline training:",
        err
      );
    }
  }

  // Group transactions into monthly totals per category
  const grouped = preprocessTransaction(transactions);

  // Not enough data to train or predict
  if (!grouped[category] || grouped[category].length < 4) return null;

  // Numeric time series for the requested category (monthly totals)
  const series = grouped[category].map((d) => d.total);
  // Sliding-window inputs and labels for supervised training
  const inputs = [];
  const labels = [];
  for (let i = 0; i < series.length - 3; i++) {
    inputs.push(series.slice(i, i + 3));
    labels.push(series[i + 3]);
  }

  // Prepare tensors: shape [samples, 3, 1] and [samples, 1]
  const xs = tf
    .tensor2d(inputs, [inputs.length, 3])
    .reshape([inputs.length, 3, 1]);
  const ys = tf.tensor2d(labels, [labels.length, 1]);

  // IndexedDB key scoped by category (optionally include uid for per-user models)
  const modelKey = `indexeddb://forecast-model-${uid}-${category}`;
  // Model reference (may be loaded from cache)
  let model;
  try {
    if (cache) {
      // List models in IndexedDB to decide whether to load
      const models = await tf.io.listModels();
      if (models[modelKey]) {
        model = await tf.loadLayersModel(modelKey);
      }
    }
  } catch (err) {
    console.warn("Model load failed:", err);
  }

  // Create a fresh model if none was loaded
  if (!model) model = createForecastModel();

  // Train and measure time
  const start = Date.now();
  console.time(`forecast-fit-${category}`);
  await model.fit(xs, ys, { epochs, verbose: 0 });
  console.timeEnd(`forecast-fit-${category}`);

  // Save to IndexedDB for reuse
  try {
    if (cache) await model.save(modelKey);
  } catch (err) {
    console.warn("Model save failed:", err);
  }

  // Predict the next value using the last 3 points
  const last3 = series.slice(-3);
  const predTensor = model.predict(tf.tensor(last3, [1, 3, 1]));
  // Numeric predicted value extracted from tensor
  const predictedValue = (await predTensor.data())[0];

  // Dispose tensors to free memory
  tf.dispose([xs, ys, predTensor]);

  // Return a standardized insight object (includes provenance and timing)
  return {
    id: `tmp_${Math.random().toString(36).slice(2)}`,
    type: "forecast",
    subject: "Next month spending forecast",
    message: `You are likely to spend ${formatAmount(
      predictedValue,
      selectedCurrency
    )} on "${category}" next month`,
    category,
    actionType: "suggestion",
    actionText: `Adjust your "${category}" budget for next month.`,
    createdAt: new Date(),
    status: "low",
    severity: "low",
    meta: { durationMs: Date.now() - start },
    source: "ml",
    confidence: 0.8,
  };
};
