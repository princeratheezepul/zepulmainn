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
            {/* Centered header section */}
            <div className="why-recruitment-header">
                <span className="why-recruitment-pill">CHOOSE YOUR PATH</span>
                <h2 className="why-recruitment-title">
                    Two Paths to Great Hires.
                </h2>
                <p className="why-recruitment-subtitle">
                    Whether you want AI to handle everything or want AI in your
                    <br />
                    team's hands Zepul fits your workflow.
                </p>
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
