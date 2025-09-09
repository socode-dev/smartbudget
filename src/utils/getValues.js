export const getThresholdsValue = (getValues) => {
  return {
    transactionThreshold: getValues("transactionThreshold"),
    budgetThreshold50: getValues("budgetThreshold50"),
    budgetThreshold80: getValues("budgetThreshold80"),
    budgetThreshold100: getValues("budgetThreshold100"),
    goalThreshold50: getValues("goalThreshold50"),
    goalThreshold80: getValues("goalThreshold80"),
    goalThreshold100: getValues("goalThreshold100"),
  };
};
