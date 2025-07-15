import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
// import { TransactionProvider } from "./context/TransactionContext";

const Overview = lazy(() => import("./pages/Overview"));
const Transactions = lazy(() => import("./pages/Transactions"));
const Budgets = lazy(() => import("./pages/Budgets"));
const Reports = lazy(() => import("./pages/Reports"));
const Goals = lazy(() => import("./pages/Goals"));
const Insights = lazy(() => import("./pages/Insights"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        {/* <TransactionProvider> */}
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
        {/* </TransactionProvider> */}
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
