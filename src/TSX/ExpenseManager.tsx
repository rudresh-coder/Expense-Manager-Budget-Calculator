import React, { useState } from "react";
import "../CSS/ExpenseManager.css";

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
    const newTransaction: Transaction = {
      id: Math.random().toString(36).slice(2),
      accountId: activeAccountId,
      splitId: form.splitId || undefined,
      type: form.type as "add" | "spend",
      amount,
      description: form.description,
      date,
    };
    setTransactions([newTransaction, ...transactions]);
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

  const activeAccount = accounts.find((acc) => acc.id === activeAccountId);
  const filteredTransactions = transactions.filter(
    (tx) => tx.accountId === activeAccountId
  );

  return (
    <div className="expense-manager-bg">
      <div className="expense-manager-card">
        <h1 className="expense-title">Expense Manager</h1>
        {/* Add/select bank */}
        <div className="expense-row">
          <input
            className="expense-input"
            type="text"
            placeholder="Add new bank"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
          />
          <button className="expense-btn expense-btn-gradient" onClick={handleAddAccount}>
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
              <div className="error-message" style={{ color: "#e53935", marginTop: 4 }}>
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
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
            <button className="expense-btn expense-btn-gradient" type="submit">
              Submit
            </button>
          </form>
        )}
      </div>
      {/* Transactions Section - outside the card */}
      {activeAccount && (
        <div className="expense-transactions-bg">
          <div className="expense-transactions-container">
            <h2 className="expense-transactions-title">Transactions</h2>
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
                  {filteredTransactions.map((tx) => {
                    const split = activeAccount.splits.find(
                      (s) => s.id === tx.splitId
                    );
                    return (
                      <tr key={tx.id}>
                        <td>{new Date(tx.date).toLocaleString()}</td>
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}