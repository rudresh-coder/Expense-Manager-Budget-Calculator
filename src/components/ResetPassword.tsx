import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../CSS/AuthForms.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const emailParam = query.get("email");
    const tokenParam = query.get("token");
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setMessage(data.message);
        setTimeout(() => {
          navigate("/signin"); 
        }, 1800); 
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-form-container">
      <h2>Forgot Password</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Reset token"
          value={token}
          onChange={e => setToken(e.target.value)}
          required
        />
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            style={{ paddingRight: "2.2rem" }}
          />
          <span
            style={{
              position: "absolute",
              right: "0.7rem",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer"
            }}
            onClick={() => setShowPassword(s => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      <p style={{ fontSize: "0.98rem", color: "#7c4dff", marginBottom: "1rem", textAlign: "center" }}>
        If the reset token is not pre-filled, please copy it from the password reset link sent to your email. 
        The token is the part after <b>token=</b> in the link.
      </p>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
    </div>
  );
}