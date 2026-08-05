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
                            <span className="lp-hl-line1"><span className="lp-wi"><span style={{ color: 'var(--lp-ink)' }}>The</span> Future Of</span></span>
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
                            {/* infinity mark — colour floods in from the bottom tail
                                up to the top one, then drains out the same way */}
                            <svg className="lp-loop-mark" viewBox="0 0 234 347" fill="none" aria-hidden="true">
                                <defs>
                                    <g id="lp-mark-glyph">
                                        <path d="M214.678 283.788L154.559 225.185C153.889 224.531 153.454 223.655 153.415 222.72C153.053 213.982 158.43 212.9 162.595 213.744C164.105 214.05 165.39 214.949 166.502 216.015C187.914 236.539 228.321 275.105 231.124 277.107C234.002 279.163 233.694 284.131 233.351 286.358L218.276 302.289C201.659 319.248 157.177 347 110.866 347C53.8205 347 24.8453 311.857 11.1659 298.178C-0.654124 286.358 0.372809 278.099 2.42928 274.537C4.48575 270.975 105.58 172 105.58 172L114.58 182.5L16.8191 282.246C28.8105 296.122 65.6406 330.041 112.408 330.041C160.354 330.041 200.46 301.261 214.678 283.788Z" fill="#024BFF" />
                                        <path d="M230.79 59.2048C233.257 62.4939 231.818 66.0573 230.79 67.4279L113.951 183.06L104.186 173.295L213.831 62.8023C212.46 61.6031 206.944 56.5324 195.844 45.8429C181.968 32.481 157.3 15.0077 105.394 15.5216C63.869 15.9327 27.4492 48.5838 14.4299 64.8579C35.8433 86.1 79.5912 128.838 80.2117 131.154C81.0379 134.237 79.4662 138.437 76.9485 139.89C75.9246 140.481 74.7274 140.816 73.4836 140.955C70.6222 141.275 68.0265 139.623 66.0336 137.545C47.7241 118.453 13.8495 84.0575 5.69328 76.6781C-2.94057 68.8665 0.183742 60.4261 2.58203 57L16.4856 41.7315C30.1901 26.9992 70.7556 -1.95167 123.381 0.10401C189.163 2.67361 227.707 55.0935 230.79 59.2048Z" fill="#0A0A0A" />
                                    </g>

                                    {/* soft leading and trailing edges, so the fill
                                        reads as liquid rather than a hard bar */}
                                    <linearGradient id="lp-mark-fill-grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                                        <stop offset="6%" stopColor="#fff" stopOpacity="1" />
                                        <stop offset="94%" stopColor="#fff" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                                    </linearGradient>

                                    <mask id="lp-mark-fill-mask">
                                        <rect
                                            className="lp-mark-wipe"
                                            x="-300"
                                            y="347"
                                            width="840"
                                            height="700"
                                            fill="url(#lp-mark-fill-grad)"
                                        />
                                    </mask>
                                </defs>

                                {/* unfilled ghost, always visible so the shape holds */}
                                <use href="#lp-mark-glyph" className="lp-mark-ghost" />
                                {/* the same glyph in full colour, revealed by the wipe */}
                                <use href="#lp-mark-glyph" mask="url(#lp-mark-fill-mask)" />
                            </svg>
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
