import React from "react";
import "../styles/ZepRecruitHero.css";

const ZepRecruitHero = () => {
    const stats = [
        {
            value: "40%",
            label: "COST FLEXIBILITY COMPARED TO LEGACY AGENCY HIRING",
        },
        {
            value: "12-24 Hrs",
            label: "REQ ACKNOWLEDGEMENT & INTAKE",
        },
        {
            value: "75-85%",
            label: "FIT ACCURACY / ZERO DUPLICATE CVS",
        },
        {
            value: "80%",
            label: "PRODUCTIVITY INCREASE IN EMPLOYER TA & DELIVERY TEAMS",
        },
    ];

    return (
        <div className="zep-recruit-hero">
            {/* Main Content */}
            <div className="hero-content">
                <div className="hero-left">
                    <h1 className="hero-title">ZEP RECRUIT</h1>
                    <p className="hero-subtitle">
                        A Traditional Hiring Model Re-Imagined with AI
                    </p>
                    <p className="hero-description">
                        A legacy "pay after successful placement" model re-engineered with AI empowering entities and partner delivery agencies - delivering superior quality while reducing cost, time & complexity
                    </p>

                    {/* Statistics */}
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div className="stat-item" key={index}>
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button className="demo-btn">
                        Book a Demo →
                    </button>
                </div>

                {/* Right Side Image */}
                <div className="hero-right">
                    <img
                        src="/Rectangle 161123822(3).png"
                        alt="Zep Recruit"
                        className="hero-image"
                    />
                </div>
            </div>
        </div>
    );
};

export default ZepRecruitHero;
