import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaGithub, FaEnvelope, FaLinkedin, FaCalculator, FaHome, FaWallet,
  FaUserPlus, FaSignInAlt, FaShieldAlt, FaFileContract, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import "../CSS/Footer.css";
import logoLight from "../assets/LightBG.png";
import logoDark from "../assets/DarkBG.png";

export default function Footer() {
  const [showSocial, setShowSocial] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [dark, setDark] = useState(document.body.classList.contains("dark"));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.body.classList.contains("dark"));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-brand" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Link to="/">
          {dark ? (
            <img src={logoDark} alt="Expense Manager Logo" className="footer-logo-img" />
          ) : (
            <img src={logoLight} alt="Expense Manager Logo" className="footer-logo-img" />
          )}
        </Link>
        <span className="footer-desc">Take control of your money. Master your budget.</span>
      </div>
      <nav className="footer-links">
        <div className="footer-links-home">
          <Link to="/"><FaHome style={{ marginRight: 6 }} />Home</Link>
          <Link to="/pricing"><FaShieldAlt style={{ marginRight: 6 }} />Premium</Link>
        </div>
        {isMobile ? (
          <div className="footer-dropdowns">
            <div className="footer-dropdown">
              <button
                className="footer-dropdown-btn"
                onClick={() => setShowSocial(s => !s)}
              >
                Social Links {showSocial ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showSocial && (
                <div className="footer-dropdown-content">
                  <a href="https://github.com/rudresh-coder" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /> GitHub</a>
                  <a href="mailto:tcs.summarizer@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Gmail"><FaEnvelope /> Gmail</a>
                  <a href="https://tinyurl.com/rudresh-naidu" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /> LinkedIn</a>
                </div>
              )}
            </div>
            <div className="footer-dropdown">
              <button
                className="footer-dropdown-btn"
                onClick={() => setShowLinks(s => !s)}
              >
                More Links {showLinks ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {showLinks && (
                <div className="footer-dropdown-content">
                  <Link to="/calculator"><FaCalculator style={{ marginRight: 6 }} />Budget Calculator</Link>
                  <Link to="/expensemanager"><FaWallet style={{ marginRight: 6 }} />Expense Manager</Link>
                  <Link to="/signup"><FaUserPlus style={{ marginRight: 6 }} />Sign Up</Link>
                  <Link to="/signin"><FaSignInAlt style={{ marginRight: 6 }} />Login</Link>
                  <Link to="/privacy"><FaShieldAlt style={{ marginRight: 6 }} />Privacy</Link>
                  <Link to="/terms"><FaFileContract style={{ marginRight: 6 }} />Terms</Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="footer-links-3col">
            <div className="footer-social-col">
              <a href="https://github.com/rudresh-coder" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /> GitHub</a>
              <a href="mailto:tcs.summarizer@gmail.com" target="_blank" rel="noopener noreferrer" aria-label="Gmail"><FaEnvelope /> Gmail</a>
              <a href="https://tinyurl.com/rudresh-naidu" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /> LinkedIn</a>
            </div>
            <div className="footer-links-col">
              <Link to="/calculator"><FaCalculator style={{ marginRight: 6 }} />Budget Calculator</Link>
              <Link to="/expensemanager"><FaWallet style={{ marginRight: 6 }} />Expense Manager</Link>
              <Link to="/signup"><FaUserPlus style={{ marginRight: 6 }} />Sign Up</Link>
            </div>
            <div className="footer-links-col">
              <Link to="/signin"><FaSignInAlt style={{ marginRight: 6 }} />Login</Link>
              <Link to="/privacy"><FaShieldAlt style={{ marginRight: 6 }} />Privacy</Link>
              <Link to="/terms"><FaFileContract style={{ marginRight: 6 }} />Terms</Link>
            </div>
          </div>
        )}
      </nav>
      <div className="footer-copyright">
        © {new Date().getFullYear()} Expense Manager. All rights reserved.
      </div>
    </footer>
  );
}