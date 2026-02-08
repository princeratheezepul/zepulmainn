import React from "react";
import "../styles/WhyChooseZepul.css";

const WhyChooseZepul = () => {
    const comparisonData = [
        {
            legacy: "How To Find  Active Talent",
            stage: "SOURCING",
            solution: "Multi Channel Sourcing Empowered With AI",
        },
        {
            legacy: "Is JD V/S Talent Right Fit ?",
            stage: "SCREENING",
            solution: "Reads, & Ranks CV's & Talent",
        },
        {
            legacy: "How To Assess Bias Free ?",
            stage: "INTERVIEWING",
            solution: "100% AI Driven Interviews & Clear Summary",
        },
        {
            legacy: "Are They Right Fit ?",
            stage: "ASSESSMENT",
            solution: "Dynamic Coding Tests",
        },
        {
            legacy: "How To Convince Them  ?",
            stage: "OFFER",
            solution: "Salary Benchmarking And Negotiation Teams",
        },
        {
            legacy: "Is Human Capability Alone Enough",
            stage: "TECHNOLOGY",
            solution: "Combine Human Judgement With AI Intelligence",
        },
        {
            legacy: "Are CVs Decisive?",
            stage: "CV / RESUME",
            solution: "Decision Ready Report  Cards - CV Strenght, Talent Rank, Code Rank & CV, All In One",
        },
        {
            legacy: "Can We Scale The Team As Demand Grows?",
            stage: "RECRUITERS",
            solution: "Global On-Demand Network To Scale With Demand",
        },
    ];

    return (
        <div className="why-choose-zepul-container">
            <h2 className="why-choose-title">
                Why <span className="text-primary">Progressive Leaders & Forward-Thinking Enterprises</span> Choose Zepul ?
            </h2>

            <div className="comparison-table">
                <div className="table-headers">
                    <div className="header-left">LEGACY LIMITATION</div>
                    <div className="header-middle"></div>
                    <div className="header-right">ZEPUL'S SOLUTION</div>
                </div>

                <div className="comparison-rows">
                    {comparisonData.map((item, index) => (
                        <div className="comparison-row" key={index}>
                            <div className="legacy-box">
                                <p>{item.legacy}</p>
                            </div>

                            <div className="arrow-section">
                                <span className="arrow-icon gray">→</span>
                            </div>

                            <div className="stage-box">
                                <p>{item.stage}</p>
                            </div>

                            <div className="arrow-section">
                                <span className="arrow-icon blue">→</span>
                            </div>

                            <div className="solution-box">
                                <p>{item.solution}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WhyChooseZepul;
