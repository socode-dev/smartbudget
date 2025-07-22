import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import { ModalProvider } from "./context/ModalContext";
import { FormProvider } from "./context/FormContext";
import useTransactionStore from "./store/useTransactionStore";

const Overview = lazy(() => import("./pages/Overview"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Reports = lazy(() => import("./pages/Reports"));
const Goals = lazy(() => import("./pages/Goals"));
const Insights = lazy(() => import("./pages/Insights"));

function App() {
  const { loadTransactions } = useTransactionStore();

  useEffect(() => {
    let isMounted = true;
    const load = () => {
      const labels = ["transactions", "budgets", "goals"];
      labels.forEach(async (label) => {
        await loadTransactions(label);
      });
    };
    load();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <FormProvider>
          <ModalProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Overview />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="reports" element={<Reports />} />
                <Route path="goals" element={<Goals />} />
                <Route path="insights" element={<Insights />} />
              </Route>
            </Routes>
          </ModalProvider>
        </FormProvider>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
