import React from 'react';
import '../styles/ZepConsultServe.css';

const ZepConsultServe = () => {
    const industries = [
        "Fintech",
        "HealthTech",
        "E-commerce",
        "Manufacturing",
        "Education",
        "Logistics"
    ];

    return (
        <div className="zep-consult-serve-container">
            <h2>Who We Serve</h2>
            <div className="industries-grid">
                {industries.map((industry, index) => (
                    <div key={index} className="industry-card">
                        <div className="industry-icon">
                            <span>★</span> {/* Placeholder icon */}
                        </div>
                        <span className="industry-name">{industry}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ZepConsultServe;
