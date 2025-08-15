import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./TSX/LandingPage";
import SignUp from "./TSX/SignUp";
import LogIn from "./TSX/LogIn";
import BudgetCalculator from "./TSX/BudgetCalculator";
import DebtManagement from "./TSX/DebtManagement";
import ExpenseManager from "./TSX/ExpenseManager";
import SmartInvesting from "./TSX/SmartInvesting";
import BehavioralMindset from "./TSX/BehavioralMindset";
import AdminPanel from "./TSX/AdminPanel";
import Navbar from "./TSX/Navbar";
import Footer from "./TSX/Footer";
import UserProfile from "./TSX/UserProfile";
import ScrollToTop from "./ScrollToTop";
import Terms from "./TSX/Terms";
import Privacy from "./TSX/Privacy";
import Pricing from "./TSX/Pricing";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import VerifyEmail from "./TSX/VerifyEmail";
import { Navigate } from "react-router-dom";
import Analytics from "./TSX/Analytics";
import FinanceParticlesBackground from "./components/FinanceParticlesBackground";
import { authFetch } from "./utils/authFetch";
import { syncTransactions } from "./utils/sync";

export default function App() {
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [accounts] = useState([]);
  const [user, setUser] = useState({
    _id: "",
    name: "",
    email: "",
    avatarUrl: "",
    banks: accounts,
    isPremium: false,
    isAdmin: false,
  });
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!navigator.onLine) {
        const cached = localStorage.getItem("userProfile");
        if (cached) {
          setUser(JSON.parse(cached));
          setProfileError("You are offline. Showing cached profile.");
        } else {
          setProfileError("You are offline. Cannot fetch user profile.");
        }
        setProfileLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileError("No authentication token found. Please log in.");
        setProfileLoading(false);
        return;
      }
      try {
        const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setProfileError(data.error || "Failed to fetch user profile.");
          setProfileLoading(false);
          return;
        }
        const data = await res.json();
        setUser({
          _id: data._id || "",
          name: data.fullName,
          email: data.email,
          avatarUrl: data.avatarUrl || "",
          banks: data.banks || [],
          isPremium: data.isPremium,
          isAdmin: data.isAdmin
        });
        localStorage.setItem("userProfile", JSON.stringify({
          _id: data._id || "",
          name: data.fullName,
          email: data.email,
          avatarUrl: data.avatarUrl || "",
          banks: data.banks || [],
          isPremium: data.isPremium,
          isAdmin: data.isAdmin
        }));
        if (data.trialExpiresAt) {
          localStorage.setItem("trialExpiresAt", data.trialExpiresAt);
        } else {
          localStorage.removeItem("trialExpiresAt");
        }
        setProfileError(null);
      } catch {
        setProfileError("Network error. Could not fetch user profile.");
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [accounts]);

  useEffect(() => {
    window.addEventListener("online", localSyncTransactions);
    return () => window.removeEventListener("online", localSyncTransactions);
  }, []);

  return (
    <>
      <FinanceParticlesBackground />
      <Router>
        <ScrollToTop />
        <Navbar onUserProfileClick={() => setUserProfileOpen(true)} user={{ avatarUrl: user.avatarUrl }} />
        <UserProfile
          user={user}
          open={userProfileOpen}
          onClose={() => setUserProfileOpen(false)}
        />
        {profileError && <div className="error-message">{profileError}</div>}
        {profileLoading ? (
          <div className="admin-panel"><h1>Loading...</h1></div>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<LogIn />} />
            <Route path="/calculator" element={<BudgetCalculator />} /> 
            <Route path="/expensemanager" element={<ExpenseManager userId={user._id} />} />
            <Route path="/debtmanagement" element={<DebtManagement />} />
            <Route path="/smartinvesting" element={<SmartInvesting />} />
            <Route path="/behavioralmindset" element={<BehavioralMindset />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route
              path="/analytics"
              element={
                user.isPremium
                  ? <Analytics userId={user._id} />
                  : <Navigate to="/pricing" />
              }
            />
          </Routes>
        )}
        <Footer />
      </Router>
    </>
  );
}
async function localSyncTransactions() {
  try {
    await syncTransactions();
    console.log("Transactions synced successfully on coming online.");
  } catch (error) {
    console.error("Error syncing transactions when coming online:", error);
  }
}
