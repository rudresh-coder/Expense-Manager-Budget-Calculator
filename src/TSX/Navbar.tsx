import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import logo from "../assets/Expense1.png";
import "../CSS/Navbar.css";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Budget Calculator", to: "/calculator" },
  { label: "Expense Manager", to: "/premium" },
  { label: "Login", to: "/signin" },
  { label: "Sign Up", to: "/signup" },
  { label: "Premium", to: "/pricing" },
];

type NavbarProps = {
  onUserProfileClick: () => void;
  user: { avatarUrl?: string };
};

export default function Navbar({ onUserProfileClick, user }: NavbarProps) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);

      if (e.key === "Tab" && menuRef.current) {
        const focusableEls = menuRef.current.querySelectorAll<HTMLElement>(
          "a, button"
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <nav className="modern-navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Expense Manager Logo" />
        </Link>
      </div>
      <div style={{ flex: 1 }} /> {/* Spacer to push right controls to the end */}
      <div className="navbar-right-controls" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          className="navbar-toggle"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle dark mode"
          tabIndex={0}
        >
          {dark ? <FaMoon /> : <FaSun />}
          <span style={{ marginLeft: "0.5em", fontSize: "1rem" }}>
            {dark ? "Dark" : "Light"}
          </span>
        </button>
        <button
          className="navbar-profile-btn"
          onClick={onUserProfileClick}
          aria-label="Open user profile"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginLeft: "0.7rem"
          }}
        >
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt="profile" style={{ width: 34, height: 34, borderRadius: "50%" }} />
            : <FaUserCircle style={{ fontSize: "2.1rem", color: "#7c4dff" }} />
          }
        </button>
        <button
          className="navbar-menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          tabIndex={0}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <ul
        className={`navbar-list ${menuOpen ? "open" : ""}`}
        ref={menuRef}
        aria-label="Main navigation"
      >
        {navItems.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className={location.pathname === item.to ? "active" : ""}
              tabIndex={menuOpen || window.innerWidth > 1010 ? 0 : -1}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="navbar-overlay"
          tabIndex={0}
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}