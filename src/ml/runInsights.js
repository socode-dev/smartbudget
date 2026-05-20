import useTransactionStore from "../store/useTransactionStore";
import useCurrencyStore from "../store/useCurrencyStore";

import { triggerAnomalyTransactional } from "./anomaly/triggerAnomaly";
import { detectAnomalies } from "./anomaly/anomalyDetection";
import { runAnomalyAgent } from "./agent/anomalyAgent";

import { triggerBudgetComplianceTransactional } from "./budget/triggerBudget";
import { buildBudgetComplianceData } from "./budget/budgetData";
import { runBudgetAgent } from "./agent/budgetAgent";

import { buildCashFlowData } from "./forecast/cashFlowData";
import { runCashFlowAgent } from "./agent/cashFlowAgent";
import { triggerCashFlowTransactional } from "./forecast/triggerCashFlow";

import {buildFinancialRiskData} from "./financial-risk/financialRiskData";
import {triggerRiskTransactional} from "./financial-risk/triggerFinancialRisk"
import { runFinancialRiskAgent } from "./agent/financialRiskAgent";

export const generateInsight = async (uid, transactions) => {
  const { budgets } = useTransactionStore.getState();
  const { selectedCurrency } = useCurrencyStore.getState();

  const processedInsights = [];


  // Detect anomalies
  const anomalies = detectAnomalies(transactions);

  const budgetComplianceList = [];

  // Atomically check and trigger anomalies
  for (const anomaly of anomalies) {
    try {
      const triggerResult = await triggerAnomalyTransactional(uid, anomaly);

      if(triggerResult.triggered){
      
        const anomalyInsight = await runAnomalyAgent(anomaly, uid);
        
      if (anomalyInsight) {
        processedInsights.push(anomalyInsight);
      }
    }
    } catch (err) {
      throw err;
    }
  }

  // Atomically check and trigger budget compliance
  for(const budget of budgets) {
    const complianceData = buildBudgetComplianceData(budget, transactions, selectedCurrency); 
    budgetComplianceList.push(complianceData);
    
    try {
      const triggerResult = await triggerBudgetComplianceTransactional(uid, complianceData);

      if(!triggerResult.triggered) continue;

        const budgetInsight = await runBudgetAgent(complianceData, uid);

      if(budgetInsight) processedInsights.push(budgetInsight);
    } catch (err) {
      throw err;
    }

  }

  // Trigger cash flow forecast
    const cashFlowData = buildCashFlowData(transactions, selectedCurrency);

    try {
      const triggerResult = await triggerCashFlowTransactional(uid, cashFlowData);

      if(cashFlowData.outcome !== "SAFE" && triggerResult.triggered) {

      const cashFlowInsight = await runCashFlowAgent(cashFlowData, uid)
      if(cashFlowInsight) processedInsights.push(cashFlowInsight);
      }
    } catch (err) {
      throw err
    }

    // Trigger financial risk insight
    const financialRiskData = buildFinancialRiskData(anomalies, budgetComplianceList, cashFlowData, transactions);

    if(Boolean(financialRiskData)) {
      const {score, level} = financialRiskData.risk;

      try {
        const triggerResult = await triggerRiskTransactional(uid, score, level);
  
        if(triggerResult.triggered) {
          const riskInsight = await runFinancialRiskAgent(financialRiskData, uid);
        
        if(riskInsight) processedInsights.push(riskInsight);
      }
      } catch (error) {
        throw error;
      }
    }
    
  
  return processedInsights;


};
