import { FaUndo } from "react-icons/fa";
import { useMainContext } from "../../context/MainContext";
import useThresholdForm from "../../hooks/useThresholdForm";
import { defaultThresholds } from "../../schema/thresholdSchemas";
import useThresholdStore from "../../store/useThresholdStore";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import LoadingSpinner from "../ui/LoadingSpinner";

const Preferences = () => {
  const { currentUser } = useAuthContext();
  const { isPreferencesOpen, handlePreferencesClose } = useMainContext();
  const { register, errors, isSubmitting, handleSubmit, reset, setValue } =
    useThresholdForm();
  const { updateThresholds, thresholds } = useThresholdStore();

  if (!isPreferencesOpen) return null;

  const onSubmit = async (data) => {
    console.log(data);
    try {
      if (currentUser?.uid) {
        await updateThresholds(currentUser.uid, data);
        handlePreferencesClose();
        toast.success("Thresholds updated successfully");

        setValue("transactionThreshold", data.transactionThreshold);
        setValue("budgetThreshold50", data.budgetThreshold50);
        setValue("budgetThreshold80", data.budgetThreshold80);
        setValue("budgetThreshold100", data.budgetThreshold100);
        setValue("goalThreshold50", data.goalThreshold50);
        setValue("goalThreshold80", data.goalThreshold80);
        setValue("goalThreshold100", data.budgetThreshold100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    reset(defaultThresholds);
  };

  const onClose = () => {
    handlePreferencesClose();

    if (thresholds) {
      setValue("transactionThreshold", thresholds.transactionThreshold);
      setValue("budgetThreshold50", thresholds.budgetThreshold50);
      setValue("budgetThreshold80", thresholds.budgetThreshold80);
      setValue("budgetThreshold100", thresholds.budgetThreshold100);
      setValue("goalThreshold50", thresholds.goalThreshold50);
      setValue("goalThreshold80", thresholds.goalThreshold80);
      setValue("goalThreshold100", thresholds.goalThreshold100);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-black/30 z-60" />

      <div
        role="dialog"
        className="w-full fixed inset-0 flex items-center justify-center z-70 p-4"
      >
        <section className="bg-[rgb(var(--color-bg-card))] w-full sm:w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/6 h-2/3 max-w-md overflow-y-auto p-6 rounded-lg shadow-xl flex flex-col">
          <h3 className="text-2xl text-[rgb(var(--color-text))] text-center font-semibold">
            Notification Preferences
          </h3>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full mt-6 flex flex-col"
          >
            {/* Transaction threshold */}
            <fieldset className="w-full border-b-2 border-[rgb(var(--color-gray-bg))] py-4">
              <legend className="text-xl font-medium text-[rgb(var(--color-text))]">
                Transaction Alert
              </legend>

              <div className="flex justify-between">
                <label
                  htmlFor="transactionThreshold"
                  className="text-base font-medium text-[rgb(var(--color-muted))]"
                >
                  Large Expense Threshold
                </label>

                <input
                  {...register("transactionThreshold")}
                  type="number"
                  name="transactionThreshold"
                  id="transactionThreshold"
                  className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                />
              </div>

              {errors.transactionThreshold && (
                <p className="text-[13px] text-red-500 mt-1">
                  {errors.transactionThreshold.message}
                </p>
              )}
            </fieldset>

            {/* Budget thresholds */}
            <fieldset className="w-full border-b-2 border-[rgb(var(--color-gray-bg))] py-4 mt-4 flex flex-col gap-y-2">
              <legend className="text-xl font-medium text-[rgb(var(--color-text))]">
                Budget Threshold
              </legend>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="budgetThreshold50"
                    className="text-base font-medium text-[rgb(var(--color-muted))]"
                  >
                    Alert when budget reaches %
                  </label>
                  <input
                    {...register("budgetThreshold50")}
                    type="number"
                    name="budgetThreshold50"
                    id="budgetThreshold50"
                    className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                  />
                </div>
                {errors.budgetThreshold50 && (
                  <p className="text-[13px] text-red-500 mt-1">
                    {errors.budgetThreshold50.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="budgetThreshold80"
                    className="text-base font-medium text-[rgb(var(--color-muted))]"
                  >
                    Alert when budget reaches %
                  </label>

                  <input
                    {...register("budgetThreshold80")}
                    type="number"
                    name="budgetThreshold80"
                    id="budgetThreshold80"
                    className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                  />
                </div>
                {errors.budgetThreshold80 && (
                  <p className="text-[13px] text-red-500 mt-1">
                    {errors.budgetThreshold80.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="budgetThreshold100"
                    className="text-base font-medium text-[rgb(var(--color-muted))]"
                  >
                    Alert when budget exceeds %
                  </label>

                  <input
                    {...register("budgetThreshold100")}
                    type="number"
                    name="budgetThreshold100"
                    id="budgetThreshold100"
                    className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                  />
                </div>
                {errors.budgetThreshold100 && (
                  <p className="text-[13px] text-red-500 mt-1">
                    {errors.budgetThreshold100.message}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Goal thresholds */}
            <fieldset className="w-full border-b-2 border-[rgb(var(--color-gray-bg))] py-4 mt-4 flex flex-col gap-y-2">
              <legend className="text-xl font-medium text-[rgb(var(--color-text))]">
                Goal Thresholds
              </legend>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="goalThreshold50"
                    className="text-base font-medium text-[rgb(var(--color-muted))]"
                  >
                    Alert when goal reaches %
                  </label>

                  <input
                    {...register("goalThreshold50")}
                    type="number"
                    name="goalThreshold50"
                    id="goalThreshold50"
                    className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                  />
                </div>
                {errors.goalThreshold50 && (
                  <p className="text-[13px] text-red-500 mt-1">
                    {errors.goalThreshold50.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="goalThreshold80"
                    className="text-base font-medium text-[rgb(var(--color-muted))]"
                  >
                    Alert when goal reaches %
                  </label>

                  <input
                    {...register("goalThreshold80")}
                    type="number"
                    name="goalThreshold80"
                    id="goalThreshold80"
                    className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                  />
                </div>
                {errors.goalThreshold80 && (
                  <p className="text-[13px] text-red-500 mt-1">
                    {errors.goalThreshold80.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between">
                  <label
                    htmlFor="goalThreshold100"
                    className="text-base font-medium text-[rgb(var(--color-muted))]"
                  >
                    Alert when goal exceeds %
                  </label>

                  <input
                    {...register("goalThreshold100")}
                    type="number"
                    name="goalThreshold100"
                    id="goalThreshold100"
                    className="w-4/12 px-2 py-1 border border-[rgb(var(--color-gray-border))] rounded shadow-2xl outline-none focus:border-[rgb(var(--color-brand-deep))] transition"
                  />
                </div>
                {errors.goalThreshold100 && (
                  <p className="text-[13px] text-red-500 mt-1">
                    {errors.goalThreshold100.message}
                  </p>
                )}
              </div>
            </fieldset>

            {/* Set to default preferences */}
            <button
              onClick={handleReset}
              type="button"
              className="w-fit text-base text-[rgb(var(--color-muted))] hover:text-[rgb(var(--color-text))] transition flex items-center gap-2 my-4 cursor-pointer"
            >
              <FaUndo className="text-xs" /> <span>Restore Defaults</span>
            </button>

            {/* Cancel and Save Buttons */}
            <div className="my-6 flex self-end gap-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-base font-semibold border border-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-text))] hover:text-white transition cursor-pointer rounded"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-base text-white font-semibold bg-[rgb(var(--color-brand-deep))] rounded hover:bg-[rgb(var(--color-brand))] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <LoadingSpinner size={25} />
                ) : (
                  "Save Preferences"
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
};

export default Preferences;
