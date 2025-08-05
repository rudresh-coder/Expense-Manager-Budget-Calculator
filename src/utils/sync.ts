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
  unsynced?: boolean | undefined | false;
  modifiedAt?: string; 
}

interface Transaction {
  id: string;
  accountId: string;
  splitId?: string;
  type: "add" | "spend" | "transfer";
  amount: number;
  description: string;
  date: string;
  unsynced?: boolean | undefined | false;
  source?: string;
  modifiedAt?: string; 
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
  if (syncInProgress) return;
  syncInProgress = true;
  try {
    if (!navigator.onLine) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const allAccounts: Account[] = await getAccountsFromLocalDb();

    const accountsToSync = allAccounts.filter(acc =>
      acc.unsynced ||
      (acc.transactions && acc.transactions.some(tx => tx.unsynced))
    );

    if (accountsToSync.length === 0) return;

    // Send a copy with unsynced removed
    const accountsForRequest = accountsToSync.map(acc => ({
      ...acc,
      unsynced: undefined,
      transactions: acc.transactions?.map(tx => ({ ...tx, unsynced: undefined })) || [],
    }));

    const res = await authFetch("http://localhost:5000/api/expense", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ accounts: accountsForRequest })
    });

    if (res.ok) {
      const responseData = await res.json();
      const savedTxIds: string[] = responseData.savedTransactionIds || [];
      const savedAccIds: string[] = responseData.savedAccountIds || [];

      // Update the ORIGINAL accounts and save them back
      for (const acc of accountsToSync) {
        if (savedAccIds.includes(acc.id)) {
          acc.unsynced = undefined;
        }
        if (acc.transactions) {
          acc.transactions.forEach(tx => {
            if (savedTxIds.includes(tx.id)) tx.unsynced = undefined;
          });
        }
        await accountsStore.setItem(acc.id, acc);
      }
    } else {
      const err = await res.json().catch(() => ({}));
      console.error("Sync failed:", err.error || res.statusText);
      throw new Error(err.error || "Sync failed");
    }
  } catch (err) {
    console.error("Network error during sync:", err);
    throw err;
  } finally {
    syncInProgress = false;
  }
}