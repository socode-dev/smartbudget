import clsx from "clsx";
import EntryNameField from "./EntryNameField";
import EntryAmountDateFields from "./EntryAmountDateFields";
import EntryTypeField from "./EntryTypeField";
import { useEffect } from "react";
import { format } from "date-fns";
import { FiSave } from "react-icons/fi";
import { useModalContext } from "../../context/ModalContext";
import useFormSubmit from "../../hooks/useFormSubmit";
import { useFormContext } from "../../context/FormContext";
import useThresholdStore from "../../store/useThresholdStore";
import useAuthStore from "../../store/useAuthStore";
import useTransactionStore from "../../store/useTransactionStore";
import useCurrencyStore from "../../store/useCurrencyStore";
import { showDemoReadOnlyToast, useDemoMode } from "../../demo/useDemoMode";
import Button from "../ui/Button";
import FormField from "../ui/FormField";

const controlClass =
  "h-10 min-w-0 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60";

const singularLabels = {
  transactions: "transaction",
  budgets: "budget",
  goals: "goal",
  contributions: "contribution",
};

const ModalForm = ({ label, mode, onClose }) => {
  const isDemoMode = useDemoMode();
  const user = useAuthStore((state) => state.currentUser);
  const thresholds = useThresholdStore((state) => state.thresholds);
  const categories = useTransactionStore((state) => state.categories);
  const currency = useCurrencyStore((state) => state.selectedCurrency);
  const { onSubmit, handleSubmit } = useFormSubmit(label, mode);
  const { transactionID } = useModalContext();

  const {
    register,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useFormContext(label);
  
  const transactionLabel = label === "transactions";
  const budgetLabel = label === "budgets";
  const goalLabel = label === "goals";
  const contributionLabel = label === "contributions";
  const categorized = transactionLabel || budgetLabel;
  
  useEffect(() => {
    if (mode === "edit") return;
    if (!getValues("date")) setValue("date", format(new Date(), "yyyy-MM-dd"));
    if (categorized && !getValues("type")) setValue("type", "expense");
  }, [mode, categorized, getValues, setValue]);
  
  const fieldId = (name) => `${label}-${name}`;
  
  const submit = (data) => {
    if (isDemoMode) return showDemoReadOnlyToast();
    
    return onSubmit(
      data,
      user?.uid,
      mode === "edit" ? transactionID : null,
      thresholds?.transactionThreshold ?? 10000,
    );
  };
  
  return (
    <form onSubmit={handleSubmit(submit)} aria-busy={isSubmitting}>
      <fieldset disabled={isSubmitting} className="min-w-0 space-y-5 px-6 py-5">
        <legend className="sr-only">{singularLabels[label]} details</legend>
        {categorized && (
          <FormField
            id={fieldId("category")}
            label="Category"
            error={errors.category}
          >
            {(props) => (
              <select
                {...props}
                {...register("category")}
                className={controlClass}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}
        <EntryNameField
          fieldId={fieldId}
          categorized={categorized}
          contributionLabel={contributionLabel}
          goalLabel={goalLabel}
          errors={errors}
          register={register}
          controlClass={controlClass}
        />
        {categorized && (
          <EntryTypeField
            errors={errors}
            fieldId={fieldId}
            register={register}
            label={label}
          />
        )}
        <EntryAmountDateFields
          fieldId={fieldId}
          budgetLabel={budgetLabel}
          goalLabel={goalLabel}
          errors={errors}
          currency={currency}
          register={register}
          controlClass={controlClass}
        />
        <FormField
          id={fieldId("description")}
          label={transactionLabel ? "Description" : "Notes"}
          error={errors.description}
        >
          {(props) => (
            <textarea
              {...props}
              {...register("description")}
              rows={3}
              placeholder={
                transactionLabel ? "Short description" : "Short notes"
              }
              className={clsx(
                "min-h-24 w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
              )}
            />
          )}
        </FormField>
      </fieldset>
      <footer className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-6 py-4">
        <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} loadingText="Saving...">
          <span className="flex items-center gap-2">
            <FiSave aria-hidden="true" />
            {mode === "edit" ? "Save changes" : `Save ${singularLabels[label]}`}
          </span>
        </Button>
      </footer>
    </form>
  );
};

export default ModalForm;
