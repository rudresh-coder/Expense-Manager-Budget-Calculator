import { useEffect, useState, useMemo } from "react";
import { Line, Pie } from "react-chartjs-2";
import "../CSS/Analytics.css";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from "chart.js";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

import React from "react";

class ChartErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="admin-panel"><h2>Chart rendering error</h2></div>;
    }
    return this.props.children;
  }
}

interface AnalyticsProps {
  userId: string;
}

export default function Analytics({ userId }: AnalyticsProps) {
  console.log("User ID:", userId);

  const [loading, setLoading] = useState(true);
  const [spendingTrends, setSpendingTrends] = useState<Record<string, number>>({});
  interface IncomeExpense {
    [key: string]: { income: number; expense: number };
  }

  const [incomeExpense, setIncomeExpense] = useState<IncomeExpense>({} as IncomeExpense);
  const [error, setError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const query = selectedAccountId ? `?accountId=${selectedAccountId}` : "";

    Promise.all([
      fetch(`http://localhost:5000/api/analytics/spending-trends${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Spending trends error: ${res.status}`);
        }
        return res.json();
      }),
      fetch(`http://localhost:5000/api/analytics/income-expense${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Income/expense error: ${res.status}`);
        }
        return res.json();
      }),
      fetch(`http://localhost:5000/api/expense`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Expense error: ${res.status}`);
        }
        return res.json();
      })
    ])
      .then(([trends, incomeExp, expenseData]) => {
        setSpendingTrends(trends);
        setIncomeExpense(incomeExp);
        setAccounts(expenseData.accounts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setError(err.message || "Failed to load analytics.");
        setLoading(false);
      });
  }, [userId, selectedAccountId]);

  const pieData = useMemo(() => ({
    labels: Object.keys(spendingTrends),
    datasets: [{
      data: Object.values(spendingTrends),
      backgroundColor: [
        "rgba(124,77,255,0.8)",
        "rgba(97,216,135,0.8)",
        "rgba(255,206,86,0.8)",
        "rgba(229,57,53,0.8)",
        "rgba(75,192,192,0.8)"
      ]
    }]
  }), [spendingTrends]);

  const lineData = useMemo(() => ({
    labels: Object.keys(incomeExpense),
    datasets: [
      {
        label: "Income",
        data: Object.values(incomeExpense).map(d => d.income),
        borderColor: "#61d887",
        fill: false
      },
      {
        label: "Expense",
        data: Object.values(incomeExpense).map(d => d.expense),
        borderColor: "#e53935",
        fill: false
      }
    ]
  }), [incomeExpense]);

  if (loading) return <div className="admin-panel"><h1>Loading Analytics...</h1></div>;
  if (error) return <div className="admin-panel"><h1>{error}</h1></div>;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: "#7c4dff" } } },
    animation: { duration: 1200, easing: "easeInOutQuart" as const },
    elements: { line: { tension: 0.4 } }
  };

  return (
    <>
          <div className="account-selector">
        <select
          value={selectedAccountId}
          onChange={e => setSelectedAccountId(e.target.value)}
          disabled={loading || accounts.length === 0}
        >
          <option value="">All Accounts</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
      </div>
    <div className="analytics-panel">
      <h1>Advanced Analytics</h1>
      <ChartErrorBoundary>
        <div className="analytics-charts">
          <h2>Spending by Category</h2>
          <ChartErrorBoundary>
            <Pie data={pieData} options={chartOptions} />
          </ChartErrorBoundary>
        </div>
      </ChartErrorBoundary>
      {Object.keys(spendingTrends).length === 0 && (
        <div className="analytics-charts">
          <h2>No spending data available</h2>
        </div>
      )}
     
        <div className="analytics-charts">
          <h2>Income vs Expense Over Time</h2>
          <ChartErrorBoundary>
            <Line data={lineData} options={chartOptions} />
          </ChartErrorBoundary>
        </div>
      {Object.keys(incomeExpense).length === 0 && (
        <div className="analytics-charts">
          <h2>No income/expense data available</h2>
        </div>
      )}
    </div>
    </>
  );
}