import "../CSS/Pricing.css";
import { useNavigate } from "react-router-dom";

const plans = [
    {
        name: "Free",
        price: "₹0/mo",
        features: [
            "Budget Calculator: Unlimited",
            "Manual Expense Entry: Database storage (up to 100 transactions/account)",
            "Transactions older than 1 month are automatically deleted",
            "Analytics dashboard",
            "Export CSV",
            "Ad-supported",
            "Basic totals"
        ],
        btnText: "Start Free",
        btnClass: "pricing-btn free",
        link: "/signup"
    },
    {
        name: "Monthly Storage",
        price: "₹79/mo",
        features: [
            "Unlimited transactions for 30 days from purchase",
            "Permanent storage for those transactions",
            "No transaction deletion for paid period",
            "Analytics dashboard",
            "Export CSV"
        ],
        btnText: "Buy Monthly",
        btnClass: "pricing-btn premium",
        link: "https://imjo.in/MZSru7"
    },
    {
        name: "Yearly Storage",
        price: (
            <>
                ₹499/yr <span className="badge">Save 47%</span>
                <div className="pricing-yearly-rate">Effective ₹41/mo</div>
            </>
        ),
        features: [
            "Unlimited transactions for 1 year from purchase",
            "Permanent storage for those transactions",
            "No transaction deletion for paid period",
            "Analytics dashboard",
            "Export CSV",
            "Heavy Discount"
        ],
        btnText: "Buy Yearly",
        btnClass: "pricing-btn premium",
        link: "https://imjo.in/WCuXzD"
    },
];

export default function Pricing() {
    const navigate = useNavigate();

    return (
        <div className="pricing-container">
            <div className="pricing-header">
                <i className="fas fa-wallet pricing-header-icon" aria-hidden="true"></i>
                <h1 className="pricing-title">Choose Your Storage Plan</h1>
                <div className="pricing-subtitle">
                    Enjoy all features for free. Upgrade anytime for unlimited, permanent transaction history and peace of mind.
                </div>
            </div>

            <div className="pricing-warning">
                <div className="pricing-warning-heading">"Warning"</div>
                <span style={{ fontWeight: 700 }}>Important:</span>
                {" "}
                If you do not have an active premium plan, your transactions will be <b>deleted after 30 days</b>.
            </div>

            <div className="pricing-cards-custom">
                <div className="pricing-card-row-top">
                    {/* Free and Monthly Storage cards (side by side, now on top) */}
                    <div
                        className="pricing-card free"
                        style={{ cursor: "default" }}
                        onClick={() => navigate(plans[0].link)}
                    >
                        <h2>{plans[0].name}</h2>
                        <div className="pricing-price">{plans[0].price}</div>
                        <ul className="pricing-card-features">
                            {plans[0].features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                        <button className={plans[0].btnClass} onClick={() => navigate(plans[0].link)}>
                            {plans[0].btnText}
                        </button>
                    </div>
                    <div
                        className="pricing-card monthly-storage"
                        style={{ cursor: "pointer" }}
                    >
                        <h2>{plans[1].name}</h2>
                        <div className="pricing-price">{plans[1].price}</div>
                        <ul className="pricing-card-features">
                            {plans[1].features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                        <a
                            href={plans[1].link}
                            className={plans[1].btnClass}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {plans[1].btnText}
                        </a>
                    </div>
                </div>
                <div className="pricing-card-row-center">
                    {/* Yearly Storage card (now at the bottom, centered) */}
                    <div
                        className="pricing-card yearly-storage"
                        style={{ cursor: "pointer" }}
                    >
                        <div className="premium-label">Most Popular</div>
                        <h2>{plans[2].name}</h2>
                        <div className="pricing-price">{plans[2].price}</div>
                        <ul className="pricing-card-features">
                            {plans[2].features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                        <a
                            href={plans[2].link}
                            className={plans[2].btnClass}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {plans[2].btnText}
                        </a>
                    </div>
                </div>
            </div>
         </div>
    );
}