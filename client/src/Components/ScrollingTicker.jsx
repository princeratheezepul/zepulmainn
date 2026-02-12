import React from "react";
import "../styles/ScrollingTicker.css";

const ScrollingTicker = () => {
    const scrollingItems = [
        "Distributed Recruiter Network",
        "Unified Operating System",
        "100% AI Utilisation",
        "Multi Channel Sourcing",
        "Data & Performance Driven"
    ];

    return (
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
    );
};

export default ScrollingTicker;
