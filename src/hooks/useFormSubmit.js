import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import { toast } from "react-hot-toast";
import { useFormContext } from "../context/FormContext";
import { generateCategoryKey } from "../utils/generateKey";
import { createNotification } from "../firebase/firestore";

const useFormSubmit = (label, mode) => {
  const forms = useFormContext(label);
  const { reset, handleSubmit } = forms;

  const {
    editTransaction,
    addTransactionToStore,
    updateTransaction,
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

  // Transaction threshold
  const FIXED_THRESHOLD = 10000;

  // Handle submit form to add transactions, budgets, goals and contributions
  const onSubmit = async (data, userUID, transactionID, formattedAmount) => {
    const categoryType = CATEGORY_OPTIONS.find(
      (opt) => opt.name === data.category
    )?.type;

    try {
      if (!transactions && !budgets && !goals && !contributions) return;

      const type = getTransactionType(categoryType, data.type);

      // Create transaction object
      const transaction = {
        name: getName(categoryType, data.category, data.name),
        category: goals || contributions ? null : data.category,
        categoryKey: getUniqueCategoryKey(data.category, data.name),
        amount: data.amount,
        type: type,
        date: data.date,
        description: data.description,
      };

      if (mode !== "add" && editTransaction?.id) {
        transaction.id = editTransaction.id;
      }

      // Add transaction if mode is add / update edited transaction if mode is edit
      if (mode === "add") {
        await addTransactionToStore(userUID, label, transaction);
        console.log(`${label} added successfully`);
      } else if (mode === "edit") {
        await updateTransaction(userUID, label, transactionID, transaction);
      }

      // Close the modl
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
      // Reset/Clear the form
      reset();

      // if label === "transactions", check if the transaction amount is bigger than the threshold
      if (
        label === "transactions" &&
        type === "expense" &&
        transaction.amount >= FIXED_THRESHOLD
      ) {
        await createNotification(userUID, {
          subject: "Large Expense Alert 🚨",
          message: `You recorded an expense transaction of ${formattedAmount(
            data.amount
          )} for "${
            transaction.category
          }", which is higher than your set threshold of ${formattedAmount(
            FIXED_THRESHOLD
          )}. Keep an eye on your spending.`,
          type: "transaction",
        });
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
    } finally {
      return "Transaction concluded";
    }
  };

  return {
    handleSubmit,
    onSubmit,
  };
};

export default useFormSubmit;
