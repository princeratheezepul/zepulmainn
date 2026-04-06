import React from "react";
import "../styles/TwoPaths.css";

const TwoPaths = () => {
    const handleTalkToUs = () => {
        const element = document.getElementById("beyond-recruitment");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="two-paths-section">
            <div className="two-paths-grid">

                {/* Card 1 — Zepul Recruiter (Light) */}
                <div className="tp-card tp-card--light">
                    <span className="tp-pill tp-pill--light">ZEP RECRUIT</span>
                    <h2 className="tp-heading tp-heading--blue">AI Recruiting Service</h2>
                    <p className="tp-tagline">AI + experts, augmenting your recruiting team</p>
                    <p className="tp-body">
                        Our AI agents do the heavy lifting, finding, reaching, and evaluating
                        candidates, while expert recruiters guide and refine every step. The
                        result: faster pipelines, better candidates, and flexible capacity
                        without adding headcount.
                    </p>
                    <button className="tp-btn tp-btn--dark" onClick={handleTalkToUs}>
                        Talk to Us →
                    </button>
                </div>

                {/* Card 2 — Zepul Pro Recruiter (Dark) */}
                <div className="tp-card tp-card--dark">
                    <span className="tp-pill tp-pill--dark">ZEPUL PRO RECRUITER</span>
                    <h2 className="tp-heading tp-heading--white">AI Recruiting Platform</h2>
                    <p className="tp-tagline tp-tagline--white">AI, in your recruiters' hands</p>
                    <p className="tp-body tp-body--white">
                        Equip your team to source, screen, and engage talent at scale. Combine
                        outbound sourcing, inbound evaluation, and personalized outreach in one
                        platform, so recruiters move faster without losing control.
                    </p>
                    <button className="tp-btn tp-btn--blue" onClick={handleTalkToUs}>
                        Talk to Us →
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TwoPaths;
