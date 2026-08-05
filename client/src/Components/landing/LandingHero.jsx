import React from 'react';

const LandingHero = () => {
    return (
        <>
            {/* HERO */}
            <div className="lp-hero">
                {/* LEFT */}
                <div className="lp-hero-left">
                    <div className="lp-hl-top">
                        <h1>
                            <span className="lp-hl-line1"><span className="lp-wi">The Future Of</span></span>
                            <span className="lp-hl-line2"><span className="lp-wi"><span style={{ color: 'var(--lp-blue)' }}>Recruitment</span> Is Here.</span></span>
                        </h1>
                    </div>
                    <p className="lp-desc">
                        AI-powered Talent Acquisition Operating System
that connects Employers, Job Seekers, and Recruitment Partners through a unified
Agentic AI ecosystem.
                    </p>
                </div>

                {/* RIGHT: Ecosystem Loop */}
                <div className="lp-hero-right">
                    <div
                        className="lp-loop-stage"
                        role="img"
                        aria-label="Employers, recruitment partners and job seekers circulating through Zepul's agentic AI ecosystem"
                    >
                        <div className="lp-loop-path" />

                        {/* the two arcs sweep the whole ring, so the loop reads as continuous */}
                        <svg className="lp-loop-flow" viewBox="0 0 680 680" aria-hidden="true">
                            <defs>
                                <marker id="lp-loop-arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
                                    <path d="M0,0 L7,3 L0,6 Z" fill="#1a1a1a" />
                                </marker>
                            </defs>
                            <g className="lp-loop-arrows">
                                <path d="M117.8,280.5 A230,230 0 0,1 399.5,117.8" markerEnd="url(#lp-loop-arrow)" />
                                <path d="M562.2,399.5 A230,230 0 0,1 280.5,562.2" markerEnd="url(#lp-loop-arrow)" />
                            </g>
                        </svg>

                        <div className="lp-loop-glow" />
                        <div className="lp-loop-core">
                            <img src="/assets/logo.png" alt="" />
                        </div>

                        <span className="lp-loop-dot is-emp" />
                        <span className="lp-loop-dot is-rec" />
                        <span className="lp-loop-dot is-seek" />

                        <div className="lp-loop-card is-emp">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                                <path d="M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 11h1M14 11h1M9 15h1M14 15h1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Employers</span>
                        </div>

                        <div className="lp-loop-card is-rec">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                                <path d="M8 12l2 2 3-3M3 8l4-4 4 3-4 4-4-3zM21 8l-4-4-4 3 4 4 4-3zM7 12c-1 2-1 4 1 6M17 12c1 2 1 4-1 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>Recruitment<br />Partners</span>
                        </div>

                        <div className="lp-loop-card is-seek">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                                <circle cx="12" cy="8" r="3.2" />
                                <path d="M5 21c0-4 3-7 7-7s7 3 7 7" strokeLinecap="round" />
                            </svg>
                            <span>Job Seekers</span>
                        </div>

                        <div className="lp-loop-ai">
                            <span>Agentic AI</span>
                            {/* processor: the "engine" reading, and unlike the four-dot
                                node mark it cannot be mistaken for a drone */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--lp-blue)" strokeWidth="1.6">
                                <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
                                <rect x="8.75" y="8.75" width="6.5" height="6.5" rx="2" fill="var(--lp-blue)" stroke="none" />
                                <path d="M9.25 1.75v2.75M14.75 1.75v2.75M9.25 19.5v2.75M14.75 19.5v2.75M1.75 9.25h2.75M1.75 14.75h2.75M19.5 9.25h2.75M19.5 14.75h2.75" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingHero;
