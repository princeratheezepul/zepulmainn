import React from "react";
import "../styles/NewHeroComponent.css";

const NewHeroComponent = () => {
    const scrollingItems = [
        "DISTRIBUTED NETWORK",
        "SKILL VALIDATION",
        "AT SCREENING",
        "DISTRIBUTED NETWORK",
        "SKILL VALIDATION",
        "AT SCREENING"
    ];

    return (
        <div className="new-hero-container">
            <div className="new-hero-content">
                <div className="new-hero-left">
                    <h1 className="new-hero-title">
                        The <span className="text-primary">Future Of Recruitment</span> Is Here.
                    </h1>
                    <p className="new-hero-description">
                        A unified, technology-driven talent acquisition operating model that
                        combines Al, analytics, and a distributed partner network to deliver
                        consistent, governed, decision-ready talent at scale
                    </p>
                    <p className="new-hero-subtitle">
                        Your Trusted Talent and Technology Partner for Enterprise and GCC
                        Success
                    </p>

                    <div className="new-hero-stats">
                        <div className="stat-item">
                            <h2 className="stat-number">3</h2>
                            <p className="stat-label">
                                PARALLEL TALENT
                                <br />
                                SOURCING CHANNELS
                            </p>
                        </div>

                        <div className="stat-item">
                            <h2 className="stat-number">48 hours</h2>
                            <p className="stat-label">
                                DECISION READY TALENT
                                <br />
                                DATA ASSURED
                            </p>
                        </div>

                        <div className="stat-item">
                            <h2 className="stat-number">100%</h2>
                            <p className="stat-label">AI DRIVEN</p>
                        </div>

                        <div className="stat-item">
                            <h2 className="stat-number">200k</h2>
                            <p className="stat-label">
                                ACTIVE DATABASE
                                <br />- ZEPDB
                            </p>
                        </div>

                        <div className="stat-item">
                            <h2 className="stat-number">150+</h2>
                            <p className="stat-label">
                                ACTIVE RECRUITER
                                <br />
                                NETWORK
                            </p>
                        </div>
                    </div>

                    <button className="book-demo-btn">
                        Book a Demo <span className="arrow">→</span>
                    </button>
                </div>

                <div className="new-hero-right">
                    <img
                        src="/Rectangle 161123822(2).png"
                        alt="Future of Recruitment"
                        className="hero-image"
                    />
                </div>
            </div>

            {/* Infinite Scrolling Ticker */}
            <div className="scrolling-ticker-wrapper">
                <div className="scrolling-ticker">
                    <div className="scrolling-ticker-track">
                        {scrollingItems.map((item, index) => (
                            <div key={`item-1-${index}`} className="scrolling-ticker-item">
                                {item}
                            </div>
                        ))}
                    </div>
                    <div className="scrolling-ticker-track">
                        {scrollingItems.map((item, index) => (
                            <div key={`item-2-${index}`} className="scrolling-ticker-item">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewHeroComponent;
