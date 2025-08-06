import React, { useState, useEffect, useMemo, useRef } from "react";
import "../CSS/ExpenseManager.css";
import RevealOnScroll from "./RevealOnScroll";
import { io } from "socket.io-client";
import ReceiptScanner from "../components/ReceiptScanner";
import { authFetch } from "../utils/authFetch";
import { saveAccounts, getAccountsFromLocalDb, syncTransactions } from "../utils/sync";

type Split = {
  id: string;
  name: string;
  balance: number;
};

type Account = {
  id: string;
  name: string;
  balance: number;
  splits: Split[];
  transactions: Transaction[];
  unsynced?: boolean;
  modifiedAt?: string;
};

type Transaction = {
  id: string;
  accountId: string;
  splitId?: string;
  type: "add" | "spend" | "transfer";
  amount: number;
  description: string;
  date: string;
  modifiedAt?: string;
  unsynced?: boolean;
};

type ExpenseManagerProps = {
  userId: string;
};

function transferBetweenSplits(splits: Split[], fromId: string, toId: string, amount: number) {
  return splits.map(split => {
    if (split.id === fromId) return { ...split, balance: split.balance - amount };
    if (split.id === toId) return { ...split, balance: split.balance + amount };
    return split;
  });
}

function updateSplitBalance(splits: Split[], splitId: string, amount: number, type: "add" | "spend") {
  return splits.map(split =>
    split.id === splitId
      ? { ...split, balance: type === "add" ? split.balance + amount : split.balance - amount }
      : split
  );
}

export default function ExpenseManager({ userId }: ExpenseManagerProps) {

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "offline" | "error">("idle");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsUpdatedAt, setAccountsUpdatedAt] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string>("");
  const [newAccountName, setNewAccountName] = useState("");
  const [form, setForm] = useState({
    splitId: "",
    type: "add",
    amount: "",
    description: "",
    date: "",
    fromSplitId: "",
    toSplitId: "",
  });
  const [newSplitName, setNewSplitName] = useState("");
  const [newSplitAmount, setNewSplitAmount] = useState("");
  const [splitNameError, setSplitNameError] = useState("");
  const explanationRef = React.useRef<HTMLDivElement>(null);
  const [sortType, setSortType] = useState<"date-asc" | "date-desc" | "input-asc" | "input-desc">("date-desc");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const [trialExpiresAt, setTrialExpiresAt] = useState(localStorage.getItem("trialExpiresAt"));
  const [isPremium, setIsPremium] = useState(JSON.parse(localStorage.getItem("isPremium") || "false"));

  const isTrialActive = trialExpiresAt && Date.now() < new Date(trialExpiresAt).getTime();
  const hasPremium = isPremium || isTrialActive;
  const [error, setError] = useState<string | null>(null);
  type ScannedData = {
    vendor: string;
    date: string;
    time?: string;
    total: number;
    items?: string[];
    raw?: string;
  } | null;

  const [scannedData, setScannedData] = useState<ScannedData>(null);
  const [clearScanner, setClearScanner] = useState(false);

  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setError(null);
      if (!navigator.onLine) {
        setSyncStatus("offline");
        const localAccounts = await getAccountsFromLocalDb();
        if (!cancelled) {
          setAccounts(localAccounts);
          setError("You are offline. Showing cached data.");
        }
        return;
      }

      setSyncStatus("syncing");
      try {
        await syncTransactions();
        setSyncStatus("success");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (err) {
        setSyncStatus("error");
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Sync failed: ${errorMessage}. Your changes are saved locally and will sync when online.`);
        setTimeout(() => setSyncStatus("idle"), 5000); // Longer timeout for errors
      }

      const res = await authFetch("http://localhost:5000/api/expense", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to fetch expense data");
        return;
      }
      const data = await res.json();
      if (data && data.hasData && Array.isArray(data.accounts)) {
        const localAccounts = await getAccountsFromLocalDb();
        const unsyncedAccounts = localAccounts.filter(acc =>
          acc.unsynced || (acc.transactions && acc.transactions.some(tx => tx.unsynced))
        );

        // Merge unsynced local accounts/transactions into server data
        const mergedAccounts: Account[] = data.accounts.map((serverAcc: Account) => {
          const localAcc: Account | undefined = unsyncedAccounts.find(acc => acc.id === serverAcc.id);
          if (!localAcc) return serverAcc;
          // Merge transactions
          const mergedTransactions: Transaction[] = [
            ...(serverAcc.transactions ?? []).filter(
              (tx: Transaction) => !localAcc.transactions?.some((localTx: Transaction) => localTx.id === tx.id && localTx.unsynced)
            ),
            ...(localAcc.transactions?.filter((tx: Transaction) => tx.unsynced) || [])
          ];
          return {
            ...serverAcc,
            ...localAcc,
            transactions: mergedTransactions
          };
        });
        setAccounts(mergedAccounts);
        setAccountsUpdatedAt(data.updatedAt);
        await saveAccounts(mergedAccounts);
      } else {
        setAccounts([]);
        setActiveAccountId("");
        setError("No account data found. Please add an account.");
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "trialExpiresAt" || e.key === "isPremium") {
        setTrialExpiresAt(localStorage.getItem("trialExpiresAt"));
        setIsPremium(JSON.parse(localStorage.getItem("isPremium") || "false"));
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (activeAccountId) {
      localStorage.setItem("expenseManagerActiveAccountId", activeAccountId);
    }
  }, [activeAccountId]);

  useEffect(() => {
    const savedActiveAccountId = hasPremium
      ? localStorage.getItem("expenseManagerActiveAccountId")
      : null;

    if (savedActiveAccountId && accounts.length > 0) {
      const accountExists = accounts.find(acc => acc.id === savedActiveAccountId);
      if (accountExists) {
        setActiveAccountId(savedActiveAccountId);
      }
    }
  }, [accounts, hasPremium]);

  useEffect(() => {
    accounts.forEach(acc => {
      if (acc.transactions) {
        const ids = acc.transactions.map(tx => tx.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.warn(`Duplicate transaction ids found in account ${acc.name}!`, ids);
        }
        if (acc.transactions.some(tx => !tx.id)) {
          console.warn(`Transaction(s) missing id in account ${acc.name}!`, acc.transactions.filter(tx => !tx.id));
        }
      }
    });
  }, [accounts]);

  useEffect(() => {
    const socket = io("http://localhost:5000", { withCredentials: true });
    if (userId) socket.emit("join", userId);

    function handleExpenseDataUpdated(newData: { accounts: Account[]; updatedAt: string }) {
      try {
        if (
          !newData ||
          !Array.isArray(newData.accounts) ||
          !newData.updatedAt
        ) {
          console.error("Malformed socket data received:", newData);
          setError("Received invalid data from server. Please reload.");
          return;
        }
        
        // Use ref to get current accounts (fixes stale closure)
        const currentAccounts = accountsRef.current;
        const hasUnsynced = currentAccounts.some(acc =>
          acc.unsynced || (acc.transactions && acc.transactions.some(tx => tx.unsynced))
        );
        if (hasUnsynced) {
          console.warn("Ignoring server update because of unsynced local changes.");
          return;
        }
        
        if (
          !accountsUpdatedAt ||
          (new Date(newData.updatedAt) > new Date(accountsUpdatedAt))
        ) {
          setAccounts(newData.accounts);
          setAccountsUpdatedAt(newData.updatedAt);
        }
      } catch (err) {
        console.error("Error handling socket event:", err);
        setError("A sync error occurred. Please reload the page.");
      }
    }

    socket.on("expenseDataUpdated", handleExpenseDataUpdated);

    return () => {
      socket.off("expenseDataUpdated", handleExpenseDataUpdated);
      socket.disconnect();
    };
  }, [userId, accountsUpdatedAt]); // Remove accounts from dependencies

  const handleAddAccount = async () => {
    if (!newAccountName.trim()) return;
    if (accounts.some(acc => acc.name === newAccountName)) {
      setError("Bank name already exists. Please choose a different name.");
      return;
    }
    const newAccount: Account = {
      id: Math.random().toString(36).slice(2),
      name: newAccountName,
      balance: 0,
      splits: [],
      transactions: [],
      modifiedAt: new Date().toISOString(),
      unsynced: true, 
    };
    const newAccounts = [...accounts, newAccount];
    setAccounts(newAccounts);
    setActiveAccountId(newAccount.id);
    setNewAccountName("");
    
    try {
      await saveAccounts(newAccounts);
      if (navigator.onLine) {
        setSyncStatus("syncing");
        try {
          await syncTransactions();
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2000);
        } catch (err) {
          setSyncStatus("error");
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Sync failed: ${errorMessage}. Your changes are saved locally and will sync when online.`);
          setTimeout(() => setSyncStatus("idle"), 5000);
        }
      }
    } catch {
      setAccounts(accounts);
      setError("Failed to save account. Please try again."); // Fixed message
    }
  };

  const handleAddSplit = async () => {
    if (!newSplitName.trim() || !activeAccountId) return;
    if (!/^[A-Za-z ]+$/.test(newSplitName)) { // Allow spaces
      setSplitNameError("Split name must contain only letters and spaces.");
      return;
    }
    const amount = parseFloat(newSplitAmount);
    if (!amount || amount <= 0) return;
    const newAccounts = accounts.map(acc => {
      if (acc.id !== activeAccountId) return acc;
      if (acc.balance < amount) return acc;
      return {
        ...acc,
        balance: acc.balance - amount,
        splits: [
          ...acc.splits,
          {
            id: Math.random().toString(36).slice(2),
            name: newSplitName,
            balance: amount,
          },
        ],
        unsynced: true, 
        modifiedAt: new Date().toISOString(),
      };
    });
    setAccounts(newAccounts);
    setNewSplitName("");
    setNewSplitAmount("");
    setSplitNameError("");
    
    try {
      await saveAccounts(newAccounts);
      if (navigator.onLine) {
        setSyncStatus("syncing");
        try {
          await syncTransactions();
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2000);
        } catch (err) {
          setSyncStatus("error");
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Sync failed: ${errorMessage}. Your changes are saved locally and will sync when online.`);
          setTimeout(() => setSyncStatus("idle"), 5000);
        }
      }
    } catch {
      setAccounts(accounts);
      setError("Failed to save split. Please try again."); // Fixed message
    }
  };


  const handleSplitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[A-Za-z]*$/.test(value)) {
      setNewSplitName(value);
      setSplitNameError("");
    } else {
      setSplitNameError("Split name must contain only letters.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }
    setError(null);
    if (!activeAccountId) return;
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    let date = form.date;
    if (!date) {
      date = new Date().toISOString();
    } else if (!date.includes("T") || date.endsWith("T")) {
      const today = new Date();
      const time = today.toTimeString().slice(0, 5);
      date = date.split("T")[0] + "T" + time;
    }

    const acc = accounts.find((a) => a.id === activeAccountId);
    if (!acc) return;
    let splits = acc.splits;
    if (form.type === "spend" && form.splitId) {
      splits = updateSplitBalance(acc.splits, form.splitId, amount, "spend");
    } else if (form.type === "add" && form.splitId) {
      splits = updateSplitBalance(acc.splits, form.splitId, amount, "add");
    } else if (form.type === "transfer") {
      splits = transferBetweenSplits(acc.splits, form.fromSplitId, form.toSplitId, amount);
    }
    if (form.type === "spend") {
      if (form.splitId) {
        const split = acc.splits.find((split) => split.id === form.splitId);
        if (!split || split.balance < amount) {
          alert("Insufficient split balance!");
          return;
        }
      } else {
        if (acc.balance < amount) {
          alert("Insufficient main balance!");
          return;
        }
      }
    }
    if (!hasPremium && (acc.transactions?.length || 0) >= 100) {
      alert("Free users can only store up to 100 transactions. Please export or upgrade for unlimited history.");
      return;
    }
    const newTransaction: Transaction = {
      id: Math.random().toString(36).slice(2),
      accountId: activeAccountId,
      splitId: form.splitId || undefined,
      type: form.type as "add" | "spend" | "transfer",
      amount,
      description: form.description,
      date,
      modifiedAt: new Date().toISOString(),
      unsynced: true,
    };
    const newAccounts = accounts.map((acc) => {
      if (acc.id !== activeAccountId) return acc;
      const updatedTransactions = acc.transactions
        ? [...acc.transactions, newTransaction].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        : [newTransaction];
      if (form.splitId) {
        return {
          ...acc,
          transactions: updatedTransactions,
          splits,
          modifiedAt: new Date().toISOString(),
          unsynced: true,
        };
      } else {
        return {
          ...acc,
          transactions: updatedTransactions,
          balance:
            form.type === "add"
              ? acc.balance + amount
              : acc.balance - amount,
          modifiedAt: new Date().toISOString(),
          unsynced: true,
        };
      }
    });
    const prevAccounts = accounts;
    setAccounts(newAccounts);
    setForm({ splitId: "", type: "add", amount: "", description: "", date: "", fromSplitId: "", toSplitId: "" });
    setClearScanner(true);
    setTimeout(() => setClearScanner(false), 100);
    try {
      await saveAccounts(newAccounts);

      if (navigator.onLine) {
        setSyncStatus("syncing");
        try {
          await syncTransactions();
          setSyncStatus("success");
          setTimeout(() => setSyncStatus("idle"), 2000);
        } catch (err) {
          setSyncStatus("error");
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Sync failed: ${errorMessage}. Your changes are saved locally and will sync when online.`);
          setTimeout(() => setSyncStatus("idle"), 5000); // Longer timeout for errors
        }
      }
    } catch {
      setAccounts(prevAccounts);
      setError("Failed to save transaction. Please try again.");
    }
  }

  const exportCSV = () => {
    if (!activeAccount || !activeAccount.transactions?.length) {
      alert("No transactions to export for the selected account.");
      return;
    }

    const rows = [
      ["Date", "Split", "Type", "Amount", "Description"],
      ...activeAccount.transactions
        .filter(tx => tx.type !== "transfer")
        .map(tx => [
          new Date(tx.date).toLocaleDateString('en-GB'),
          tx.splitId ? (activeAccount.splits.find(s => s.id === tx.splitId)?.name || "Main") : "Main",
          tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
          tx.amount.toFixed(2),
          tx.description,
          "manual"
        ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," +
      rows.map(row => row.map(field => `"${field}"`).join(",")).join("\n");

    const link = document.createElement("a");
    link.href = csvContent;
    link.download = `${activeAccount.name}_transactions.csv`;
    link.click();
  };

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);
  const filteredTransactions = useMemo(() => {
    if (!activeAccount?.transactions) return [];
    return activeAccount.transactions.filter(
      tx =>
        tx.type !== "transfer"
    );
  }, [activeAccount?.transactions]);

  const sortedTransactions = useMemo(() => {
    const txs = [...filteredTransactions];
    if (sortType === "date-desc") {
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortType === "date-asc") {
      txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortType === "input-desc") {
      txs.reverse();
    }
    return txs;
  }, [filteredTransactions, sortType]);

  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice((page - 1) * pageSize, page * pageSize);
  }, [sortedTransactions, page, pageSize]);

  useEffect(() => {
    if (scannedData) {
      let time = scannedData.time || "00:00";
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (timeMatch) {
        time = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
      } else if (/^\d{1,2}\.\d{2}/.test(time)) {
        const parts = time.split(".");
        time = `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
      }
      setForm(form => ({
        ...form,
        amount: scannedData.total && scannedData.total > 0 ? scannedData.total.toString() : "",
        date: scannedData.date
          ? scannedData.date + "T" + time
          : form.date,
      }));
      setScannedData(null);
    }
  }, [scannedData]);

  return (
    <div className="expense-manager-bg">
      <div
        className="expense-scroll-link"
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#7c4dff",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "1.2rem",
          textDecoration: "none",
        }}
        onClick={() => {
          explanationRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        Click on the text to know how to use Expense Manager
      </div>
      <div className="expense-manager-card">
        <h1 className="expense-title">Expense Manager</h1>
        {error && (
          <div className="error-message" style={{ color: "#e53935", margin: "1rem 0", textAlign: "center" }}>
            {error}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>

            </div>
          </div>
        )}
        {syncStatus === "syncing" && (
          <div className="sync-status syncing">Syncing...</div>
        )}
        {syncStatus === "success" && (
          <div className="sync-status success">All changes saved</div>
        )}
        {syncStatus === "offline" && (
          <div className="sync-status offline">Offline: changes will sync when online</div>
        )}
        {syncStatus === "error" && (
          <div className="sync-status error">Sync failed: retrying...</div>
        )}
        <div className="expense-row">
          <input
            className="expense-input"
            type="text"
            placeholder="Add new account"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
          />
          <button
            className="expense-btn expense-btn-gradient"
            onClick={handleAddAccount}
          >
            Add Account
          </button>
          <select
            className="expense-input"
            value={activeAccountId}
            onChange={(e) => setActiveAccountId(e.target.value)}
          >
            <option value="">Select Account</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        {activeAccount && (
          <div className="expense-section">
            <h3 className="expense-subtitle">Splits (Divided Money)</h3>
            <div className="expense-row">
              <input
                className="expense-input"
                type="text"
                placeholder="Name Your Split"
                value={newSplitName}
                onChange={handleSplitNameChange}
                disabled={activeAccount.balance <= 0}
              />
              <input
                className="expense-input"
                type="number"
                placeholder="Amount"
                value={newSplitAmount}
                min="0"
                max={activeAccount.balance}
                onChange={(e) => setNewSplitAmount(e.target.value)}
                disabled={activeAccount.balance <= 0}
              />
              <button
                className="expense-btn"
                onClick={handleAddSplit}
                disabled={
                  activeAccount.balance <= 0 ||
                  !newSplitName ||
                  !newSplitAmount ||
                  !!splitNameError
                }
              >
                Add Split
              </button>
            </div>
            {splitNameError && (
              <div
                className="error-message"
                style={{ color: "#e53935", marginTop: 4 }}
              >
                {splitNameError}
              </div>
            )}
            <ul className="expense-splits-list">
              <li key="main">
                <span className="expense-split-name">Main</span>
                <span className="expense-split-amount">
                  ₹{activeAccount.balance.toFixed(2)}
                </span>
              </li>
              {activeAccount.splits.map((split) => (
                <li key={split.id}>
                  <span className="expense-split-name">{split.name}</span>
                  <span className="expense-split-amount">
                    ₹{split.balance.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {activeAccount && (
          <div className="expense-total">
            Total Balance: ₹
            {(
              activeAccount.balance +
              activeAccount.splits.reduce((sum, split) => sum + split.balance, 0)
            ).toFixed(2)}
          </div>
        )}

        <ReceiptScanner
          onExtract={data => setScannedData({
            vendor: data.vendor,
            date: data.date,
            time: data.time,
            total:
              (typeof data.grandTotal === "number" && data.grandTotal > 0 && data.grandTotal) ||
              (typeof data.total === "number" && data.total > 0 && data.total) ||
              (typeof data.subtotal === "number" && data.subtotal > 0 && data.subtotal) ||
              (typeof data.taxTotal === "number" && data.taxTotal > 0 && data.taxTotal) ||
              0
          })}
          clear={clearScanner}
        />

        <form onSubmit={handleSubmit} className="expense-form">
          <div className="expense-form-row">
            <select
              className="expense-input"
              name="splitId"
              value={form.splitId}
              onChange={handleChange}
              disabled={!activeAccount}
            >
              <option value="">Main</option>
              {activeAccount?.splits.map((split) => (
                <option key={split.id} value={split.id}>
                  {split.name}
                </option>
              ))}
            </select>
            <select
              className="expense-input"
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={!activeAccount}
            >
              <option value="add">Add Money</option>
              <option value="spend">Spend Money</option>
              <option value="transfer">Transfer Money</option>
            </select>
          </div>
          {!activeAccount && (
            <div className="error-message" style={{ marginTop: 8 }}>
              Please add and select a bank account to record transactions.
            </div>
          )}
          <input
            className="expense-input"
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            disabled={!activeAccount}
          />
          <input
            className="expense-input"
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
            disabled={!activeAccount}
          />
          <input
            className="expense-input"
            type="date"
            name="date"
            value={form.date.split("T")[0] || ""}
            onChange={e =>
              setForm({
                ...form,
                date:
                  e.target.value +
                  "T" +
                  (form.date.split("T")[1] || "00:00"),
              })
            }
            disabled={!activeAccount}
          />
          <input
            className="expense-input"
            type="time"
            name="time"
            value={form.date.split("T")[1] || ""}
            onChange={e =>
              setForm({
                ...form,
                date:
                  (form.date.split("T")[0] ||
                    new Date().toISOString().split("T")[0]) +
                  "T" +
                  e.target.value,
              })
            }
            disabled={!activeAccount}
          />
          {form.type === "transfer" && (
            <div className="expense-form-row">
              <select
                className="expense-input"
                name="fromSplitId"
                value={form.fromSplitId}
                onChange={handleChange}
                disabled={!activeAccount}
              >
                <option value="">Select From Split</option>
                {activeAccount?.splits.map((split) => (
                  <option key={split.id} value={split.id}>
                    {split.name}
                  </option>
                ))}
              </select>
              <select
                className="expense-input"
                name="toSplitId"
                value={form.toSplitId}
                onChange={handleChange}
                disabled={!activeAccount}
              >
                <option value="">Select To Split</option>
                {activeAccount?.splits.map((split) => (
                  <option key={split.id} value={split.id}>
                    {split.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className="expense-btn expense-btn-gradient"
            type="submit"
            disabled={!activeAccount}
          >
            Submit
          </button>
        </form>
      </div>
      <div className="expense-btn-group" style={{ display: "flex", gap: "1rem", justifyContent: "center", margin: "1.2rem 0" }}>
        <button className="expense-btn" onClick={exportCSV}>Export CSV</button>
      </div>
      <div className="expense-transactions-bg">
        <div className="expense-transactions-container">
          <div className="expense-transactions-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
            <h2 className="expense-transactions-title">Transactions</h2>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <select
                className="expense-input"
                style={{ width: "auto", minWidth: 140 }}
                value={sortType}
                onChange={e => setSortType(e.target.value as typeof sortType)}
              >
                <option value="date-desc">Newest First (Date/Time)</option>
                <option value="date-asc">Oldest First (Date/Time)</option>
                <option value="input-desc">Latest Input First</option>
                <option value="input-asc">Old Input First</option>
              </select>
            </div>
          </div>
          <div className="expense-table-wrapper">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Split</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {activeAccount
                  ? paginatedTransactions.map((tx) => {
                    const split = activeAccount.splits.find((s) => s.id === tx.splitId);
                    return (
                      <tr key={tx.id} className="manual-row">
                        <td>
                          {(() => {
                            const d = new Date(tx.date);
                            const day = String(d.getDate()).padStart(2, "0");
                            const month = String(d.getMonth() + 1).padStart(2, "0");
                            const year = d.getFullYear();
                            const hours = String(d.getHours()).padStart(2, "0");
                            const minutes = String(d.getMinutes()).padStart(2, "0");
                            return `${day}/${month}/${year}, ${hours}:${minutes}`;
                          })()}
                        </td>
                        <td>{split ? split.name : "Main"}</td>
                        <td>
                          <span
                            className={
                              tx.type === "add"
                                ? "expense-type-add"
                                : tx.type === "spend"
                                  ? "expense-type-spend"
                                  : "expense-type-transfer"
                            }
                          >
                            {tx.type === "add" ? "Add" : tx.type === "spend" ? "Spend" : "Transfer"}
                          </span>
                        </td>
                        <td>
                          {tx.type === "add" ? "+" : "-"}₹
                          {tx.amount.toFixed(2)}
                        </td>
                        <td className="expense-description-cell">{tx.description}</td>
                      </tr>
                    );
                  })
                  : (
                    <tr key="no-account">
                      <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                        Please add and select a bank account to view transactions.
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
          <div className="pagination-controls">
            <button disabled={page === 1} onClick={() => setPage(1)}>First</button>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(sortedTransactions.length / pageSize))}
            </span>
            <button disabled={page * pageSize >= sortedTransactions.length} onClick={() => setPage(page + 1)}>Next</button>
            <button
              disabled={page === Math.ceil(sortedTransactions.length / pageSize) || sortedTransactions.length === 0}
              onClick={() => setPage(Math.ceil(sortedTransactions.length / pageSize))}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <div className="expense-manager-bg">
        <RevealOnScroll
          as="h1"
          className="expense-explanation-title"
          style={{
            textAlign: "center",
            margin: "2rem 0 1rem 0",
            color: "#7c4dff",
          }}
        >
          How to Use the Expense Manager :
        </RevealOnScroll>
        <div
          className="expense-explanation"
          ref={explanationRef}
          style={{ marginTop: "-1.5rem" }}
        >
          <RevealOnScroll as="p">
            <b>Step 1:</b> Add your account using the "Add Account" field.
            Each account tracks its own balance and splits.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Step 2:</b> Select your active account from the dropdown to manage its money.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Step 3:</b> Use "Splits" to divide your money for specific
            purposes (e.g., Groceries, Rent, Fun). Give each split a name and
            allocate an amount from your main balance.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Step 4:</b> Record transactions using the form. Choose whether to
            add or spend money, select a split (or main), enter the amount,
            description, and date.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Step 5:</b> All transactions appear in the table below, showing
            date, split, type, amount, and description.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Tip:</b> Use splits to budget for categories, and update daily to
            track your spending and savings. The total balance updates
            automatically.
          </RevealOnScroll>
          <div>
            <RevealOnScroll as="ul">
              <li key="add-bank">
                <b>Add Bank:</b> Create a new account for tracking.
              </li>
              <li key="add-split">
                <b>Add Split:</b> Allocate money for a specific purpose.
              </li>
              <li key="add-spend">
                <b>Add/Spend Money:</b> Record every transaction for accurate
                tracking.
              </li>
              <li key="table">
                <b>Transactions Table:</b> Review your history and stay on top of
                your finances.
              </li>
            </RevealOnScroll>
          </div>
          <RevealOnScroll as="h3" >What is a Split?</RevealOnScroll>
          <RevealOnScroll as="p">
            A <b>split</b> lets you divide your main account balance into
            smaller buckets for specific purposes—like Groceries, Rent, or Fun.
            This helps you organize your money and track spending in each
            category separately.
          </RevealOnScroll>

          <RevealOnScroll as="h3" >Detailed Example:</RevealOnScroll>
          <RevealOnScroll as="p">
            Suppose you add a new bank account with ₹10,000 as your main
            balance. You want to set aside ₹3,000 for Groceries.
          </RevealOnScroll>
          <RevealOnScroll as="ul">
            <li key="main-balance">Your <b>Main</b> balance starts at ₹10,000.</li>
            <li key="create-split">
              You create a <b>Groceries split</b> and allocate ₹3,000 from
              your main balance.
            </li>
            2000, then record your daily
            expenses. Watch your balances and splits update in real time!
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
