import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./TSX/LandingPage";
// import SignUp from "./SignUp";
// import SignIn from "./SignIn";
// import BudgetCalculator from "./BudgetCalculator";
import ExpenseManager from "./TSX/ExpenseManager";
import Navbar from "./TSX/Navbar";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/calculator" element={<BudgetCalculator />} />  */}
        <Route path="/premium" element={<ExpenseManager />} />
      </Routes>
    </Router>
  );
}