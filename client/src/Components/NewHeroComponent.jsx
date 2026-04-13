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
                        const numbers = value.match(/\d+/g);
                        if (!numbers) {
                            setCount(value);
                            return;
                        }

                        const targetNumber = parseInt(numbers[0]);
                        const duration = 1500;
                        const steps = 60;
                        const increment = targetNumber / steps;
                        let current = 0;

                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= targetNumber) {
                                setCount(value);
                                clearInterval(timer);
                            } else {
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
        <div ref={elementRef} className="foh-stat-item">
            <span className="foh-stat-value">{count || value}</span>
            <span className="foh-stat-label">{label}</span>
        </div>
    );
};

const NewHeroComponent = () => {
    const scrollingItems = [
        "Distributed Recruiter Network",
        "Unified Operating System",
        "100% AI Utilisation",
        "Multi Channel Sourcing",
        "Data & Performance Driven"
    ];

    const stats = [
        { value: "3X", label: "Increase in Productivity" },
        { value: "40%", label: "Increase in Hiring Speed" },
        { value: "80%", label: "Improved Quality Hire" },
    ];

    return (
        <div className="foh-container">
            {/* Main banner */}
            <div className="foh-banner">
                {/* Left — headline */}
                <div className="foh-left">
                    <h1 className="foh-title">
                        The <span className="text-[#0449FF]">Future Of</span>
                        <br />
                        <span className="text-[#0449FF]">Recruitment</span> Is Here.
                    </h1>
                </div>

                {/* Right — description + stats */}
                <div className="foh-right">
                    <p className="foh-description">
                        An AI-powered, full-stack Talent Acquisition operating system combining
                        intelligent sourcing, AI-assessed evaluations, advanced analytics, and
                        a global partner network to deliver governed, decision-ready talent at
                        scale — powered by agile and lean execution for operational excellence,
                        all on one unified platform.
                    </p>

                    <div className="foh-stats">
                        {stats.map((stat, index) => (
                            <CountUpStat
                                key={index}
                                value={stat.value}
                                label={stat.label}
                                delay={index * 150}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Infinite Scrolling Ticker */}
            {/* <div className="scrolling-ticker-wrapper">
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
            </div> */}
        </div>
    );
};

export default NewHeroComponent;
