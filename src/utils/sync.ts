import { getAllTransactions, removeTransaction } from "./localDb";
import localforage from "localforage";
import { authFetch } from "../utils/authFetch";

// NOTE: If you update the backend Account/Transaction/Split schema, update these interfaces and sync payload accordingly!

let syncInProgress = false;
interface Split {
  id: string;
  name: string;
  balance: number;
}

interface Account {
  id: string;
  name: string;
  balance: number;
  splits: Split[];
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  accountId: string;
  splitId?: string;
  type: "add" | "spend" | "transfer";
  amount: number;
  description: string;
  date: string;
  unsynced?: boolean;
  source?: string;
}

export const accountsStore = localforage.createInstance({
  name: "expense-manager",
  storeName: "accounts"
});

export async function saveAccounts(accounts: Account[]) {
  await Promise.all(accounts.map(acc => accountsStore.setItem(acc.id, acc)));
}

export async function getAccountsFromLocalDb(): Promise<Account[]> {
  const keys = await accountsStore.keys();
  const accounts = await Promise.all(keys.map(key => accountsStore.getItem(key)));
  return accounts.filter(Boolean) as Account[];
}

export async function getAccountById(accountId: string): Promise<Account | null> {
  return (await accountsStore.getItem(accountId)) as Account | null;
}

export async function syncTransactions() {
  if (syncInProgress) {
    console.warn("Sync already in progress, skipping.");
    return;
  }
  syncInProgress = true;
  try {
    if (!navigator.onLine) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const txs: Transaction[] = await getAllTransactions();

    // Group unsynced transactions by accountId
    const accountMap: Record<string, Transaction[]> = {};
    for (const tx of txs) {
      if (tx.unsynced && tx.accountId) {
        if (!accountMap[tx.accountId]) accountMap[tx.accountId] = [];
        accountMap[tx.accountId].push({ ...tx, unsynced: undefined });
      }
    }

    // Prepare accounts payload with required fields, skip if local account not found
    const accounts: Account[] = [];
    for (const [accountId, transactions] of Object.entries(accountMap)) {
      const localAccount = await getAccountById(accountId);
      if (!localAccount) {
        console.warn(`Skipping sync for accountId=${accountId}: local account data not found.`);
        continue;
      }
      accounts.push({
        id: localAccount.id,
        name: localAccount.name,
        balance: localAccount.balance,
        splits: localAccount.splits,
        transactions,
      });
    }

    if (accounts.length === 0) return;

    try {
      const res = await authFetch("http://localhost:5000/api/expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ accounts })
      });

      if (res.ok) {
        const responseData = await res.json();
        const savedIds: string[] = responseData.savedTransactionIds || [];
        for (const id of savedIds) {
          await removeTransaction(id);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Sync failed:", err.error || res.statusText);
      }
    } catch (err) {
      console.error("Network error during sync:", err);
    }
  } finally {
    syncInProgress = false;
  }
}