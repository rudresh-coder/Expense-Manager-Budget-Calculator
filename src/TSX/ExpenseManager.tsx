import React, { useState, useEffect } from "react";
import "../CSS/ExpenseManager.css";
import RevealOnScroll from "./RevealOnScroll";
import bankIcon from "../assets/bank.png";

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
};

type Transaction = {
  id: string;
  accountId: string;
  splitId?: string;
  type: "add" | "spend";
  amount: number;
  description: string;
  date: string;
  source?: "manual" | "bank";
  bankName?: string;
  timestamp?: number; 
};

export default function ExpenseManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [form, setForm] = useState({
    splitId: "",
    type: "add",
    amount: "",
    description: "",
    date: "",
  });
  const [newSplitName, setNewSplitName] = useState("");
  const [newSplitAmount, setNewSplitAmount] = useState("");
  const [splitNameError, setSplitNameError] = useState("");
  const explanationRef = React.useRef<HTMLDivElement>(null);
  const [sortType, setSortType] = useState<"date-asc" | "date-desc" | "input-asc" | "input-desc">("date-desc");
  const [isPremium] = useState(false); 
  const [filterSource, setFilterSource] = useState<"all" | "manual" | "bank">("all");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    const savedAccounts = sessionStorage.getItem("expenseManagerAccounts");
    const savedTransactions = sessionStorage.getItem("expenseManagerTransactions");
    const savedActiveAccountId = sessionStorage.getItem("expenseManagerActiveAccountId");
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedActiveAccountId) setActiveAccountId(savedActiveAccountId);
  }, []);
  
  useEffect(() => {
    sessionStorage.setItem("expenseManagerAccounts", JSON.stringify(accounts));
  }, [accounts]);
  
  useEffect(() => {
    sessionStorage.setItem("expenseManagerTransactions", JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    sessionStorage.setItem("expenseManagerActiveAccountId", activeAccountId);
  }, [activeAccountId]);

  useEffect (() => {
    if (transactions.length === 0) return;
    const now = Date.now();
    const oldest = Math.min(...transactions.map(tx => tx.timestamp || now));
    if (now - oldest > 6 * 60 * 60 * 1000) {//6 hours
      setAccounts([]);
      setTransactions([]);
      setActiveAccountId("");
      sessionStorage.removeItem("expenseManagerAccounts");
      sessionStorage.removeItem("expenseManagerTransactions");
      sessionStorage.removeItem("expenseManagerActiveAccountId");
    }
  }, [transactions]);

  const handleAddAccount = () => {
    if (!newAccountName.trim()) return;
    const newAccount: Account = {
      id: Math.random().toString(36).slice(2),
      name: newAccountName,
      balance: 0,
      splits: [],
    };
    setAccounts([...accounts, newAccount]);
    setActiveAccountId(newAccount.id);
    setNewAccountName("");
  };

  const handleAddSplit = () => {
    if (!newSplitName.trim() || !activeAccountId) return;
    if (!/^[A-Za-z]+$/.test(newSplitName)) {
      setSplitNameError("Split name must contain only letters.");
      return;
    }
    const amount = parseFloat(newSplitAmount);
    if (!amount || amount <= 0) return;
    setAccounts(
      accounts.map((acc) => {
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
        };
      })
    );
    setNewSplitName("");
    setNewSplitAmount("");
    setSplitNameError("");
  };

  const handleSplitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters (no spaces, numbers, or symbols)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccountId) return;
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    const date = form.date || new Date().toISOString();

    const acc = accounts.find((a) => a.id === activeAccountId);
    if (!acc) return;
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
    if (!isPremium && transactions.length >= 50) {
      alert("Free users can only store up to 50 transactions. Please export or upgrade for unlimited history.");
      return;
    }
    const newTransaction: Transaction = {
      id: Math.random().toString(36).slice(2),
      accountId: activeAccountId,
      splitId: form.splitId || undefined,
      type: form.type as "add" | "spend",
      amount,
      description: form.description,
      date,
      timestamp: Date.now(), 
    };
    setTransactions(
      [...transactions, newTransaction].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
    setAccounts(
      accounts.map((acc) => {
        if (acc.id !== activeAccountId) return acc;
        if (form.splitId) {
          return {
            ...acc,
            splits: acc.splits.map((split) =>
              split.id === form.splitId
                ? {
                    ...split,
                    balance:
                      form.type === "add"
                        ? split.balance + amount
                        : split.balance - amount,
                  }
                : split
            ),
          };
        } else {
          return {
            ...acc,
            balance:
              form.type === "add"
                ? acc.balance + amount
                : acc.balance - amount,
          };
        }
      })
    );
    setForm({ splitId: "", type: "add", amount: "", description: "", date: "" });
  };

  const exportCSV = () => {
    const rows = [
      ["Date", "Split", "Type", "Amount", "Description", "Source"],
      ...transactions.map(tx => [
        tx.date,
        tx.splitId ? (accounts.find(a => a.id === tx.accountId)?.splits.find(s => s.id === tx.splitId)?.name || "Main") : "Main",
        tx.type,
        tx.amount,
        tx.description,
        tx.source || "manual"
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "expense_manager.csv";
    link.click();
  };

  const activeAccount = accounts.find((acc) => acc.id === activeAccountId);
  const filteredTransactions = transactions.filter(
    tx =>
      tx.accountId === activeAccountId &&
      (filterSource === "all" ||
        (filterSource === "manual" && tx.source !== "bank") ||
        (filterSource === "bank" && tx.source === "bank"))
  );

  const sortedTransactions = [...filteredTransactions];
  if (sortType === "date-desc") {
    sortedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } else if (sortType === "date-asc") {
    sortedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortType === "input-desc") {
    sortedTransactions.reverse(); // latest input first
  } // input-asc is default order

  const paginatedTransactions = sortedTransactions.slice((page - 1) * pageSize, page * pageSize);

  const goLinkBank = () => {
    // Logic to connect bank account
    console.log("Connecting bank account...");
  };

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
        {!isPremium && (
          <div className="upgrade-banner">
            <b>Upgrade to Premium</b> for unlimited history, cross-device sync, and permanent backup!
          </div>
        )}
        {/* Add/select bank */}
        <div className="expense-row">
          <input
            className="expense-input"
            type="text"
            placeholder="Add new bank"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
          />
          <button
            className="expense-btn expense-btn-gradient"
            onClick={handleAddAccount}
          >
            Add Bank
          </button>
          <select
            className="expense-input"
            value={activeAccountId}
            onChange={(e) => setActiveAccountId(e.target.value)}
          >
            <option value="">Select Bank</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
        {/* Splits */}
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
              <li>
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

        {/* Transaction form */}
        {activeAccount && (
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="expense-form-row">
              <select
                className="expense-input"
                name="splitId"
                value={form.splitId}
                onChange={handleChange}
              >
                <option value="">Main</option>
                {activeAccount.splits.map((split) => (
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
              >
                <option value="add">Add Money</option>
                <option value="spend">Spend Money</option>
              </select>
            </div>
            <input
              className="expense-input"
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
            <input
              className="expense-input"
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
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
            />
            <button className="expense-btn expense-btn-gradient" type="submit">
              Submit
            </button>
          </form>
        )}
      </div>
      <div className="expense-btn-group" style={{ display: "flex", gap: "1rem", justifyContent: "center", margin: "1.2rem 0" }}>
          {!isPremium && (
            <button className="expense-btn" disabled title="Premium feature.">
              Connect Bank (Premium)
            </button>
          )}
          {isPremium && (
            <button className="expense-btn" onClick={goLinkBank}>
              Connect Bank Account
            </button>
          )}
          <button className="expense-btn" onClick={exportCSV}>Export CSV</button>
        </div>
      {/* Transactions Section - outside the card */}
      {activeAccount && (
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
                <select
                  className="expense-input"
                  style={{ width: "auto", minWidth: 140 }}
                  value={filterSource}
                  onChange={e => setFilterSource(e.target.value as typeof filterSource)}
                >
                  <option value="all">All</option>
                  <option value="manual">Manual Only</option>
                  <option value="bank">Bank Only</option>
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
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => {
                    const split = activeAccount.splits.find(
                      (s) => s.id === tx.splitId
                    );
                    return (
                      <tr
                        key={tx.id}
                        className={tx.source === "bank" ? "bank-sync-row" : "manual-row"}
                      >
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
                                : "expense-type-spend"
                            }
                          >
                            {tx.type === "add" ? "Add" : "Spend"}
                          </span>
                        </td>
                        <td>
                          {tx.type === "add" ? "+" : "-"}₹
                          {tx.amount.toFixed(2)}
                        </td>
                        <td>{tx.description}</td>
                        <td>
                          {tx.source === "bank" ? (
                            <span title={tx.bankName ? `Imported from ${tx.bankName}` : "Bank Sync"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <img src={bankIcon} alt="Bank" style={{ width: 20, height: 20, marginRight: 4 }} />
                              Bank‑Sync
                            </span>
                          ) : (
                            "Manual"
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
      )}
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
            <b>Step 1:</b> Add your bank or account using the "Add Bank" field.
            Each account tracks its own balance and splits.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Step 2:</b> Select your active bank from the dropdown to manage
            its money.
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
          <RevealOnScroll as="ul">
            <li>
              <b>Add Bank:</b> Create a new account for tracking.
            </li>
            <li>
              <b>Add Split:</b> Allocate money for a specific purpose.
            </li>
            <li>
              <b>Add/Spend Money:</b> Record every transaction for accurate
              tracking.
            </li>
            <li>
              <b>Transactions Table:</b> Review your history and stay on top of
              your finances.
            </li>
          </RevealOnScroll>
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
            <ul>
              <li>Your <b>Main</b> balance starts at ₹10,000.</li>
              <li>
                You create a <b>Groceries split</b> and allocate ₹3,000 from
                your main balance.
              </li>
              <li>
                Now, your <b>Main</b> balance is ₹7,000 and your{" "}
                <b>Groceries split</b> is ₹3,000.
              </li>
              <li>
                Your <b>Total</b> money tracked is still ₹10,000 (₹7,000 main +
                ₹3,000 split).
              </li>
            </ul>
            When you spend ₹500 on groceries, you record it under the Groceries
            split. The split balance drops to ₹2,500, and your main balance
            stays at ₹7,000.
          </RevealOnScroll>
          <RevealOnScroll as="h3">Why use splits?</RevealOnScroll>
          <RevealOnScroll as="p">
            Splits help you budget for different needs, prevent overspending in
            any category, and give you a clear view of where your money goes.
            You can create as many splits as you need for things like Rent,
            Savings, Entertainment, or any custom goal.
          </RevealOnScroll>
          <RevealOnScroll as="p">
            <b>Example:</b> Add a bank, create splits for "Groceries" and
            "Entertainment", allocate ₹5000 and ₹2000, then record your daily
            expenses. Watch your balances and splits update in real time!
          </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}