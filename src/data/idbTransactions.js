import { openDB } from "idb";

const DB_NAME = "smartbudget";
const STORE_NAME = "transactions";
const DB_VERSION = 1;

const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

export const addTransaction = async (transaction) => {
  const db = await getDB();
  await db.add(STORE_NAME, {
    ...transaction,
    createdAt: new Date().toISOString(),
  });
};

export const deleteTransaction = async (id) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

export const updateTransaction = async (transaction) => {
  const db = await getDB();
  await db.put(STORE_NAME, transaction);
  return transaction;
};

export const clearTransactions = async () => {
  const db = await getDB();
  await db.clear(STORE_NAME);
};

export const getAllTransactions = async () => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};
