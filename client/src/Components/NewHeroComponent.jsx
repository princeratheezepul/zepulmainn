import React, { useState, useEffect, useRef } from "react";
import "../styles/NewHeroComponent.css";

const CountUpStat = ({ value, label, delay }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);

                    setTimeout(() => {
                        // Extract number from value string
                        const numbers = value.match(/\d+/g);
                        if (!numbers) {
                            setCount(value);
                            return;
                        }

                        const targetNumber = parseInt(numbers[0]);
                        const duration = 1500; // 1.5 seconds
                        const steps = 60;
                        const increment = targetNumber / steps;
                        let current = 0;

                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= targetNumber) {
                                setCount(value);
                                clearInterval(timer);
                            } else {
                                // Reconstruct the value with current number
                                let displayValue = value.replace(/\d+/, Math.floor(current).toString());
                                setCount(displayValue);
                            }
                        }, duration / steps);
                    }, delay);
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [value, delay, hasAnimated]);

    return (
        <div
            ref={elementRef}
            className="stat-item"
            style={{
                animation: hasAnimated ? 'slideInUp 0.6s ease-out' : 'none',
                animationDelay: `${delay}ms`,
                opacity: hasAnimated ? 1 : 0
            }}
        >
            <h2
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1 leading-none transition-all duration-300 hover:from-blue-500 hover:to-blue-700 hover:scale-105 transform origin-left"
                style={{
                    filter: hasAnimated ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.3))' : 'none',
                    fontFamily: 'inherit',
                    marginTop: 0
                }}
            >
                {count || value}
            </h2>
            <p className="stat-label">
                {label}
            </p>
        </div>
    );
};

const NewHeroComponent = () => {
    const scrollingItems = [
        "DISTRIBUTED NETWORK",
        "SKILL VALIDATION",
        "AT SCREENING",
        "DISTRIBUTED NETWORK",
        "SKILL VALIDATION",
        "AT SCREENING"
    ];

    const stats = [
        {
            value: "3",
            label: <>PARALLEL TALENT<br />SOURCING CHANNELS</>
        },
        {
            value: "48 hours",
            label: <>DECISION READY TALENT<br />DATA ASSURED</>
        },
        {
            value: "100%",
            label: "AI DRIVEN"
        },
        {
            value: "200k",
            label: <>ACTIVE DATABASE<br />- ZEPDB</>
        },
        {
            value: "150+",
            label: <>ACTIVE RECRUITER<br />NETWORK</>
        }
    ];

    return (
        <div className="new-hero-container">
            <style>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
            <div className="new-hero-content">
                <div className="new-hero-left">
                    <h1 className="new-hero-title">
                        The <span className="text-primary">Future Of</span>
                        <br />
                        <span className="text-primary">Recruitment</span> Is Here.
                    </h1>
                    <p className="new-hero-description">
                        A unified, technology-driven talent acquisition operating model that combines AI, analytics, and a distributed partner network to deliver consistent, governed, decision-ready talent at scale
                    </p>
                    <p className="new-hero-subtitle-blue">
                        Your Trusted Talent and Technology Partner for Enterprise and GCC Success
                    </p>

                    <div className="new-hero-stats">
                        {stats.map((stat, index) => (
                            <CountUpStat
                                key={index}
                                value={stat.value}
                                label={stat.label}
                                delay={index * 150}
                            />
                        ))}
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
