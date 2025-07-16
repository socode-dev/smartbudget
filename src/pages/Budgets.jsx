import React from "react";
import { HiOutlineTrash, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi";

const Budgets = () => (
  <main className="p-4">
    <h2 className="text-2xl font-semibold mb-2">Budgets</h2>
    <p className="text-sm text-[rgb(var(--color-muted))] mb-6">
      Monitor and manage your category limits
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Groceries Category */}
      <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2 grow">
          <h3 className="text-lg font-semibold">Groceries</h3>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Limit: <strong>$500.00</strong>
          </p>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Spent: <strong>$400.00</strong>
          </p>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Remaining: <strong>$100.00</strong>
          </p>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[rgb(var(--color-gray-border))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--color-brand))] rounded-full transition-all duration-500 ease-in-out"
              style={{ width: "80%" }}
            ></div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="text-sm text-blue-500 hover:text-blue-600 transition cursor-pointer">
            <HiOutlinePencil className="text-lg" />
          </button>
          <button className="text-sm text-red-500 hover:text-red-600 transition cursor-pointer">
            <HiOutlineTrash className="text-lg" />
          </button>
        </div>
      </div>

      {/* Transport Card */}
      <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2 grow">
          <h3 className="text-lg font-semibold">Transport</h3>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Limit: <strong>$150.00</strong>
          </p>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Spent: <strong>$160.00</strong>
          </p>
          <p className="text-sm text-[rgb(var(--color-muted))]">
            Over by: <strong>$10.00</strong>
          </p>
          {/* Progress Bar */}
          <div className="w-full h-3 bg-[rgb(var(--color-gray-border))] rounded-full overflow-hidden">
            <div
              className="h-full bg-[rgb(var(--color-brand))] rounded-full transition-all duration-500 ease-in-out"
              style={{ width: "106%" }}
            ></div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="text-sm text-blue-500 hover:text-blue-600 transition cursor-pointer">
            <HiOutlinePencil className="text-lg" />
          </button>
          <button className="text-sm text-red-500 hover:text-red-600 transition cursor-pointer">
            <HiOutlineTrash className="text-lg" />
          </button>
        </div>
      </div>

      {/* End of Budgets */}
    </div>

    <div className="mt-6 flex flex-col items-center w-full">
      <p className="text-base text-[rgb(var(--color-muted))] mb-6">
        You have not added any budgets yet.
      </p>
      <button className="bg-blue-500 text-sm font-medium text-white px-4 py-1.5 md:py-2 rounded-md cursor-pointer hover:bg-blue-600 transition flex items-center gap-2">
        <HiOutlinePlus />
        Add Your First Budget
      </button>
    </div>
  </main>
);

export default Budgets;
