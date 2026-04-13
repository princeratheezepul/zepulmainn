import React from "react";
import "../styles/PricingCards.css";

const plans = [
    {
        badge: "ZEPUL PRO RECRUITER",
        badgeVariant: "light",
        name: "Pro Recruiter",
        tagline: "AI in your recruiters' hands",
        features: [
            "Basic pay-per-use functional AI interview",
            "Unlimited access for CV Strength",
            "Unlimited access for coding test",
            "Multi-channel sourcing dashboard",
        ],
        dark: false,
    },
    {
        badge: "MOST POPULAR",
        badgeVariant: "white",
        name: "Zepul Recruiter",
        tagline: "AI in your recruiters' hands",
        features: [
            "Basic pay-per-use functional AI interview",
            "Unlimited access for CV Strength",
            "Unlimited access for coding test",
            "Dedicated account management",
        ],
        dark: true,
    },
    {
        badge: "ZEPUL ON DEMAND",
        badgeVariant: "light",
        name: "On Demand",
        tagline: "AI in your recruiters' hands",
        features: [
            "Basic pay-per-use functional AI interview",
            "Unlimited access for CV Strength",
            "Unlimited access for coding test",
            "Global recruiter network access",
        ],
        dark: false,
    },
];

const PricingCards = () => {
    return (
        <div className="pc-wrapper">
            <div className="pc-grid">
                {plans.map((plan, i) => (
                    <div
                        key={i}
                        className={`pc-card ${plan.dark ? "pc-card--dark" : "pc-card--light"}`}
                    >
                        <span className={`pc-badge pc-badge--${plan.badgeVariant}`}>
                            {plan.badge}
                        </span>
                        <h3 className="pc-name">{plan.name}</h3>
                        <p className="pc-tagline">{plan.tagline}</p>
                        <ul className="pc-features">
                            {plan.features.map((f, fi) => (
                                <li key={fi} className="pc-feature-item">
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingCards;
