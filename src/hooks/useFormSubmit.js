import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import { toast } from "react-hot-toast";
import { useFormContext } from "../context/FormContext";

const useFormSubmit = (label, mode) => {
  const forms = useFormContext(label);
  const { reset, handleSubmit } = forms;

  const {
    editTransaction,
    addTransactionToStore,
    updateTransaction,
    currencySymbol,
    selectedCurrency,
    CATEGORY_OPTIONS,
  } = useTransactionStore();
  const { onCloseModal } = useModalContext();

  const transactions = label === "transactions";
  const budgets = label === "budgets";
  const goals = label === "goals";
  // const contributions = label === "contributions";

  const onSubmit = handleSubmit(async (data) => {
    const categoryType = CATEGORY_OPTIONS.find(
      (opt) => opt.name === data.category
    )?.type;

    try {
      if (!transactions && !budgets && !goals) return;

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

      if (mode !== "add" && editTransaction?.id) {
        transaction.id = editTransaction.id;
      }

      if (mode === "add") {
        await addTransactionToStore(transaction, label);
        console.log("added");
      } else if (mode === "edit") {
        await updateTransaction(transaction, label);
        console.log("updated");
      }

      reset();
      onCloseModal(label);
      toast.success(
        `${label.charAt(0).toUpperCase() + label.slice(1)} ${
          mode === "add" ? "added" : "updated"
        } successfully`,
        {
          duration: 3000,
          position: "top-center",
        }
      );
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      console.log("Transaction concluded");
    }
  });

  return {
    onSubmit,
  };
};

export default useFormSubmit;
