import React from "react";
import "../styles/TrustedPartners.css";

const companies = [
    "Omnicom",
    "Annalect",
    "Flywheel",
    "Media Brands",
    "Rapport Outdoor Advertising",
    "Initiative Media",
    "Mccann Erikson",
    "Orion Media Trading",
    "Fractal.ai",
    "Vira Insight",
    "Velvette Lifestyle",
    "Manah Dynamics",
    "Tiny Twig",
    "MTX Labs",
    "Ngenux",
    "Ngenue",
    "Trace RT",
    "Starbuzz.ai",
    "Comline",
    "ASBL"
];

const TrustedPartners = () => {
    return (
        <div className="tp-wrapper">
            <h2 className="tp-heading">
                Your Trusted Talent And Technology Partner
                <br />
                For Enterprise And GCC Success
            </h2>

            <div className="tp-companies-row">
                <div className="tp-companies-track">
                    {companies.map((name, i) => (
                        <span key={`first-${i}`} className="tp-company">{name}</span>
                    ))}
                    {companies.map((name, i) => (
                        <span key={`second-${i}`} className="tp-company">{name}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustedPartners;
