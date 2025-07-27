import { useEffect, useState } from "react";
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

interface AnalyticsProps {
  userId: string;
}

export default function Analytics({ userId }: AnalyticsProps) {
  console.log("User ID:", userId);

  const [loading, setLoading] = useState(true);
  const [spendingTrends, setSpendingTrends] = useState({});
  interface IncomeExpense {
    [key: string]: { income: number; expense: number };
  }

  const [incomeExpense, setIncomeExpense] = useState<IncomeExpense>({} as IncomeExpense);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
  
    Promise.all([
      fetch("http://localhost:5000/api/analytics/spending-trends", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Spending trends error: ${res.status}`);
        }
        return res.json();
      }),
      fetch("http://localhost:5000/api/analytics/income-expense", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Income/expense error: ${res.status}`);
        }
        return res.json();
      })
    ])
      .then(([trends, incomeExp]) => {
        setSpendingTrends(trends);
        setIncomeExpense(incomeExp);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load analytics.");
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="admin-panel"><h1>Loading Analytics...</h1></div>;
  if (error) return <div className="admin-panel"><h1>{error}</h1></div>;

  const pieData = {
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
  };

  const lineData = {
        data: Object.values(incomeExpense).map((d) => d.income),
    datasets: [
      {
        label: "Income",
        data: Object.values(incomeExpense).map((d: { income: number; expense: number }) => d.income),
        borderColor: "#61d887",
        fill: false
      },
      {
        label: "Expense",
        data: Object.values(incomeExpense).map((d) => d.expense),
        borderColor: "#e53935",
        fill: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: "#7c4dff" } } },
    animation: { duration: 1200, easing: "easeInOutQuart" as const },
    elements: { line: { tension: 0.4 } }
  };

  return (
    <div className="analytics-panel">
      <h1>Advanced Analytics</h1>
      <div className="analytics-charts">
        <h2>Spending by Category</h2>
        <Pie data={pieData} options={chartOptions} />
      </div>
      <div className="analytics-charts">
        <h2>Income vs Expense Over Time</h2>
        <Line data={lineData} options={chartOptions} />
      </div>
    </div>
  );
}