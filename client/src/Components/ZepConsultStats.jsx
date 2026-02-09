import React, { useState, useEffect, useRef } from 'react';
import '../styles/ZepConsultStats.css';

const CountUpStat = ({ value, description, delay }) => {
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
            className="stat-card"
            style={{
                animation: hasAnimated ? 'slideInUp 0.6s ease-out' : 'none',
                animationDelay: `${delay}ms`,
                opacity: hasAnimated ? 1 : 0
            }}
        >
            <div
                className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3 leading-none transition-all duration-300 hover:from-blue-500 hover:to-blue-700 hover:scale-105 transform origin-left"
                style={{
                    filter: hasAnimated ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.3))' : 'none',
                    fontFamily: 'inherit'
                }}
            >
                {count || value}
            </div>
            <div className="stat-description">{description}</div>
        </div>
    );
};

const ZepConsultStats = () => {
    const stats = [
        {
            metric: '100+',
            description: 'Delivery-ready engineers across core & emerging tech'
        },
        {
            metric: '<15',
            description: 'From requirement to billable onboarding'
        },
        {
            metric: '100%',
            description: 'Consultants assessed on skills, experience & delivery readiness'
        },
        {
            metric: '100%',
            description: 'Pre Vetted decision ready talent data ,including coding test'
        },
        {
            metric: '1-50+',
            description: 'Consultants scalable per project without renegotiation'
        },
        {
            metric: '<5%',
            description: 'Unplanned attrition during active engagements'
        }
    ];

    return (
        <div className="zep-consult-stats-container">
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
            <div className="stats-left">
                <h2>Why Zep<br />Consult</h2>
                <p className="stats-description">
                    Technology Companies • Fintech • HealthTech<br />
                    Enterprise IT From fast-growing startups to<br />
                    large organizations modernizing legacy<br />
                    systems.
                </p>
            </div>
            <div className="stats-right">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <CountUpStat
                            key={index}
                            value={stat.metric}
                            description={stat.description}
                            delay={index * 150}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ZepConsultStats;
