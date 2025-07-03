import { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/SignUp.css";

// Dummy existing users for demonstration
const existingUsers = ["john doe", "jane smith", "alice"];

function validateEmail(email: string) {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  // At least 8 chars, one uppercase, one lowercase, one number, one special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Full Name is required");
      return;
    }
    if (existingUsers.includes(fullName.trim().toLowerCase())) {
      setError("This username is already taken");
      return;
    }
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("You must agree to the terms and conditions");
      return;
    }
    setError("");
    alert(`Welcome, ${fullName}!`);
  };

  return (
    <div className="form-container signup-form-container">
      <p className="title">Sign Up</p>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <label className="agreement-text">
          <input
            type="checkbox"
            checked={agree}
            onChange={e => setAgree(e.target.checked)}
            required
            style={{ marginRight: "0.5rem" }}
          />
          I agree to the&nbsp;
          <Link to="/terms" target="_blank">Terms & Conditions</Link>
          &nbsp;and&nbsp;
          <Link to="/privacy" target="_blank">Privacy Policy</Link>
        </label>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="sign">Sign Up</button>
      </form>
      <p className="signup">
        Already have an account? <Link to="/signin">Log In</Link>
      </p>
    </div>
  );
}