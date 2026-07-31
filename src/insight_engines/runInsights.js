import useTransactionStore from "../store/useTransactionStore";
import useCurrencyStore from "../store/useCurrencyStore";

import { detectAnomalies } from "./anomalyDetection";
import { buildBudgetComplianceData } from "./budgetData";
import { buildCashFlowData } from "./cashFlowData";
import {buildRiskData} from "./riskData";

import { fetchInsight } from "./fetchInsight";

export const generateInsight = async ({ userId, transactions, budgets}) => {
  const { selectedCurrency } = useCurrencyStore.getState();

  const anomalies = detectAnomalies(transactions);
  
  const budgetComplianceList = [];
  
  for(const budget of budgets) {
    const complianceData = buildBudgetComplianceData(budget, transactions, selectedCurrency); 

    if (complianceData.derived.compliance_status === "ON_TRACK") continue;
    budgetComplianceList.push(complianceData);
    
  }
  
  const cashflowData = buildCashFlowData(transactions, selectedCurrency);
  
    const riskData = buildRiskData(anomalies, budgetComplianceList, cashflowData, transactions);

    try {
      await fetchInsight({userId, riskData, anomalies, budgetComplianceList, cashflowData });
      
    } catch (err) {
      console.error("Error:", err);
    }

};
