// import { useState, useEffect } from "react";
import SummaryCards from "../components/overview/SummayCards";
import Charts from "../components/overview/Charts";
import SmartInsight from "../components/overview/SmartInsight";
import BudgetOverview from "../components/overview/BudgetOverview";
import QuickActions from "../components/overview/QuickActions";
import AddExpense from "../components/modals/AddExpense";
import { Toaster } from "react-hot-toast";
import useTransactionStore from "../store/useTransactionStore";

const Overview = () => {
  const { displayModal } = useTransactionStore();

  return (
    <main className="flex flex-col gap-16 pb-8">
      <Toaster />
      <div className="flex flex-col gap-2 md:gap-3 lg:gap-4 mt-4">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[rgb(var(--color-<h2>Welcome back, Guest</h2>
      text))]"
        >
          Welcome back, Guest
        </h2>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          Here is a quick summary of your financial activity this month. You
          have spent less than usual and your savings are ahead of schedule.
        </p>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCards />
      </section>

      <section>
        <Charts />
      </section>

      <section>
        <SmartInsight />
      </section>

      <section>
        <BudgetOverview />
      </section>

      <section>
        <QuickActions />
      </section>

      {displayModal && <AddExpense />}
    </main>
  );
};

export default Overview;
