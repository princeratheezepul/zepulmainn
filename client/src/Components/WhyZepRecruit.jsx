import React, { useState, useEffect, useRef } from "react";
import "../styles/WhyZepRecruit.css";

const CountUpValue = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [hasAnimated, setHasAnimated] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);

                    // Extract number from value string
                    const numbers = value.match(/\d+/g);
                    if (!numbers) {
                        setDisplayValue(value);
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
                            setDisplayValue(value);
                            clearInterval(timer);
                        } else {
                            // Reconstruct the value with current number
                            let tempValue = value.replace(/\d+/, Math.floor(current).toString());
                            setDisplayValue(tempValue);
                        }
                    }, duration / steps);

                    return () => clearInterval(timer);
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
    }, [value, hasAnimated]);

    return <span ref={elementRef}>{displayValue}</span>;
};

const WhyZepRecruit = () => {
    const stats = [
        { label: "Offer Dropouts", value: "<= 15%" },
        { label: "Database that instantly sources top talent", value: "ZepDB" },
        { label: "Joining no-shows", value: "<= 5%" },
        {
            label: "Pre Vetted decision ready talent data ,including coding test",
            value: "100%",
        },
        { label: "Hires Without lag", value: "5-5K" },
        { label: "Higher shortlist accuracy", value: "2x" },
        { label: "Lower cost-per-hire", value: "30-40%" },
        { label: "Active Recruitment Partners", value: "150+" },
    ];

    return (
        <div className="why-zep-recruit-container">
            <div className="why-zep-recruit-content">
                <div className="why-zep-recruit-left">
                    <h2 className="why-zep-recruit-title">
                        Why Zep <br /> Recruit
                    </h2>
                    <p className="why-zep-recruit-description">
                        Zep Recruit automates the tedious stages of sourcing and screening,
                        allowing your team to focus on what matters most: the people.
                    </p>
                </div>
                <div className="why-zep-recruit-right">
                    <div className="why-zep-recruit-grid">
                        {stats.map((stat, index) => (
                            <div className="why-zep-recruit-card" key={index}>
                                <p className="stat-label">{stat.label}</p>
                                <p className="stat-value">
                                    <CountUpValue value={stat.value} />
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyZepRecruit;
