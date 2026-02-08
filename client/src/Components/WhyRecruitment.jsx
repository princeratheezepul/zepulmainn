import React from "react";
import "../styles/WhyRecruitment.css";

const WhyRecruitment = () => {
    const reinventionData = [
        {
            icon: "/speed-icon.png",
            title: "Speed",
            description:
                "Business scales faster than hiring. Traditional recruitment cycles can't respond to sudden growth, market shifts, or urgent talent needs.",
        },
        {
            icon: "/fairness-icon.png",
            title: "Fairness",
            description:
                "Hiring decisions face increasing scrutiny. Inconsistent evaluations, bias risk, and compliance gaps create pressure on leadership and TA teams.",
        },
        {
            icon: "/precision-icon.png",
            title: "Precision",
            description:
                "Roles now require highly specific, evolving skill combinations. Legacy screening fails to identify true fit beyond keywords and job titles.",
        },
        {
            icon: "/technology-icon.png",
            title: "Technology",
            description:
                "Recruitment technology exists, but execution is fragmented. Poor adoption and manual workarounds limit impact and outcomes.",
        },
    ];

    return (
        <div className="why-recruitment-container">
            <div className="why-recruitment-header">
                <div className="why-recruitment-intro">
                    <p className="intro-text">
                        Recruitment needs reinvention because traditional hiring is slow,
                        biased, outdated, and failing to adapt to AI and technology, missing
                        real skills, modern work models, and evolving candidate expectations.
                    </p>
                </div>

                <div className="why-recruitment-title-wrapper">
                    <h2 className="why-recruitment-title">
                        Why Recruitment <span className="text-primary">Needs Reinvention</span>?
                    </h2>
                </div>
            </div>

            <div className="reinvention-cards">
                {reinventionData.map((item, index) => (
                    <div className="reinvention-card" key={index}>
                        <div className="card-icon">
                            <img src={item.icon} alt={item.title} />
                        </div>
                        <h3 className="card-title">{item.title}</h3>
                        <p className="card-description">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhyRecruitment;
