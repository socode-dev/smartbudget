import useTransactionStore from "../store/useTransactionStore";
import useCurrencyStore from "../store/useCurrencyStore";

import { detectAnomalies } from "./anomalyDetection";
import { buildBudgetComplianceData } from "./budgetData";
import { buildCashFlowData } from "./cashFlowData";
import {buildRiskData} from "./riskData";

import { fetchInsight } from "./fetchInsight";

export const generateInsight = async ({ userId, transactions, budgets}) => {
  const { selectedCurrency } = useCurrencyStore.getState();

  
  // Detect anomalies
  const anomalies = detectAnomalies(transactions);
  
  const budgetComplianceList = [];
  // Build budget compliance
  for(const budget of budgets) {
    const complianceData = buildBudgetComplianceData(budget, transactions, selectedCurrency); 

    if (complianceData.derived.compliance_status === "ON_TRACK") continue;
    budgetComplianceList.push(complianceData);
    
  }
  
  // Build cash flow forecast data
  const cashflowData = buildCashFlowData(transactions, selectedCurrency);
  
    // Build risk data
    const riskData = buildRiskData(anomalies, budgetComplianceList, cashflowData, transactions);

    try {
      const insights = await fetchInsight({userId, riskData, anomalies, budgetComplianceList, cashflowData });
      
      console.log(insights)
    } catch (err) {
      console.error("Error:", err);
    }

};
