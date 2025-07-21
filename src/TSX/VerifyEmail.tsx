import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/verify-email?token=${encodeURIComponent(
        token
      )}&email=${encodeURIComponent(email)}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.error) {
          setStatus("error");
          setMessage(data.error || "Verification failed. Please try again.");
        } else {
          setStatus("success");
          setMessage("Email verified! You can now log in.");
          setTimeout(() => navigate("/signin"), 2500);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="form-container signup-form-container" style={{ minHeight: 250, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p className="title">Verify Email</p>
      {status === "loading" && <div className="success-message">Verifying...</div>}
      {status === "success" && <div className="success-message">{message}</div>}
      {status === "error" && <div className="error-message">{message}</div>}
    </div>
  );
}