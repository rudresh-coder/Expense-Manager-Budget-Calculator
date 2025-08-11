import "../CSS/Pricing.css";
import { Link, useNavigate } from "react-router-dom";

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
        link: "/payment?plan=monthly"
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
        link: "/payment?plan=yearly"
    },
];

export default function Pricing() {
    const navigate = useNavigate();

    const handleCardClick = (link: string) => {
        if (link.startsWith("/payment")) {
            navigate(link);
        }
    };

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
                    {[plans[0], plans[1]].map((plan) => (
                        <div
                            key={plan.name}
                            className={`pricing-card ${plan.name.toLowerCase().replace(" ", "-")}`}
                            style={{ cursor: plan.link.startsWith("/payment") ? "pointer" : "default" }}
                            onClick={() => handleCardClick(plan.link)}
                        >
                            <h2>{plan.name}</h2>
                            <div className="pricing-price">{plan.price}</div>
                            <ul className="pricing-card-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                            {plan.link.startsWith("/payment") ? (
                                <button className={plan.btnClass} onClick={() => handleCardClick(plan.link)}>
                                    {plan.btnText}
                                </button>
                            ) : (
                                <Link to={plan.link} className={plan.btnClass}>
                                    {plan.btnText}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
                <div className="pricing-card-row-center">
                    {/* Yearly Storage card (now at the bottom, centered) */}
                    <div
                        className="pricing-card yearly-storage"
                        style={{ cursor: plans[2].link.startsWith("/payment") ? "pointer" : "default" }}
                        onClick={() => handleCardClick(plans[2].link)}
                    >
                        <div className="premium-label">Most Popular</div>
                        <h2>{plans[2].name}</h2>
                        <div className="pricing-price">{plans[2].price}</div>
                        <ul className="pricing-card-features">
                            {plans[2].features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                            ))}
                        </ul>
                        <button className={plans[2].btnClass} onClick={() => handleCardClick(plans[2].link)}>
                            {plans[2].btnText}
                        </button>
                    </div>
                </div>
                
            </div>
         </div>
    );
}