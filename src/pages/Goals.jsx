import React from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import CircularProgress from "../components/ui/CircularProgress";
import { useModalContext } from "../context/ModalContext";

const Goals = () => {
  const { onOpenModal } = useModalContext();

  const handleAddGoal = () => {
    onOpenModal("goal");
  };

  const handleAddContribution = () => {
    onOpenModal("contribution");
  };

  return (
    <main className="p-4">
      <h2 className="text-2xl font-semibold mb-2">Goals</h2>
      <p className="text-base text-[rgb(var(--color-muted))] mb-6">
        Stay focused on what you are saving for.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Emergency Fund */}
        <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg flex flex-col gap-6">
          {/* Goal details */}
          <div className="grow shrink-0 flex justify-between items-start gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 grow">
                <h3 className="text-lg font-semibold">Emergency Fund</h3>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Target: <strong>$3,000.00</strong>
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Saved: <strong>$1,000.00</strong>
                </p>
              </div>
              {/* Progress bar */}
              <div className="flex items-center ">
                <CircularProgress progress={13.65} />
              </div>

              {/* Due date */}
              <p className="text-sm text-[rgb(var(--color-muted))]">
                Due date: <strong>July 31, 2025</strong>
              </p>
            </div>

            {/* Edit and delete buttons */}
            <div className="flex justify-end gap-4">
              <button className="text-lg text-blue-500 hover:text-blue-600 transition cursor-pointer">
                <HiOutlinePencil />
              </button>
              <button className="text-lg text-red-500 hover:text-red-600 transition cursor-pointer">
                <HiOutlineTrash />
              </button>
            </div>
          </div>

          {/* Add contribution button */}
          <button
            onClick={handleAddContribution}
            className="border-green-500 border bg-green-50 text-sm font-medium text-[rgb(var(--color-text))] px-4 py-1.5 md:py-2 rounded-md cursor-pointer hover:bg-green-500 hover:text-white transition flex justify-center items-center gap-2"
          >
            <HiOutlinePlus />
            Add Contribution
          </button>
        </div>

        {/* Vacation */}
        <div className="bg-[rgb(var(--color-bg-card))] p-4 rounded-lg flex flex-col gap-6">
          <div className="flex justify-between items-start gap-4">
            {/* Goal details */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 grow">
                <h3 className="text-lg font-semibold">Vacation</h3>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Target: <strong>$2,500.00</strong>
                </p>
                <p className="text-sm text-[rgb(var(--color-muted))]">
                  Saved: <strong>$1,950.00</strong>
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex items-center">
                <CircularProgress progress={68} />
              </div>

              {/* Due date */}
              <p className="text-sm text-[rgb(var(--color-muted))]">
                Due date: <strong>August 31, 2025</strong>
              </p>
            </div>

            {/* Edit and delete buttons */}
            <div className="flex justify-end gap-4">
              <button className="text-lg text-blue-500 hover:text-blue-600 transition cursor-pointer">
                <HiOutlinePencil />
              </button>
              <button className="text-lg text-red-500 hover:text-red-600 transition cursor-pointer">
                <HiOutlineTrash />
              </button>
            </div>
          </div>

          {/* Add contribution button */}
          <button className="border-green-500 border bg-green-50 text-sm font-medium text-[rgb(var(--color-text))] px-4 py-1.5 md:py-2 rounded-md cursor-pointer hover:bg-green-500 hover:text-white transition flex justify-center items-center gap-2">
            <HiOutlinePlus />
            Add Contribution
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <p className="text-base text-[rgb(var(--color-muted))] mb-6">
          You have not added any goals yet.
        </p>
        <button
          onClick={handleAddGoal}
          className="bg-blue-500 text-sm font-medium text-white px-4 py-1.5 md:py-2 rounded-md cursor-pointer hover:bg-blue-600 transition flex items-center gap-2"
        >
          <HiOutlinePlus />
          Add Your First Goal
        </button>
      </div>
    </main>
  );
};

export default Goals;
