import useSmartForm from "./useSmartForm";
import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import { useFormState } from "react-hook-form";
import { toast } from "react-hot-toast";

const useFormSubmit = (label) => {
  const form = useSmartForm(label);
  const { register, watch, getValues, handleSubmit, reset } = form;
  const { errors, isSubmitting, isValid } = useFormState({
    control: form.control,
  });

  const {
    addTransactionToStore,
    currencySymbol,
    selectedCurrency,
    CATEGORY_OPTIONS,
  } = useTransactionStore();
  const { onCloseModal } = useModalContext();

  const goalName = getValues("name");
  const categoryValue = getValues("category");
  const typeValue = getValues("type");
  const amountValue = getValues("amount");
  const dateValue = getValues("date");
  const descriptionValue = getValues("description");
  // console.log(descriptionValue);

  const transactions = label === "transactions";
  const budgets = label === "budgets";
  const goals = label === "goals";
  const contributions = label === "contributions";

  const categoryType = CATEGORY_OPTIONS.find(
    (opt) => opt.name === categoryValue
  )?.type;

  // const data = {
  //   name: goalName,
  //   category: categoryValue,
  //   currencySymbol,
  //   currency: selectedCurrency,
  //   amount: amountValue,
  //   type: typeValue,
  //   date: dateValue,
  //   description: descriptionValue,
  // };

  const onSubmit = handleSubmit(async (data) => {
    if (!isValid) return;
    const categoryType = CATEGORY_OPTIONS.find(
      (opt) => opt.name === data.category
    )?.type;

    try {
      if (transactions || budgets || goals) {
        const transaction = {
          name: goals ? data.name : null,
          category: goals ? null : data.category,
          currencySymbol,
          currency: selectedCurrency,
          amount: data.amount,
          type:
            transactions || budgets
              ? categoryType === "other"
                ? data.type
                : categoryType
              : null,
          date: data.date,
          description: data.description,
        };
        await addTransactionToStore(transaction, label);
        reset();
        onCloseModal(label);
        toast.success(
          `${
            label.charAt(0).toUpperCase() + label.slice(1)
          } added successfully`,
          {
            duration: 3000,
            position: "top-center",
          }
        );
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      console.log("Transaction concluded");
    }
  });

  return { register, watch, errors, isSubmitting, isValid, onSubmit };
};

export default useFormSubmit;
