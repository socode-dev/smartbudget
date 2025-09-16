import { generateInsight } from "./runInsights";
import { formatAmount } from "../utils/formatAmount";
import useInsightsStore from "../store/useInsightsStore";

// Generate realistic dummy transaction data
export const generateDummyTransactions = (count = 100, monthsBack = 12) => {
  const transactions = [];
  const categories = [
    "Groceries",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Shopping",
    "Dining",
    "Education",
    "Travel",
    "Insurance",
    "Rent",
    "Gas",
    "Phone",
    "Internet",
    "Gym",
    "Books",
  ];

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  for (let i = 0; i < count; i++) {
    const randomDate = new Date(
      startDate.getTime() + Math.random() * (Date.now() - startDate.getTime())
    );

    const category = categories[Math.floor(Math.random() * categories.length)];

    // Generate realistic amounts based on category
    let baseAmount;
    switch (category) {
      case "Groceries":
        baseAmount = Math.random() * 200 + 50; // $50-$250
        break;
      case "Rent":
        baseAmount = Math.random() * 500 + 1000; // $1000-$1500
        break;
      case "Transportation":
        baseAmount = Math.random() * 100 + 20; // $20-$120
        break;
      case "Dining":
        baseAmount = Math.random() * 80 + 15; // $15-$95
        break;
      case "Entertainment":
        baseAmount = Math.random() * 150 + 25; // $25-$175
        break;
      case "Utilities":
        baseAmount = Math.random() * 200 + 80; // $80-$280
        break;
      default:
        baseAmount = Math.random() * 300 + 20; // $20-$320
    }

    const amount = Math.round(baseAmount * 100) / 100;

    transactions.push({
      id: `dummy_${i + 1}`,
      amount: amount,
      category: category,
      categoryKey: category.toLowerCase().replace(/\s+/g, "_"),
      date: randomDate.toISOString(),
      description: `Dummy ${category.toLowerCase()} transaction`,
      type: "expense",
    });
  }

  // Sort by date
  return transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Generate some anomalies by creating unusually high spending months
// export const addAnomaliesToData = (transactions, anomalyCount = 3) => {
//   const categories = [...new Set(transactions.map((t) => t.category))];
//   const modifiedTransactions = [...transactions];

//   for (let i = 0; i < anomalyCount; i++) {
//     const category = categories[Math.floor(Math.random() * categories.length)];
//     const randomTransaction = modifiedTransactions.find(
//       (t) => t.category === category
//     );

//     if (randomTransaction) {
//       // Create a high-value transaction to trigger anomaly detection
//       const anomalyTransaction = {
//         ...randomTransaction,
//         id: `anomaly_${i + 1}`,
//         amount: randomTransaction.amount * (3 + Math.random() * 5), // 3-8x normal amount
//         description: `Anomaly: High ${category.toLowerCase()} spending`,
//         date: new Date(randomTransaction.date).toISOString(),
//       };

//       modifiedTransactions.push(anomalyTransaction);
//     }
//   }

//   return modifiedTransactions.sort(
//     (a, b) => new Date(a.date) - new Date(b.date)
//   );
// };

// // Modified function to test ML pipeline with dummy data
// export const testMLPipeline = async (uid, options = {}) => {
//   const {
//     transactionCount = 100,
//     monthsBack = 12,
//     includeAnomalies = true,
//     anomalyCount = 3,
//     currency = "USD",
//   } = options;

//   console.log("🤖 Starting ML Pipeline Test with Dummy Data...");

//   // Generate dummy data
//   let dummyTransactions = generateDummyTransactions(
//     transactionCount,
//     monthsBack
//   );
//   console.log("Generated transactions:", dummyTransactions);

//   if (includeAnomalies) {
//     dummyTransactions = addAnomaliesToData(dummyTransactions, anomalyCount);
//     console.log(
//       ` Generated ${dummyTransactions.length} transactions with ${anomalyCount} anomalies`
//     );
//   } else {
//     console.log(` Generated ${dummyTransactions.length} transactions`);
//   }

//   // Get formatted amount function
//   const formattedAmount = formatAmount(currency);

//   // Get current insights count before generation
//   const { insights: beforeInsights } = useInsightsStore.getState();
//   const beforeCount = beforeInsights.length;
//   console.log(`Insights before generation: ${beforeCount}`);

//   // Generate insights using existing ML pipeline
//   console.log("🧠 Running ML insights generation...");
//   const startTime = Date.now();

//   try {
//     // generateInsight doesn't return anything, it adds to store
//     await generateInsight(uid, dummyTransactions, formattedAmount);

//     // Wait longer and poll for new insights
//     let attempts = 0;
//     const maxAttempts = 40; // 10 seconds total
//     let newInsights = [];

//     while (attempts < maxAttempts) {
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       const { insights: afterInsights } = useInsightsStore.getState();
//       newInsights = afterInsights.slice(beforeCount);

//       console.log(
//         `Attempt ${attempts + 1}: Found ${newInsights.length} new insights`
//       );

//       // If we have new insights, break
//       if (newInsights.length > 0) {
//         break;
//       }

//       attempts++;
//     }

//     console.log(newInsights);
//     console.log(
//       `Total insights in store: ${useInsightsStore.getState().insights.length}`
//     );
//     console.log(`New insights generated: ${newInsights.length}`);

//     const duration = Date.now() - startTime;

//     console.log(`✅ ML Pipeline test completed in ${duration}ms`);
//     console.log(" Check your Insights page to see the generated insights!");

//     return {
//       success: true,
//       transactionCount: dummyTransactions.length,
//       duration,
//       newInsightsCount: newInsights.length,
//       newInsights: newInsights,
//       message: "ML pipeline test completed successfully!",
//     };
//   } catch (error) {
//     console.error("❌ ML Pipeline test failed:", error);
//     return {
//       success: false,
//       error: error.message,
//       message: "ML pipeline test failed!",
//     };
//   }
// };

// // Add this function to test without deduplication
// export const testMLPipelineDirect = async (uid, options = {}) => {
//   const {
//     transactionCount = 100,
//     monthsBack = 12,
//     includeAnomalies = true,
//     anomalyCount = 3,
//     currency = "USD",
//   } = options;

//   console.log("🤖 Starting Direct ML Pipeline Test...");

//   // Generate dummy data
//   let dummyTransactions = generateDummyTransactions(
//     transactionCount,
//     monthsBack
//   );

//   if (includeAnomalies) {
//     dummyTransactions = addAnomaliesToData(dummyTransactions, anomalyCount);
//   }

//   console.log(`Generated ${dummyTransactions.length} transactions`);

//   // Test anomaly detection directly
//   const { detectAnomalies } = await import("../ml/anomalyDetection");
//   const anomalies = detectAnomalies(dummyTransactions);
//   console.log("Anomalies found:", anomalies);

//   // Test forecast training directly
//   const { trainForecastModel } = await import("../ml/trainForecastModel");
//   const formattedAmount = formatAmount(currency);

//   const categories = [...new Set(dummyTransactions.map((t) => t.category))];
//   console.log("Categories found:", categories);

//   const forecasts = [];
//   for (const category of categories) {
//     try {
//       const forecast = await trainForecastModel(
//         dummyTransactions,
//         category,
//         formattedAmount,
//         { epochs: 12, cache: false, uid: uid }
//       );
//       if (forecast) {
//         forecasts.push(forecast);
//         console.log(`Forecast for ${category}:`, forecast);
//       }
//     } catch (error) {
//       console.warn(`Forecast failed for ${category}:`, error);
//     }
//   }

//   console.log("All forecasts:", forecasts);

//   return {
//     success: true,
//     anomalies: anomalies,
//     forecasts: forecasts,
//     totalInsights: anomalies.length + forecasts.length,
//   };
// };

// // Quick test function for console usage
// export const quickTest = async (uid) => {
//   return await testMLPipeline(uid, {
//     transactionCount: 50,
//     monthsBack: 6,
//     includeAnomalies: true,
//     anomalyCount: 2,
//   });
// };
