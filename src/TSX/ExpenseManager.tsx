import React, { useState } from "react";
import '../CSS/App.css';
import Button from "@mui/material/Button";

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
  type: 'add' | 'spend';
  amount: number;
  description: string;
  date: string;
};

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [form, setForm] = useState({
    splitId: '',
    type: 'add',
    amount: '',
    description: '',
    date: '',
  });
  const [newSplitName, setNewSplitName] = useState('');
  const [newSplitAmount, setNewSplitAmount] = useState('');

  // Add new bank account
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
    setNewAccountName('');
  };

  // Add new split (sub-account)
  const handleAddSplit = () => {
    if (!newSplitName.trim() || !activeAccountId) return;
    const amount = parseFloat(newSplitAmount);
    if (!amount || amount <= 0) return;
    setAccounts(accounts.map(acc => {
      if (acc.id !== activeAccountId) return acc;
      if (acc.balance < amount) return acc;
      return {
        ...acc,
        balance: acc.balance - amount,
        splits: [
          ...acc.splits,
          {id: Math.random().toString(36).slice(2), name: newSplitName, balance: amount }
        ]
      };
  }));
    setNewSplitName('');
    setNewSplitAmount('');
  };

  // Handle transaction form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle transaction submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccountId) return;
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return;
    const date = form.date || new Date().toISOString();

    const acc = accounts.find(a => a.id === activeAccountId);
    if(!acc) return;
    if (form.type === 'spend') {
      if(form.splitId) {
        const split = acc.splits.find(split => split.id === form.splitId);
        if (!split || split.balance < amount) {
          alert('Insufficient split balance!');
          return;
        }
      }else {
        if (acc.balance < amount) {
          alert('Insufficient main balance!');
          return;
        }
      }
    }
    const newTransaction: Transaction = {
      id: Math.random().toString(36).slice(2),
      accountId: activeAccountId,
      splitId: form.splitId || undefined,
      type: form.type as 'add' | 'spend',
      amount,
      description: form.description,
      date,
    };
    setTransactions([newTransaction, ...transactions]);
    setAccounts(accounts.map(acc => {
      if (acc.id !== activeAccountId) return acc;
      if (form.splitId) {
        return {
          ...acc,
          splits: acc.splits.map(split =>
            split.id === form.splitId
              ? {
                  ...split,
                  balance: form.type === 'add'
                    ? split.balance + amount
                    : split.balance - amount,
                }
              : split
          ),
        };
      } else {
        return {
          ...acc,
          balance: form.type === 'add'
            ? acc.balance + amount
            : acc.balance - amount,
        };
      }
    }));
    setForm({ splitId: '', type: 'add', amount: '', description: '', date: '' });
  };

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);
  const filteredTransactions = transactions.filter(
    tx => tx.accountId === activeAccountId
  );

  return (
    <div className="container">
      <h1>Expense Manager</h1>
      {/* Add/select bank */}
      <div>
        <input
          type="text"
          placeholder="Add new bank"
          value={newAccountName}
          onChange={e => setNewAccountName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddAccount} style={{ marginLeft: 8 }}>
          Add Bank
        </Button>
        <select
          value={activeAccountId}
          onChange={e => setActiveAccountId(e.target.value)}
        >
          <option value="">Select Bank</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>
      {/* Splits */}
      {activeAccount && (
        <div>
          <h3>Splits (Divided Money)</h3>
          <input
            type="text"
            placeholder="Name Your Split"
            value={newSplitName}
            onChange={e => setNewSplitName(e.target.value)}
          />
          <input 
            type="number"
            placeholder="Amount"
            value={newSplitAmount}
            min="0"
            max={activeAccount.balance}
            onChange={e => setNewSplitAmount(e.target.value)}
            />
          <button onClick={handleAddSplit}>Add Split</button>
          <ul>
            <li>Main: ₹{activeAccount.balance.toFixed(2)}</li>
            {activeAccount.splits.map(split => (
              <li key={split.id}>{split.name}: ₹{split.balance.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
      {activeAccount && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>
          Total Balance: ₹{(
            activeAccount.balance +
            activeAccount.splits.reduce((sum, split) => sum + split.balance, 0)
          ).toFixed(2)}
        </div>
      )}
      {/* Transaction form */}
      {activeAccount && (
        <form onSubmit={handleSubmit} className="transaction-form">
          <select name="splitId" value={form.splitId} onChange={handleChange}>
            <option value="">Main</option>
            {activeAccount.splits.map(split => (
              <option key={split.id} value={split.id}>{split.name}</option>
            ))}
          </select>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="add">Add Money</option>
            <option value="spend">Spend Money</option>
          </select>
          <input
            type="number" name="amount" placeholder="Amount" value={form.amount}
            onChange={handleChange} required />
          <input
            type="text" name="description" placeholder="Description"
            value={form.description} onChange={handleChange} required />
          <input
            type="datetime-local" name="date" value={form.date}
            onChange={handleChange}
          />
          <button type='submit'>Submit</button>
        </form>
      )}
      {/* Transactions */}
      {activeAccount && (
        <section>
          <h2>Transactions</h2>
          <table>
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
              {filteredTransactions.map(tx => {
                const split = activeAccount.splits.find(s => s.id === tx.splitId);
                return (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td>{split ? split.name : 'Main'}</td>
                    <td>{tx.type === 'add' ? 'Add' : 'Spend'}</td>
                    <td>{tx.type === 'add' ? '+' : '-'}₹{tx.amount.toFixed(2)}</td>
                    <td>{tx.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}