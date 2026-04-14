import useTransactionStore from "../store/useTransactionStore";
import { useModalContext } from "../context/ModalContext";
import { toast } from "react-hot-toast";
import { useFormContext } from "../context/FormContext";
import { generateCategoryKey } from "../utils/generateKey";
import { createNotification } from "../firebase/firestore";
import useCurrencyStore from "../store/useCurrencyStore";
import { formatAmount } from "../utils/formatAmount";
import { getSnakeCaseValue } from "../utils/snakeCaseValue";
import { addDocument } from "../firebase/firestore";

const useFormSubmit = (label, mode) => {
  const forms = useFormContext(label);
  const { reset, handleSubmit } = forms;

  const { editTransaction, addTransactionToStore, updateTransaction } =
    useTransactionStore();
  const { onCloseModal } = useModalContext();

  const transactions = label === "transactions";
  const budgets = label === "budgets";
  const goals = label === "goals";
  const contributions = label === "contributions";

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  //Generate unique category key
  const getUniqueCategoryKey = (prefix, name) => {
    if (transactions || budgets) {
      return generateCategoryKey(prefix, name);
    } else if (goals || contributions) {
      return generateCategoryKey("goal", name);
    } else {
      return generateCategoryKey("txn", prefix);
    }
  };

  // Get Transaction / Budget / Goal name
  const getCustomCat = (category, name) => {
    const categoryValue = category?.trim() || name?.trim() || "";

    if (transactions || budgets) {
      return getSnakeCaseValue(categoryValue);
    } else if (goals || contributions) {
      return getSnakeCaseValue(name);
    } else {
      return getSnakeCaseValue(name);
    }
  };

  // Handle submit form: add transactions, budgets, goals and contributions
  const onSubmit = (data, userUID, transactionID, transactionThreshold) => {
    const { selectedCurrency } = useCurrencyStore.getState();

    if (!transactions && !budgets && !goals && !contributions) return;

    const type = transactions || budgets ? data.type : null;
    const categoryOrCustom = data.category?.trim() || data.name?.trim() || "";

    // Create transaction object
    const transaction = {
      name: getCustomCat(data.category, data.name),
      category: getSnakeCaseValue(categoryOrCustom),
      categoryKey: getUniqueCategoryKey(data.category, data.name),
      amount: data.amount,
      type,
      date: data.date,
      description: data.description,
    };

    if (mode !== "add" && editTransaction?.id) {
      transaction.id = editTransaction.id;
    }

    // Close the modal
    onCloseModal(label);

    // Show toast on success
    toast.success(
      `${(label[0].toUpperCase() + label.slice(1)).slice(0, -1)} ${
        mode === "add" ? "added" : "updated"
      } successfully`,
      {
        duration: 3000,
        position: "top-center",
      },
    );
    // Reset/Clear the form
    reset();

    // Run firestore operations off the form submit lifecycle so low-end devices stay seamless
    const runSync = async () => {
      if (mode === "edit") {
        await updateTransaction(userUID, label, transactionID, transaction);
      } else {
        await addTransactionToStore(userUID, label, transaction);

        if (data.name && (transactions || budgets)) {
          await addDocument(userUID, "categories", {
            name: getSnakeCaseValue(data.name),
          });
        }
      }

      if (
        label === "transactions" &&
        type === "expense" &&
        transaction.amount >= transactionThreshold
      ) {
        await createNotification(userUID, {
          subject: "Large Expense Alert 🚨",
          message: `You recorded an expense transaction of ${formatAmount(
            data.amount,
            selectedCurrency,
          )} for "${
            transaction.category
          }", which is higher than your set threshold of ${formatAmount(
            transactionThreshold,
            selectedCurrency,
          )}. Keep an eye on your spending.`,
          type: "transaction",
        });
      }
    };

    const syncTask = (async () => {
      // Retry once to handle low-network scenarios.
      try {
        await runSync();
      } catch {
        await delay(1200);
        await runSync();
      }
    })();

    syncTask.catch((_) => {
      toast.error(
        `Could not sync this ${label.slice(0, -1)} to cloud. Please submit again: "${transaction.category}" (${formatAmount(
          transaction.amount,
          selectedCurrency,
        )}).`,
        {
          duration: 5000,
          position: "top-center",
        },
      );
    });

    return "Transaction queued";
  };

  return {
    handleSubmit,
    onSubmit,
  };
};

export default useFormSubmit;
