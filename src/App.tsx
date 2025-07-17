import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import LandingPage from "./TSX/LandingPage";
import SignUp from "./TSX/SignUp";
import LogIn from "./TSX/LogIn";
import BudgetCalculator from "./TSX/BudgetCalculator";
import DebtManagement from "./TSX/DebtManagement";
import ExpenseManager from "./TSX/ExpenseManager";
import SmartInvesting from "./TSX/SmartInvesting";
import BehavioralMindset from "./TSX/BehavioralMindset";
import Navbar from "./TSX/Navbar";
import Footer from "./TSX/Footer";
import UserProfile from "./TSX/UserProfile";
import ScrollToTop from "./ScrollToTop";
import Terms from "./TSX/Terms";
import Privacy from "./TSX/Privacy";
import Pricing from "./TSX/Pricing";

export default function App() {
  const [userProfileOpen, setUserProfileOpen] = useState(false);

  const user = {
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    avatarUrl: "", // or a real URL
    banks: [{ name: "ICICI" }, { name: "HDFC" }]
  };

  return (
    <Router>
      <ScrollToTop />
      <Navbar onUserProfileClick={() => setUserProfileOpen(true)} user={{ avatarUrl: user.avatarUrl }} />
      <UserProfile
        user={user}
        open={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<LogIn />} />
        <Route path="/calculator" element={<BudgetCalculator />} /> 
        <Route path="/premium" element={<ExpenseManager />} />
        <Route path="/debtmanagement" element={<DebtManagement />} />
        <Route path="/smartinvesting" element={<SmartInvesting />} />
        <Route path="/behavioralmindset" element={<BehavioralMindset />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
      <Footer />
    </Router>
  );
}