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
            "Spending trends, forecasts, what-if scenarios",
            "Bill Reminders & Goal-Tracker Alerts",
            "Priority Support"
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
            <h1 className="pricing-title">Choose Your Plan</h1>
            <div className="pricing-cards">
                {plans.map((plan) => (
                    <div key={plan.name} className={`pricing-card ${plan.name.toLowerCase().replace(" ", "-")}`}
                    style={{ cursor: plan.link.startsWith("/payment") ? "pointer" : "default" }}
                    onClick={() => handleCardClick(plan.link)}>
                        <h2>{plan.name}</h2>
                        <div className="pricing-price">{plan.price}</div>
                        <ul>
                            {plan.features.map((feature, i) =>(
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
            {/* <div className="pricing-note">
            <b>Special Offers:</b> 20% off annual, 1 Month free trial!!!
            </div> */}
        </div>
    );
}