import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome, FaCalculator, FaWallet, FaMoon, FaSun
} from "react-icons/fa";
import "../CSS/Navbar.css";
import loginIcon from "../assets/login.png";
import signupIcon from "../assets/signup.png";

const navItems = [
  {
    label: "Home",
    to: "/",
    icon: <FaHome />,
    gradient: ["#a955ff", "#ea51ff"],
  },
  {
    label: "Budget Calculator",
    to: "/calculator",
    icon: <FaCalculator />,
    gradient: ["#56CCF2", "#2F80ED"],
  },
  {
    label: "Expense Manager",
    to: "/premium",
    icon: <FaWallet />,
    gradient: ["#FF9966", "#FF5E62"],
  },
  {
    label: "Login",
    to: "/signin",
    icon: <img src={loginIcon} alt="Login" style={{ width: 24, height: 24, display: "block" }} />,
    gradient: ["#80FF72", "#7EE8FA"],
  },
  {
    label: "Sign Up",
    to: "/signup",
    icon: <img src={signupIcon} alt="Sign Up" style={{ width: 24, height: 24, display: "block" }} />,
    gradient: ["#ffa9c6", "#f434e2"],
  },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <nav className="animated-navbar">
      <ul>
        {navItems.map((item) => (
          <li
            key={item.label}
            style={{ "--i": item.gradient[0], "--j": item.gradient[1] } as React.CSSProperties}
            className={location.pathname === item.to ? "active" : ""}
          >
            <Link to={item.to} tabIndex={0}>
              <span className="icon">{item.icon}</span>
              <span className="title">{item.label}</span>
            </Link>
          </li>
        ))}
        {/* Dark/Light mode toggle */}
        <li
          style={{ "--i": "#ffe259", "--j": "#ffa751" } as React.CSSProperties}
        >
          <button
            className="icon-btn"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark mode"
            tabIndex={0}
          >
            <span className="icon">{dark ? <FaMoon /> : <FaSun />}</span>
            <span className="title">{dark ? "Dark" : "Light"}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}