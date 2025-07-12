import {
  FaUtensils,
  FaTruck,
  FaDollarSign,
  FaShoppingCart,
} from "react-icons/fa";

const InsightCards = () => {
  return (
    <>
      {/* Spending Insight */}
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="flex justify-center">
          <FaUtensils className="w-6 h-6 text-[rgb(var(--color-brand))]" />
        </div>
        <p className="text-sm font-medium">
          You have spent 22% more on Dining this month.
        </p>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          <b>Suggested:</b> Set a category limit
        </p>

        <button className="bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] transition text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer">
          Set Budget
        </button>
      </div>

      {/* Forecast Insight */}
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="flex justify-center">
          <FaTruck className="w-6 h-6 text-[rgb(var(--color-brand))]" />
        </div>
        <p className="text-sm font-medium">
          <b>Forecast:</b> Transport may cost up to $430 next month.
        </p>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          <b>Tips:</b> Reduce non-essential trips
        </p>

        <button className="bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] transition text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer">
          Adjust Transport Budget
        </button>
      </div>

      {/* Savings Insight */}
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="flex justify-center">
          <FaDollarSign className="w-6 h-6 text-[rgb(var(--color-brand))]" />
        </div>
        <p className="text-sm font-medium">
          You could save $42/month by cancelling subscriptions.
        </p>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          <b>Review:</b> Apple TV, Spotify
        </p>

        <button className="bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] transition text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer">
          Review Subscriptions
        </button>
      </div>

      {/* Grocery Insight */}
      <div className="bg-[rgb(var(--color-bg-card))] rounded-lg shadow p-4 flex flex-col gap-4">
        <div className="flex justify-center">
          <FaShoppingCart className="w-6 h-6 text-[rgb(var(--color-brand))]" />
        </div>
        <p className="text-sm font-medium">
          Grocery cost have risen 3 months in a row.
        </p>
        <p className="text-sm text-[rgb(var(--color-muted))]">
          <b>Tips:</b> Set alerts when exceeding $400
        </p>

        <button className="bg-[rgb(var(--color-brand))] hover:bg-[rgb(var(--color-brand-hover))] transition text-white text-sm font-medium px-4 py-2 rounded-md cursor-pointer">
          Enable Spending Alert
        </button>
      </div>
    </>
  );
};

export default InsightCards;
