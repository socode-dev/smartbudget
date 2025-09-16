import * as tf from "@tensorflow/tfjs";
import { createForecastModel } from "./forecastModel";
import { preprocessTransaction } from "./preprocessTransactions";

// Web Worker entrypoint for training forecast models off the main thread.
// Input message shape: { requestId, uid, transactions, category, options }
// Output message shape: { requestId, uid, category, predictedValue, durationMs, error }

// Message listener that orchestrates preprocess -> train -> predict in the worker
self.addEventListener("message", async (event) => {
  // Destructure incoming message fields
  const {
    requestId,
    uid,
    transactions,
    category,
    options = {},
  } = event.data || {};

  // Treat cache as enabled by default
  const cache = options.cache ?? true;

  try {
    // Training start timestamp for benchmarking
    const start = Date.now();

    // Preprocess into monthly series per category (same logic as main thread)
    const grouped = preprocessTransaction(transactions);
    // Not enough data to train/predict -> respond with null prediction
    if (!grouped[category] || grouped[category].length < 4) {
      // console.log(`Not enough data to train model for ${category}`);

      self.postMessage({
        requestId,
        uid,
        category,
        predictedValue: null,
        durationMs: Date.now() - start,
      });
      return;
    }

    // Build numeric series and sliding-window training pairs
    const series = grouped[category].map((data) => data.total);
    const inputs = [];
    const labels = [];
    for (let i = 0; i < series.length - 3; i++) {
      inputs.push(series.slice(i, i + 3));
      labels.push(series[i + 3]);
    }

    // Tensor inputs/labels
    const xs = tf
      .tensor2d(inputs, [inputs.length, 3])
      .reshape([inputs.length, 3, 1]);
    const ys = tf.tensor2d(labels, [labels.length, 1]);

    // IndexedDB model key scoped by uid + category
    const modelKey = `indexeddb://forecast-model-${uid}-${category}`;
    // Model reference (may be loaded from cache)
    let model;
    try {
      if (!cache) throw Error("Model not cached");
      // List models in IndexedDB and load if present
      const models = await tf.io.listModels();
      if (models[modelKey]) model = await tf.loadLayersModel(modelKey);
    } catch (err) {
      // ignore load failures and continue with a fresh model
      console.warn("Worker: model load failed", err);
    }

    // Create a fresh model if none loaded
    if (!model) model = createForecastModel();

    model.compile({
      optimizer: "adam",
      loss: "meanSquaredError",
      metrics: ["mae"],
    });

    // Train the model with provided epochs
    await model.fit(xs, ys, { epochs: options.epochs || 12, verbose: 0 });

    // Save trained model to IndexedDB if caching enabled
    try {
      if (cache) await model.save(modelKey);
      // console.log("Model cached");
    } catch (err) {
      console.warn("Worker: model save failed", err);
    }

    // Predict using last 3 points
    const last3 = series.slice(-3);
    const predTensor = model.predict(tf.tensor(last3, [1, 3, 1]));
    // Extract numeric prediction
    const predictedValue = (await predTensor.data())[0];

    // console.log(
    //   `Worker: Training completed for ${category}, predicted value: ${predictedValue}`
    // );

    // Dispose tensors to free memory
    tf.dispose([xs, ys, predTensor]);

    // Respond with prediction and duration
    const durationMs = Date.now() - start;
    self.postMessage({ requestId, uid, category, predictedValue, durationMs });
  } catch (error) {
    // console.log(`Worker: Training failed or ${category}:`, error);
    // On error, respond with error message for diagnostics
    self.postMessage({
      requestId,
      uid,
      category,
      predictedValue: null,
      durationMs: 0,
      error: (error && error.message) || String(error),
    });
  }
});

// Default export for bundlers that expect a module export from worker files
export default null;
