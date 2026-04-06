import React from "react";
import "../styles/PricingCards.css";

const plans = [
    {
        badge: "ZEP RECRUIT",
        badgeVariant: "light",
        name: "AI Hiring Platform (Self-Serve)",
        tagline: "AI-powered recruiting software for teams that want to run hiring independently while automating sourcing and screening.",
        features: [
            "AI sourcing based on your hiring criteria",
            "Automated candidate outreach and engagement",
            "AI screening and candidate scoring",
            "Interview-ready shortlisted candidates",
            "Self-serve recruitment platform.",
        ],
        dark: false,
    },
    {
        badge: "Zep Recruit",
        badgeVariant: "white",
        name: "End-to-End Hiring Partner",
        tagline: "A fully managed recruitment solution covering the entire hiring lifecycle—from AI-powered sourcing and intelligent screening to interview-ready candidates with scorecards, interview coordination, offer negotiation, and onboarding support.",
        features: [
            "Dedicated account management throughout the process",
            "70% lower cost vs traditional agencies with faster, higher-quality hiring",
            "Outcome-based pricing for complex roles",
            "Senior recruiters from top tech firms",
            "Specialized in GTM, Engineering & business-critical hiring"
        ],
        dark: true,
    },
    {
        badge: "ZEPUL ON DEMAND",
        badgeVariant: "light",
        name: "Recruiter-as-a-Service",
        tagline: "Dedicated AI-powered recruiting capacity designed to extend your TA team. Experienced recruiters supported by AI workflows deliver faster pipelines and higher productivity than traditional recruiting models. Ideal for ongoing hiring across multiple roles or managing hiring surges.",
        features: [
            "Full-funnel recruiting support",
            "AI-assisted sourcing and screening",
            "Targeting 2× recruiter productivity",
            "Scale recruiting capacity up or down with demand",
            "Interview-ready candidates delivered in no time"
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
