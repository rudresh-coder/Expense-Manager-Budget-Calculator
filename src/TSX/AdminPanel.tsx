import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, 
} from "chart.js";


Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
);

import "../CSS/AdminPanel.css";

interface Analytics {
  totalUsers: number;
  premiumUsers: number;
  newUsersThisMonth: number;
  userGrowth: {
    labels: string[];
    data: number[];
  };
}

function AnalyticsCards({ analytics }: { analytics: Analytics }) {
  return (
    <div className="admin-analytics-cards">
      <div className="admin-card">
        <h3>Total Users</h3>
        <p>{analytics.totalUsers}</p>
      </div>
      <div className="admin-card">
        <h3>Premium Users</h3>
        <p>{analytics.premiumUsers}</p>
      </div>
      <div className="admin-card">
        <h3>New This Month</h3>
        <p>{analytics.newUsersThisMonth || 0}</p>
      </div>
      <div className="admin-card">
        <h3>Conversion Rate</h3>
        <p>{analytics.totalUsers > 0 ? Math.round((analytics.premiumUsers / analytics.totalUsers) * 100) : 0}%</p>
      </div>
    </div>
  );
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  isPremium: boolean;
  isAdmin: boolean;
  createdAt: string; // ISO date string
  bankLinks: { bankName: string; accountId: string; linkedAt: string }[];
}

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onTogglePremium: (user: User) => void;
  onDelete: (user: User) => void;
}

function UserTable({ users, onView, onTogglePremium, onDelete }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [filterPremium, setFilterPremium] = useState("all");
  const [filterAdmin, setFilterAdmin] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const filtered = users.filter(u =>
    (filterPremium === "all" || (filterPremium === "premium" ? u.isPremium : !u.isPremium)) &&
    (filterAdmin === "all" || (filterAdmin === "admin" ? u.isAdmin : !u.isAdmin)) &&
    (!filterDate || new Date(u.createdAt).toLocaleDateString() === filterDate) &&
    (u.fullName.toLowerCase().includes(search.toLowerCase()) ||
     u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedUsers = filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="admin-user-table">
      <div className="admin-filters">
        <input
          className="admin-search"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={filterPremium} onChange={e => setFilterPremium(e.target.value)}>
          <option value="all">All Users</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
        <select value={filterAdmin} onChange={e => setFilterAdmin(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
      </div>
      
      <div className="admin-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Premium</th><th>Admin</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((u: User) => (
              <tr key={u._id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>
                  <span className={u.isPremium ? "badge-premium" : "badge-free"}>
                    {u.isPremium ? "Premium" : "Free"}
                  </span>
                </td>
                <td>{u.isAdmin ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => onView(u)}>View</button>
                  <button onClick={() => onTogglePremium(u)}>
                    {u.isPremium ? "Downgrade" : "Upgrade"}
                  </button>
                  <button onClick={() => onDelete(u)} className="danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="pagination-controls">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} of {Math.ceil(filtered.length / pageSize)}</span>
        <button disabled={page * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

interface UserDetailsModalProps {
  user: User | null;
  onClose: () => void;
}

function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  if (!user) return null;
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{user.fullName}</h2>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Premium:</b> {user.isPremium ? "Yes" : "No"}</p>
        <p><b>Admin:</b> {user.isAdmin ? "Yes" : "No"}</p>
        <p><b>Joined:</b> {new Date(user.createdAt).toLocaleDateString()}</p>
        
        {user.bankLinks && user.bankLinks.length > 0 && (
          <>
            <h3>Bank Links</h3>
            <ul>
              {user.bankLinks.map((link, idx) => (
                <li key={idx}>
                  {link.bankName} ({link.accountId}) - Linked: {new Date(link.linkedAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// Add this function to get chart colors based on theme
const getChartColors = () => {
  const isDark = document.body.classList.contains('dark');
  return {
    borderColor: isDark ? "#a78bfa" : "#7c4dff",
    backgroundColor: isDark ? "rgba(167,139,250,0.1)" : "rgba(124,77,255,0.1)",
    gridColor: isDark ? "#44225a" : "#e0e7ff",
    textColor: isDark ? "#bfa3e6" : "#4b267d",
  };
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({ 
    totalUsers: 0, 
    premiumUsers: 0, 
    newUsersThisMonth: 0,
    userGrowth: { labels: [], data: [] }
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      
      fetch("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
    ])
    .then(([users, analytics]) => {
      setUsers(users || []);
      
      // Ensure analytics has the proper structure
      setAnalytics({
        totalUsers: analytics.totalUsers || 0,
        premiumUsers: analytics.premiumUsers || 0,
        newUsersThisMonth: analytics.newUsersThisMonth || 0,
        userGrowth: {
          labels: analytics.userGrowth?.labels || ["Jan", "Feb", "Mar", "Apr", "May"],
          data: analytics.userGrowth?.data || [10, 20, 40, 80, 120]
        }
      });
      
      setLoading(false);
    })
    .catch(err => {
      console.error("Failed to fetch data:", err);
      setMessage("Failed to load admin data");
      setLoading(false);
    });
  }, []);

  const handleView = (user: User) => setSelectedUser(user);
  const handleTogglePremium = async (user: User) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}/premium`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ isPremium: !user.isPremium })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      setMessage(`User ${user.fullName} is now ${!user.isPremium ? "Premium" : "Free"}`);
      
      // Refresh users
      const usersRes = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (usersRes.ok) {
        const users = await usersRes.json();
        setUsers(users);
      }
    } catch (err) {
      console.error("Failed to toggle premium:", err);
      setMessage("Failed to update user");
    }
  };
  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user ${user.fullName}?`)) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      setMessage(`User ${user.fullName} deleted`);
      
      // Refresh users
      const usersRes = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (usersRes.ok) {
        const users = await usersRes.json();
        setUsers(users);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      setMessage("Failed to delete user");
    }
  };

  const colors = getChartColors();
  const userGrowthData = {
    labels: (analytics.userGrowth && analytics.userGrowth.labels && analytics.userGrowth.labels.length > 0) 
      ? analytics.userGrowth.labels 
      : ["Jan", "Feb", "Mar", "Apr", "May"], 
    datasets: [
      {
        label: "User Growth",
        data: (analytics.userGrowth && analytics.userGrowth.data && analytics.userGrowth.data.length > 0) 
          ? analytics.userGrowth.data 
          : [10, 20, 40, 80, 120], 
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: colors.textColor,
        },
      },
      tooltip: {
        backgroundColor: document.body.classList.contains('dark') ? '#1d061a' : '#fff',
        titleColor: colors.textColor,
        bodyColor: colors.textColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.gridColor,
        },
        ticks: {
          color: colors.textColor,
        },
      },
      y: {
        grid: {
          color: colors.gridColor,
        },
        ticks: {
          color: colors.textColor,
        },
      },
    },
  };

  if (loading) {
    return <div className="admin-panel"><h1>Loading...</h1></div>;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <AnalyticsCards analytics={analytics} />
      <div className="admin-charts">
        <h2>User Growth</h2>
        <Line data={userGrowthData} options={chartOptions} />
      </div>
      {message && <div className="admin-message">{message}</div>}
      <UserTable
        users={users}
        onView={handleView}
        onTogglePremium={handleTogglePremium}
        onDelete={handleDelete}
      />
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
}