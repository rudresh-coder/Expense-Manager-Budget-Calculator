import { useEffect, useState, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { authFetch } from "../utils/authFetch";
import "../CSS/Analytics.css";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from "chart.js";

Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler, 
  ArcElement
);

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
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // Add month state
  
  interface IncomeExpense {
    [key: string]: { income: number; expense: number };
  }

  const [incomeExpense, setIncomeExpense] = useState<IncomeExpense>({} as IncomeExpense);
  const [error, setError] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    const accountQuery = selectedAccountId ? `accountId=${selectedAccountId}` : "";
    const monthQuery = selectedMonth ? `month=${selectedMonth}` : "";
    const query = [accountQuery, monthQuery].filter(Boolean).join("&");
    const queryString = query ? `?${query}` : "";

    Promise.all([
      authFetch(`http://localhost:5000/api/analytics/spending-trends${queryString}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Spending trends error: ${res.status}`);
        }
        return res.json();
      }),
      authFetch(`http://localhost:5000/api/analytics/income-expense${queryString}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Income/expense error: ${res.status}`);
        }
        return res.json();
      }),
      authFetch(`http://localhost:5000/api/expense`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Expense error: ${res.status}`);
        }
        return res.json();
      })
    ])
      .then(([trendsData, incomeExp, expenseData]) => {
        setSpendingTrends(trendsData.trends || trendsData); // Handle both old and new response format
        setAvailableMonths(trendsData.availableMonths || []);
        setIncomeExpense(incomeExp);
        setAccounts(expenseData.accounts || []);
        
        // Auto-select the latest month if none is selected
        if (!selectedMonth && trendsData.availableMonths && trendsData.availableMonths.length > 0) {
          setSelectedMonth(trendsData.availableMonths[0]);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
        setError(err.message || "Failed to load analytics.");
        setLoading(false);
      });
  }, [userId, selectedAccountId, selectedMonth]);

  function generateColors(count: number, isDark: boolean) {
    const baseColors = isDark
      ? [
          "#a78bfa", "#61d887", "#ffce56", "#e53935", "#4bc0c0",
          "#bfa3e6", "#00ddeb", "#ff9a76", "#ff6363", "#237efd"
        ]
      : [
          "#7c4dff", "#61d887", "#ffce56", "#e53935", "#4bc0c0",
          "#a78bfa", "#237efd", "#ff9a76", "#ff6363", "#00ddeb"
        ];

    if (count <= baseColors.length) return baseColors.slice(0, count).map(c => `${c}cc`);
    return Array.from({ length: count }, (_, i) => {
      const hue = Math.round((360 * i) / count);
      return `hsl(${hue}, 70%, ${isDark ? "55%" : "60%"})`;
    });
  }

  const pieColors = useMemo(
    () => generateColors(Object.keys(spendingTrends).length, isDark),
    [spendingTrends, isDark]
  );

  const pieData = useMemo(() => ({
    labels: Object.keys(spendingTrends),
    datasets: [{
      data: Object.values(spendingTrends),
      backgroundColor: pieColors
    }]
  }), [spendingTrends, pieColors]);

  // Limit to last 12 months for bar chart
  const limitedIncomeExpense = useMemo(() => {
    const entries = Object.entries(incomeExpense);
    const sorted = entries.sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    const last12 = sorted.slice(-12); // Show only last 12 months
    return Object.fromEntries(last12);
  }, [incomeExpense]);

  const netSavingsData = useMemo(() => ({
    labels: Object.keys(limitedIncomeExpense),
    datasets: [
      {
        label: "Net Savings",
        data: Object.values(limitedIncomeExpense).map(d => d.income - d.expense),
        backgroundColor: Object.values(limitedIncomeExpense).map(d =>
          d.income - d.expense >= 0
            ? (isDark ? "rgba(97,216,135,0.7)" : "rgba(97,216,135,0.85)") // green for positive
            : (isDark ? "rgba(229,57,53,0.7)" : "rgba(229,57,53,0.85)")   // red for negative
        ),
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      }
    ]
  }), [limitedIncomeExpense, isDark]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const, // Move legend to side for more space
        labels: {
          color: isDark ? "#bfa3e6" : "#4b267d",
          font: { size: 10, weight: "bold" as const }, // Smaller font
          padding: 8, // Less padding
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12, // Smaller legend boxes
          generateLabels: function(chart: Chart) {
            const data = chart.data;
            if ((data.labels ?? []).length && data.datasets.length) {
              const dataset = data.datasets[0];
              return ((data.labels ?? []) as string[]).map((label: string, i: number) => {
                const value = dataset.data[i];
                const total = dataset.data
                  .filter((val): val is number => typeof val === "number")
                  .reduce((sum, val) => sum + val, 0);
                const percentage = (((value ?? 0) as number / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`, // Show percentage instead of value
                  fillStyle: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : undefined,
                  strokeStyle: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[i] : undefined,
                  lineWidth: 0,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<'pie'>) => {
            const total = ctx.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((ctx.parsed / total) * 100).toFixed(1);
            return `${ctx.label}: ₹${ctx.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      },
      title: { display: false }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        labels: { 
          color: isDark ? "#bfa3e6" : "#4b267d", 
          font: { size: 12, weight: "bold" as const } 
        } 
      },
      tooltip: {
        callbacks: {
          label: (ctx: import("chart.js").TooltipItem<'bar'>) => `Net Savings: ₹${ctx.parsed.y.toLocaleString()}`
        }
      },
      title: { display: false }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
          color: isDark ? "#bfa3e6" : "#4b267d",
          font: { size: 12, weight: "bold" as const }
        },
        ticks: {
          color: isDark ? "#bfa3e6" : "#4b267d",
          font: { size: 9 }, // Smaller font for more labels
          maxRotation: 45, // Always rotate when many labels
          minRotation: 45,
          autoSkip: true, // Skip some labels if too many
          maxTicksLimit: 12 // Maximum 12 labels
        },
        grid: {
          color: isDark ? "#44225a" : "#e0e7ff"
        }
      },
      y: {
        title: {
          display: true,
          text: "Net Savings (₹)",
          color: isDark ? "#bfa3e6" : "#4b267d",
          font: { size: 12, weight: "bold" as const }
        },
        ticks: {
          color: isDark ? "#bfa3e6" : "#4b267d",
          font: { size: 10 },
          callback: function(tickValue: string | number) {
            const value = typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
            return `₹${value.toLocaleString()}`;
          }
        },
        grid: {
          color: isDark ? "#44225a" : "#e0e7ff"
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  };

  // Helper function to format month for display
  const formatMonth = (monthString: string) => {
    if (!monthString) return "";
    const [year, month] = monthString.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading) return <div className="admin-panel"><h1>Loading Analytics...</h1></div>;
  if (error) return <div className="admin-panel"><h1>{error}</h1></div>;

  return (
    <>
      <div className="account-selector">
        <select
          aria-label="Select account for analytics"
          value={selectedAccountId}
          onChange={e => setSelectedAccountId(e.target.value)}
          disabled={loading || accounts.length === 0}
        >
          <option value="">All Accounts</option>
          {accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
        
        {/* Add Month Selector */}
        <select
          aria-label="Select month for spending analysis"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          disabled={loading || availableMonths.length === 0}
        >
          <option value="">All Time</option>
          {availableMonths.map(month => (
            <option key={month} value={month}>{formatMonth(month)}</option>
          ))}
        </select>
      </div>
      
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p className="analytics-subtitle">
          {selectedMonth 
            ? `Spending analysis for ${formatMonth(selectedMonth)}` 
            : "Visualize your spending and income trends"
          }
        </p>
      </div>
      
      <div className="analytics-panel">
        <div className="analytics-charts-grid">
          <div className="analytics-charts">
            <h2>
              Spending by Category 
              {selectedMonth && ` - ${formatMonth(selectedMonth)}`}
            </h2>
            <ChartErrorBoundary>
              {Object.keys(spendingTrends).length === 0 ? (
                <div className="analytics-empty-state">
                  {selectedMonth 
                    ? `No spending data available for ${formatMonth(selectedMonth)}` 
                    : "No spending data available"
                  }
                </div>
              ) : (
                <Pie data={pieData} options={pieOptions} />
              )}
            </ChartErrorBoundary>
          </div>
          <div className="analytics-charts">
            <h2>Net Savings Over Time</h2>
            <ChartErrorBoundary>
              {Object.keys(incomeExpense).length === 0 ? (
                <div className="analytics-empty-state">No savings data available</div>
              ) : (
                <Bar data={netSavingsData} options={barOptions} />
              )}
            </ChartErrorBoundary>
          </div>
        </div>
      </div>
    </>
  );
}