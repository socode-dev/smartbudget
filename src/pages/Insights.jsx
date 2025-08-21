import React from "react";
import { FaArrowRight, FaBell } from "react-icons/fa";
import ScrollToTop from "../layout/ScrollToTop";

const Insights = () => {
  return (
    <main className="px-5 md:px-10 py-8">
      <ScrollToTop />
      <h2 className="text-3xl md:text-4xl font-semibold mb-2">
        Smart Insights
      </h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-10">
        Personalized suggestions, forecasts and savings tips.
      </p>

      {/* Smart Insights */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Insight 1 */}
      {/* <div className="flex flex-col gap-4 bg-blue-50 p-4 rounded-lg shadow-md border border-blue-200">
          <p className="text-base text-[rgb(var(--color-muted))]">
            You are spending 23% more on Dining this month.
          </p>
          <p className="text-base text-[rgb(var(--color-muted))]">
            <strong>Suggested:</strong> Set a category limit of $150
          </p>
          <button className="w-fit bg-blue-500 hover:bg-blue-600 transition text-base text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
            Set Limit
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div> */}
      {/* Insight 2 */}
      {/* <div className="flex flex-col gap-4 bg-indigo-50 p-4 rounded-lg shadow-md border border-indigo-200">
          <p className="text-base text-[rgb(var(--color-muted))]">
            <strong>Forecast:</strong> You may spend $460 on Transport next
            month.
          </p>
          <p className="text-base text-[rgb(var(--color-muted))]">
            <strong>Tip:</strong> Reduce usage to stay under budget.
          </p>
          <button className="w-fit bg-indigo-500 hover:bg-indigo-600 transition text-base text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
            Adjust Budget
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div> */}
      {/* Insight 3 */}
      {/* <div className="flex flex-col gap-4 bg-green-50 p-4 rounded-lg shadow-md border border-green-200">
          <p className="text-base text-[rgb(var(--color-muted))]">
            Canceling Spotify and Apple TV could save you $28/month.
          </p>
          <button className="w-fit bg-green-500 hover:bg-green-600 transition text-base text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
            Review Subscription
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div> */}
      {/* Insight 4 */}
      {/* <div className="flex flex-col gap-4 p-4 bg-red-50 rounded-lg shadow-md border border-red-200">
          <p className="grow text-base text-[rgb(var(--color-muted))]">
            You are on track to overspend in Groceries.
          </p>
          <button className="w-fit bg-red-500 hover:bg-red-600 transition text-base text-white px-4 py-2 rounded-md cursor-pointer flex items-center gap-2">
            Enable Alerts
            <FaBell className="w-4 h-4" />
          </button>
        </div>
      </div> */}

      {/* Empty State */}
      {/* <div className="flex justify-center mt-10">
        <p className="text-base text-[rgb(var(--color-muted))]">
          Nothing to show right now. <br />
          SmartBudget will generate insights as your data grows.
        </p>
      </div> */}

      <p className="text-4xl text-[rgb(var(--color-muted))] text-center">
        Coming Soon!
      </p>
    </main>
  );
};

export default Insights;
