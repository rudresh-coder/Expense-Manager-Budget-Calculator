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
            "No bank linking (manual entry only)",
            "Ad-supported",
            "Basic totals"
        ],
        btnText: "Start Free",
        btnClass: "pricing-btn free",
        link: "/signup"
    },
    {
        name: "Premium Monthly",
        price: "₹99/mo",
        features: [
            "Unlimited persistent history (database storage, never deleted)",
            "No transaction limit",
            "Export (CSV/PDF)",
            "Ad-free",
            "1 free bank account link (auto-imported transactions)",
            "Additional bank links: ₹35/account/month",
            "Multi-device Sync",
        ],
        btnText: "Buy Monthly",
        btnClass: "pricing-btn premium",
        link: "/payment?plan=monthly"
    },
    {
        name: "Premium Yearly",
        price: (
            <>
                ₹949/yr <span className="badge">Save 20%</span>
                <div className="pricing-yearly-rate">Effective ₹79/mo</div>
            </>
        ),
        features: [
            "All Premium Monthly features",
            "Extra badge: Save ₹239 vs monthly",
            "Eligible for annual promotions"
        ],
        btnText: "Buy Yearly",
        btnClass: "pricing-btn premium",
        link: "/payment?plan-yearly"
    }
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
                <h1 className="pricing-title">Plans for Every Budget</h1>
                <div className="pricing-subtitle">
                    Unlock powerful features and take control of your finances—choose the plan that fits your journey.
                </div>
            </div>
            <div className="pricing-cards-custom">
                <div className="pricing-card-row-top">
                    {/* Free and Premium Monthly cards (side by side, now on top) */}
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
                    {/* Premium Yearly card (now at the bottom, centered) */}
                    <div
                        className="pricing-card premium-yearly"
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