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
                        An AI-powered, full-stack Talent Acquisition operating system combining intelligent sourcing, AI-assessed evaluations, advanced analytics, and a global partner network to deliver governed, decision-ready talent at scale powered by agile and lean execution for operational excellence, all on one unified platform.
                    </p>
                </div>

                {/* RIGHT: Orbital Illustration */}
                <div className="lp-hero-right">
                    <div className="lp-hero-orbit">
                        <div className="lp-orbit-ring lp-orbit-ring-outer"></div>
                        <div className="lp-orbit-ring lp-orbit-ring-mid"></div>
                        <div className="lp-orbit-ring lp-orbit-ring-inner"></div>
                        <div className="lp-orb-dot lp-orb-dot-a"></div>
                        <div className="lp-orb-dot lp-orb-dot-b"></div>
                        <div className="lp-orb-dot lp-orb-dot-c"></div>
                        <div className="lp-hero-orb">
                            <svg viewBox="0 0 44 44" fill="none">
                                <circle cx="22" cy="16" r="7" stroke="white" strokeWidth="2" />
                                <path d="M8 38c0-7.732 6.268-14 14-14h0c7.732 0 14 6.268 14 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <path d="M30 10l4-4M30 10l-4-4M30 10v-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".6" />
                            </svg>
                        </div>

                        {/* Active Talent Pool (top-left) */}
                        <div className="lp-hero-float lp-hero-float-match">
                            <div className="lp-hero-float-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="lp-hero-float-label">Active Talent Pool</div>
                            <div className="lp-hero-float-value" style={{ fontSize: '22px' }}>400K+</div>
                            <div className="lp-hero-float-sub">Verified global candidates</div>
                        </div>

                        {/* Global Recruiters (top-right) */}
                        <div className="lp-hero-float lp-hero-float-ai">
                            <div className="lp-hero-float-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <div className="lp-hero-float-label">Global Recruiters</div>
                            <div className="lp-hero-float-value" style={{ fontSize: '22px' }}>150+</div>
                            <div className="lp-hero-float-sub">On-demand recruiter network</div>
                        </div>

                        {/* Global Placements (bottom-left) */}
                        <div className="lp-hero-float lp-hero-float-speed">
                            <div className="lp-hero-float-icon green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div className="lp-hero-float-label">Global Placements</div>
                            <div className="lp-hero-float-value" style={{ fontSize: '22px' }}>5000+</div>
                            <div className="lp-hero-float-sub">Successful hires delivered</div>
                        </div>

                        {/* Automated Workflow (bottom-right) */}
                        <div className="lp-hero-float lp-hero-float-quality">
                            <div className="lp-hero-float-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                            </div>
                            <div className="lp-hero-float-label">Automated Workflow</div>
                            <div className="lp-hero-float-value" style={{ fontSize: '22px' }}>
                                80%
                                <span className="lp-hero-float-badge">AI-Driven</span>
                            </div>
                            <div className="lp-hero-float-sub">AI-driven hiring efficiency</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LandingHero;
