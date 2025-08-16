import { getAllTransactions } from "./localDb";
import { authFetch } from "../utils/authFetch";

// Define the Split type
interface Split {
  id: string;
  name: string;
  balance: number;
}

// Define the Account type
interface Account {
  id: string;
  name: string;
  balance: number;
  splits: Split[];
  transactions?: Transaction[];
}

// Define the Transaction type
interface Transaction {
  id: string;
  splitId?: string;
  type: "add" | "spend" | "transfer";
  amount: number;
  description: string;
  date: string;
  source?: "manual";
  bankName?: string;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!navigator.onLine) {
    const transactions = await getAllTransactions();
    return transactions.map(transaction => ({
      ...transaction,
      source: transaction.source === "manual" ? "manual" : undefined
    }));
  } else {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/expense`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to fetch transactions");
    }

    const data = await res.json();
    if (!data.hasData) return [];
    if (Array.isArray(data.accounts)) {
      return data.accounts.flatMap((acc: Account) => acc.transactions || []);
    }
    return [];
  }
}