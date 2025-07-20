import { createContext, useContext, useMemo } from "react";
import useSmartForm from "../hooks/useSmartForm";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
  const transactions = useSmartForm("transactions");
  const budgets = useSmartForm("budgets");
  const goals = useSmartForm("goals");
  const contributions = useSmartForm("contributions");

  const forms = { transactions, budgets, goals, contributions };

  return <FormContext.Provider value={forms}>{children}</FormContext.Provider>;
};

export const useFormContext = (label) => {
  const forms = useContext(FormContext);
  if (!forms[label])
    throw new Error("useFormContext must be used within a FormProvider");

  return forms[label];
};
