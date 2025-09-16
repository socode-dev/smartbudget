import * as tf from "@tensorflow/tfjs";

export const createForecastModel = ({ units = 8, l2 = 0.01 } = {}) => {
  const model = tf.sequential();

  // Flatten the 3x1 input into a simple vector and apply a small dense layer
  model.add(tf.layers.flatten({ inputShape: [3, 1] }));
  model.add(
    tf.layers.dense({
      units,
      activation: "relu",
      kernelRegularizer: tf.regularizers.l2({ l2 }),
    })
  );

  // Another layer for better learning
  model.add(
    tf.layers.dense({
      units: Math.max(4, Math.floor(units / 2)),
      activation: "relu",
    })
  );

  // Final regression output with ReLU activitation to ensure positive values
  model.add(tf.layers.dense({ units: 1, activation: "relu" }));

  model.compile({
    optimizer: "adam",
    loss: "meanSquaredError",
    metrics: ["mae"],
  });

  return model;
};
