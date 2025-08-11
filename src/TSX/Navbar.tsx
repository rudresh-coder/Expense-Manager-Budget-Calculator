import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoon, FaSun, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import logoLight from "../assets/LightBG.png";
import logoDark from "../assets/DarkBG.png";
import "../CSS/Navbar.css";

type NavbarProps = {
  onUserProfileClick: () => void;
  user: { avatarUrl?: string };
};

export default function Navbar({ onUserProfileClick, user }: NavbarProps) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 865);
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 865);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="modern-navbar grid-navbar">
      <div className="navbar-logo">
        <Link to="/">
        {dark ? (
          <img src={logoDark} alt="Expense Manager Logo" />
        ) : (
          <img src={logoLight} alt="Expense Manager Logo" />
        )}
        </Link>
      </div>
      {isMobile ? (
        <>
          <button
            className="navbar-menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open navigation menu"
            style={{ background: "none", border: "none", fontSize: "2rem", marginLeft: "1rem", cursor: "pointer" }}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
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
          {menuOpen && (
            <>
              <div className="navbar-list open">
                <Link to="/calculator" onClick={() => setMenuOpen(false)} className={location.pathname === "/calculator" ? "active" : ""}>Budget Calculator</Link>
                <Link to="/expensemanager" onClick={() => setMenuOpen(false)} className={location.pathname === "/expensemanager" ? "active" : ""}>Expense Manager</Link>
                <Link to="/pricing" onClick={() => setMenuOpen(false)} className={location.pathname === "/pricing" ? "active" : ""}>Storage</Link>
                <Link to="/" onClick={() => setMenuOpen(false)} className={location.pathname === "/" ? "active" : ""}>Home</Link>
                <Link to="/signin" onClick={() => setMenuOpen(false)} className={location.pathname === "/signin" ? "active" : ""}>Login</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className={location.pathname === "/signup" ? "active" : ""}>Sign Up</Link>
                <button
                  className="navbar-toggle"
                  onClick={() => { setDark((d) => !d); setMenuOpen(false); }}
                  aria-label="Toggle dark mode"
                  tabIndex={0}
                >
                  {dark ? <FaMoon /> : <FaSun />}
                  <span style={{ marginLeft: "0.5em", fontSize: "1rem" }}>
                    {dark ? "Dark" : "Light"}
                  </span>
                </button>
              </div>
              <div className="navbar-overlay" onClick={() => setMenuOpen(false)} />
            </>
          )}
        </>
      ) : (
        <div className="navbar-links-grid">
          {/* First row */}
          <div className="navbar-row">
            <Link to="/calculator" className={location.pathname === "/calculator" ? "active" : ""}>Budget Calculator</Link>
            <Link to="/expensemanager" className={location.pathname === "/expensemanager" ? "active" : ""}>Expense Manager</Link>
            <Link to="/pricing" className={location.pathname === "/pricing" ? "active" : ""}>Storage</Link>
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
          </div>
          {/* Second row */}
          <div className="navbar-row">
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
            <Link to="/signin" className={location.pathname === "/signin" ? "active" : ""}>Login</Link>
            <Link to="/signup" className={location.pathname === "/signup" ? "active" : ""}>Sign Up</Link>
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
          </div>
        </div>
      )}
    </nav>
  );
}