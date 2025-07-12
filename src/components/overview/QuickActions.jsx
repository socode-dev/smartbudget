import { FiPlus, FiTarget, FiDownload } from "react-icons/fi";

const QuickActions = () => {
  return (
    <>
      <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
      <p className="text-sm text-[rgb(var(--color-muted))]">
        Take control of your finances with just one click.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between gap-4 mt-10">
        <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex items-center gap-2">
          <FiTarget className="w-4 h-4" />
          <span>Set Budget</span>
        </button>

        <button className="bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition cursor-pointer flex items-center gap-2">
          <FiDownload className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </>
  );
};

export default QuickActions;
