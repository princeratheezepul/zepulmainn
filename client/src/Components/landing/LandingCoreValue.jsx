import React, { useCallback, useRef, useState } from 'react';

const BriefcaseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#024BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
);

const CodeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#024BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#024BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#024BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const CARDS = [
    {
        Icon: BriefcaseIcon,
        cat: 'Managed Service',
        title: 'Fullstack AI Managed Hiring Services',
        kpi: '50%',
        kpiLabel: 'Faster',
        sub: 'AI-powered alternative to traditional agencies',
        points: [
            '50–70% faster hiring cycles',
            '30–50% lower hiring costs',
            'Built for high-volume, geo-independent hiring',
            'Access to niche talent through global recruiter network',
            'AI-Assessed, Decision-Ready Talent in 48 Hours',
        ],
    },
    {
        Icon: CodeIcon,
        cat: 'DIY Platform',
        title: 'DIY Agentic AI Execution Layer',
        kpi: '4×',
        kpiLabel: 'Productivity',
        sub: 'Replace manual recruiting with autonomous AI',
        points: [
            '100% AI Execution—JD Creation, Sourcing, Matching, Assessments & Interviews',
            '1 License = Output of ~4–6 recruiters',
            '24×7 autonomous hiring & Global hiring capability',
            'Enterprise-grade scalability for high-volume hiring',
            'Real-Time Dashboards, Performance Analytics & Decision-Ready Report Cards',
            'Up to 60% savings on payroll, tools & infrastructure',
        ],
    },
    {
        Icon: UserIcon,
        cat: 'Job Portal',
        title: 'Agentic AI Job Portal',
        kpi: '₹0',
        kpiLabel: 'For Seekers',
        sub: 'Beyond a portal — a personal AI career partner',
        points: [
            'Personalized AI career coach and mentor',
            'Access to global opportunities to job seekers',
            '⁠Greater transparency and engagement throughout the hiring journey',
            'AI-Guided Personalized Upskilling',
        ],
    },
    {
        Icon: GlobeIcon,
        cat: 'Recruiter Network',
        title: 'Global On-Demand Recruiter Network',
        kpi: '150+',
        kpiLabel: 'Recruiters',
        sub: 'Empowering recruiters, not replacing them',
        points: [
            'Access  to global business, means zero bdm cost',
            'Free access to world class AI execution layer, means zero operations cost',
            'Monetize Your Recruitment Expertise with Near-Zero Overheads⁠',
            'Our AI amplifies your speed, quality, and capacity, helping you outperform the competition',
            'Work Only on Relevant Opportunities - Anytime, Anywhere.'
           
        ],
    },
];

const GAP_PX = 20;
const SWIPE_THRESHOLD = 40;

const LandingCoreValue = () => {
    const [index, setIndex] = useState(0);
    const touchStartX = useRef(0);

    const goTo = useCallback((next) => {
        setIndex(Math.max(0, Math.min(next, CARDS.length - 1)));
    }, []);

    const step = useCallback((dir) => {
        setIndex(cur => Math.max(0, Math.min(cur + dir, CARDS.length - 1)));
    }, []);

    const onKeyDown = (event) => {
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            step(1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            step(-1);
        }
    };

    const onTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX;
    };

    const onTouchEnd = (event) => {
        const dx = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1);
    };

    return (
        <section className="lp-eco lp-cv" aria-labelledby="lp-cv-title">
            <div className="lp-cv-layout">
                <div className="lp-cv-left">
                    <p className="lp-eco-kicker">Core Value</p>
                    <h2 className="lp-eco-title" id="lp-cv-title">
                        Reliable.<br />Scalable.<br /><span className="lp-blue">Autonomous.</span>
                    </h2>
                    <p className="lp-eco-copy">Four components that form one full-stack AI hiring system.</p>

                    <div className="lp-cv-dots" role="tablist" aria-label="Core value cards">
                        {CARDS.map((card, i) => (
                            <button
                                key={card.title}
                                type="button"
                                role="tab"
                                className={`lp-cv-dot${i === index ? ' is-active' : ''}`}
                                aria-selected={i === index}
                                aria-controls={`lp-cv-card-${i}`}
                                aria-label={`Show ${card.title}`}
                                onClick={() => goTo(i)}
                            />
                        ))}
                    </div>

                    <div className="lp-cv-nav">
                        <button
                            type="button"
                            className="lp-cv-nav-btn"
                            onClick={() => step(-1)}
                            disabled={index === 0}
                            aria-label="Previous card"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="lp-cv-nav-btn"
                            onClick={() => step(1)}
                            disabled={index === CARDS.length - 1}
                            aria-label="Next card"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                        <span className="lp-cv-count">{String(index + 1).padStart(2, '0')} / {String(CARDS.length).padStart(2, '0')}</span>
                    </div>
                </div>

                <div
                    className="lp-cv-viewport"
                    tabIndex={0}
                    role="group"
                    aria-roledescription="carousel"
                    aria-label="Core value cards"
                    onKeyDown={onKeyDown}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Each card is exactly one viewport wide, so the track shifts by
                        (100% of the viewport + the flex gap) for every step. */}
                    <div
                        className="lp-cv-track"
                        style={{ transform: `translateX(calc(${-index} * (100% + ${GAP_PX}px)))` }}
                    >
                        {CARDS.map(({ Icon, cat, title, kpi, kpiLabel, sub, points }, i) => (
                            <div
                                className="lp-cv-card"
                                key={title}
                                id={`lp-cv-card-${i}`}
                                role="tabpanel"
                                aria-hidden={i !== index}
                            >
                                <div className="lp-cv-card-top">
                                    <div className="lp-cv-icon"><Icon /></div>
                                    <div className="lp-cv-head">
                                        <span className="lp-cv-cat">{cat}</span>
                                        <strong className="lp-cv-ttl">{title}</strong>
                                    </div>
                                    <div className="lp-cv-kpi">
                                        <div className="lp-cv-kn">{kpi}</div>
                                        <div className="lp-cv-kl">{kpiLabel}</div>
                                    </div>
                                </div>
                                <p className="lp-cv-sub">{sub}</p>
                                <ul className="lp-cv-list">
                                    {points.map(point => <li key={point}>{point}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingCoreValue;
