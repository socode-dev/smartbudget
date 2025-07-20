import { openDB } from "idb";

const idbTransactions = (label) => {
  const DB_NAME = "smartbudget";
  const STORE_NAME = (label) => {
    switch (label) {
      case "transactions":
        return "transactions";
      case "budgets":
        return "budgets";
      case "goals":
        return "goals";
      case "contributions":
        return "contributions";
      default:
        return "transactions";
    }
  };
  const DB_VERSION = 2;

  const getDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const stores = ["transactions", "budgets", "goals", "contributions"];
        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, {
              keyPath: "id",
              autoIncrement: true,
            });
          }
        });
      },
    });
  };

  const addTransaction = async (transaction, label) => {
    const db = await getDB();
    await db.add(STORE_NAME(label), {
      ...transaction,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteTransaction = async (id, label) => {
    const db = await getDB();
    await db.delete(STORE_NAME(label), id);
  };

  const updateTransaction = async (transaction, label) => {
    const db = await getDB();
    await db.put(STORE_NAME(label), transaction);
    return transaction;
  };

  const clearTransactions = async (label) => {
    const db = await getDB();
    await db.clear(STORE_NAME(label));
  };

  const getAllTransactions = async (label) => {
    const db = await getDB();
    return db.getAll(STORE_NAME(label));
  };

  return {
    addTransaction,
    deleteTransaction,
    updateTransaction,
    clearTransactions,
    getAllTransactions,
  };
};

export default idbTransactions;
