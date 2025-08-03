import localforage from "localforage";

export const expenseStore = localforage.createInstance({
  name: "expense-manager",
  storeName: "transactions"
});

// Save a transaction
interface Transaction {
    id: string;
    accountId: string;
    splitId?: string;
    type: "add" | "spend" | "transfer";
    amount: number;
    description: string;
    date: string;
    unsynced?: boolean; // for offline sync
    source?: string;    // optional, e.g. "manual"
  }

export function saveTransaction(tx: Transaction) {
  return expenseStore.setItem(tx.id, tx);
}

export function getAllTransactions(): Promise<Transaction[]> {
  return expenseStore.keys().then(keys =>
    Promise.all(keys.map(k => expenseStore.getItem(k) as Promise<Transaction>))
  ).then(txs => txs.filter(Boolean) as Transaction[]);
}

export function removeTransaction(id: string) {
  return expenseStore.removeItem(id);
}