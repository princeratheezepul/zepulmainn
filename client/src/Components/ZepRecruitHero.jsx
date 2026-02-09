import React, { useState, useEffect, useRef } from "react";

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
            className="flex flex-col transition-all duration-300 hover:transform hover:scale-105"
            style={{
                animation: hasAnimated ? 'slideInUp 0.6s ease-out' : 'none',
                animationDelay: `${delay}ms`,
                opacity: hasAnimated ? 1 : 0
            }}
        >
            <div
                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2 leading-none transition-all duration-300 hover:from-blue-500 hover:to-blue-700"
                style={{
                    filter: hasAnimated ? 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.3))' : 'none'
                }}
            >
                {count || value}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wide leading-snug max-w-[200px]">
                {label}
            </div>
        </div>
    );
};

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
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gray-100 py-0">
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

            {/* Main Content */}
            <div className="flex items-stretch justify-between gap-8 min-h-[64vh]">
                {/* Left Content */}
                <div className="flex-1 max-w-[50%] py-12 flex flex-col justify-center"
                    style={{ paddingLeft: 'max(2rem, calc((100vw - 1280px) / 2))' }}>
                    <h1 className="text-9xl font-extrabold text-black mb-2 leading-none tracking-tight">
                        ZEP RECRUIT
                    </h1>
                    <p className="text-lg text-black font-semibold mt-1 mb-0">
                        A Traditional Hiring Model Re-Imagined with AI
                    </p>
                    <p className="text-[0.95rem] text-gray-600 leading-relaxed mb-6 max-w-[500px]">
                        A legacy "pay after successful placement" model re-engineered with AI empowering entities and partner delivery agencies - delivering superior quality while reducing cost, time & complexity
                    </p>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-10 mb-12">
                        {stats.map((stat, index) => (
                            <CountUpStat
                                key={index}
                                value={stat.value}
                                label={stat.label}
                                delay={index * 150}
                            />
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button className="bg-blue-600 text-white px-6 py-3 border-none rounded font-semibold cursor-pointer inline-flex items-center gap-2 transition-all duration-300 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/40 w-fit self-start mt-8 text-sm">
                        Book a Demo →
                    </button>
                </div>

                {/* Right Side Image - Extends to edge */}
                <div className="flex-1 max-w-[50%] flex justify-center items-center p-0">
                    <img
                        src="/Rectangle 161123822(3).png"
                        alt="Zep Recruit"
                        className="w-full h-full object-cover rounded-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default ZepRecruitHero;
