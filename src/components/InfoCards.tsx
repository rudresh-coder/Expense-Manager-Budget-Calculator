import { Link } from "react-router-dom";
import "./InfoCards.css";

export default function InfoCards() {
  return (
    <div className="container">
      <div className="box">
        <span></span>
        <div className="content">
          <h2>Debt Management</h2>
            <p>Our Debt Management strategies help you pay down what you...</p>
            <Link to="/debtmanagement">Read More</Link>        </div>
      </div>
      <div className="box">
        <span></span>
        <div className="content">
          <h2>Smart Investing Beginners</h2>
          <p>Our Smart Investing tips for beginners show you how to harness... </p>
          <Link to="/smartinvesting">Read More</Link>
        </div>
      </div>
      <div className="box">
        <span></span>
        <div className="content">
          <h2>Behavioral & Mindset</h2>
          <p>Our Behavioral & Mindset strategies give you the mental edge to...</p>
          <Link to="/behavioralmindset">Read More</Link>
        </div>
      </div>
    </div>
  );
}