import React from "react";
import "../styles/TrustedPartners.css";

const companies = [
    "HCLTech",
    "Capgemini",
    "IBM",
    "Oracle",
    "Microsoft",
    "Infosys",
    "Wipro",
    "Deloitte",
    "Amazon",
    "Accenture",
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
                {companies.map((name, i) => (
                    <span key={i} className="tp-company">{name}</span>
                ))}
            </div>
        </div>
    );
};

export default TrustedPartners;
