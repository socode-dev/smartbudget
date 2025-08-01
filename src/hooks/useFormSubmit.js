import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import { toast } from "react-hot-toast";
import { useFormContext } from "../context/FormContext";
import { generateCategoryKey } from "../utils/generateKey";

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
  const contributions = label === "contributions";

  //Generate unique category key
  const getUniqueCategoryKey = (prefix, name) => {
    if ((transactions || budgets) && prefix?.toLowerCase() === "other") {
      return generateCategoryKey(prefix, name);
    } else if (goals || contributions) {
      return generateCategoryKey("goal", name);
    } else {
      return generateCategoryKey("txn", prefix);
    }
  };

  // Get transaction type
  const getTransactionType = (categoryType, type) => {
    const isCategoryOther = categoryType?.toLowerCase() === "other";
    if ((transactions || budgets) && isCategoryOther) {
      return type;
    } else if (goals || contributions) {
      return null;
    } else {
      return categoryType;
    }
  };

  // Get Transaction / Budget / Goal name
  const getName = (categoryType, category, name) => {
    if ((transactions || budgets) && categoryType !== "other") {
      return category;
    } else if (goals || contributions) {
      return name;
    } else {
      return name;
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    const categoryType = CATEGORY_OPTIONS.find(
      (opt) => opt.name === data.category
    )?.type;

    try {
      if (!transactions && !budgets && !goals && !contributions) return;

      // Create transaction object
      const transaction = {
        name: getName(categoryType, data.category, data.name),
        category: goals || contributions ? null : data.category,
        categoryKey: getUniqueCategoryKey(data.category, data.name),
        currencySymbol,
        currency: selectedCurrency,
        amount: data.amount,
        type: getTransactionType(categoryType, data.type),
        date: data.date,
        description: data.description,
      };

      if (mode !== "add" && editTransaction?.id) {
        transaction.id = editTransaction.id;
      }

      if (mode === "add") {
        await addTransactionToStore(transaction, label);
      } else if (mode === "edit") {
        await updateTransaction(transaction, label);
      }

      onCloseModal(label);
      toast.success(
        `${(label.charAt(0).toUpperCase() + label.slice(1)).slice(0, -1)} ${
          mode === "add" ? "added" : "updated"
        } successfully`,
        {
          duration: 3000,
          position: "top-center",
        }
      );
      reset();
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
