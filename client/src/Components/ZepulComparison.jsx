import React from "react";
import "../styles/ZepulComparison.css";

const rows = [
    {
        legacy: "How to find active talent?",
        layer: "SOURCING",
        solution: "Multi-Channel Sourcing Powered by AI",
    },
    {
        legacy: "Is JD vs Talent the right fit?",
        layer: "SCREENING",
        solution: "Reads & Ranks CVs & Talent",
    },
    {
        legacy: "How to assess bias-free?",
        layer: "INTERVIEWING",
        solution: "100% AI-Driven Interviews & Clear Summary",
    },
    {
        legacy: "Are they the right fit?",
        layer: "ASSESSMENT",
        solution: "Dynamic Coding Tests",
    },
    {
        legacy: "How to convince them?",
        layer: "OFFER",
        solution: "Salary Benchmarking & Negotiation Teams",
    },
    {
        legacy: "Is human capability alone enough?",
        layer: "TECHNOLOGY",
        solution: "Human Judgement with AI Intelligence",
    },
    {
        legacy: "Are CVs decisive?",
        layer: "CV / RESUME",
        solution: "Decision Ready Report Cards & Talent Rank",
    },
    {
        legacy: "Can we scale as demand grows?",
        layer: "RECRUITERS",
        solution: "Global On-Demand Network at Scale",
    },
];

const ZepulComparison = () => {
    return (
        <div className="zc-wrapper">
            <div className="zc-table">
                {/* Header */}
                <div className="zc-header">
                    <div className="zc-col zc-col--left zc-header-cell">
                        LEGACY LIMITATION
                    </div>
                    <div className="zc-col zc-col--center zc-header-cell zc-header-cell--blue zc-hide-mobile">
                        Zepul Layer
                    </div>
                    <div className="zc-col zc-col--right zc-header-cell">
                        ZEPUL'S SOLUTION
                    </div>
                </div>

                {/* Rows */}
                {rows.map((row, i) => (
                    <div className="zc-row" key={i}>
                        <div className="zc-col zc-col--left zc-legacy">{row.legacy}</div>
                        <div className="zc-col zc-col--center zc-hide-mobile">
                            <span className="zc-pill">{row.layer}</span>
                        </div>
                        <div className="zc-col zc-col--right zc-solution">{row.solution}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ZepulComparison;
