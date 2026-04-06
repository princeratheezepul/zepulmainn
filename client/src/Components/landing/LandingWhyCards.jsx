import React, { useEffect } from 'react';

const LandingWhyCards = () => {
    useEffect(() => {
        const cards = document.querySelectorAll('.lp-why-card');
        if (!cards.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('lp-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
        cards.forEach(card => observer.observe(card));
        return () => observer.disconnect();
    }, []);

    return (
        <section className="lp-why lp-section-pad" id="lp-why-section">
            <div className="lp-why-header lp-reveal">
                <h2 className="lp-section-head">Why Recruitment<br /><span className="lp-blue">Needs Reinvention?</span></h2>
                <p className="lp-section-sub">Recruitment needs reinvention because traditional hiring is slow, biased, outdated, and failing to adapt to AI and technology, missing real skills, modern work models, and evolving candidate expectations.</p>
            </div>

            <div className="lp-why-cards">

                {/* Card 1: Speed */}
                <div className="lp-why-card">
                    <div className="lp-why-card-visual">
                        <svg viewBox="0 0 280 200" overflow="hidden" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpWhyGrid1" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="280" height="200" fill="url(#lpWhyGrid1)" />
                            <circle cx="140" cy="95" r="52" fill="none" stroke="rgba(2,75,255,.1)" strokeWidth="1.5" />
                            <circle cx="140" cy="95" r="42" fill="none" stroke="rgba(2,75,255,.06)" strokeWidth="1" />
                            <circle cx="140" cy="95" fill="none" stroke="rgba(2,75,255,.15)" strokeWidth="1">
                                <animate attributeName="r" values="28;36;28" dur="3s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values=".2;.05;.2" dur="3s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="140" cy="95" r="4" fill="#024BFF" opacity=".8" />
                            <line x1="140" y1="95" x2="140" y2="62" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" style={{ transformOrigin: '140px 95px', animation: 'lp-whyClockHand 4s linear infinite' }} />
                            <line x1="140" y1="95" x2="160" y2="82" stroke="#024BFF" strokeWidth="1.5" strokeLinecap="round" opacity=".5" style={{ transformOrigin: '140px 95px', animation: 'lp-whyClockHand 12s linear infinite' }} />
                            <g opacity=".25">
                                <line x1="140" y1="45" x2="140" y2="50" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="140" y1="140" x2="140" y2="145" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="90" y1="95" x2="95" y2="95" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="185" y1="95" x2="190" y2="95" stroke="#024BFF" strokeWidth="1.5" />
                            </g>
                        </svg>
                    </div>
                    <div className="lp-why-card-body">
                        <div className="lp-why-card-title">Speed</div>
                        <div className="lp-why-card-desc">Business scales faster than hiring. Traditional recruitment cycles can't respond to sudden growth, market shifts, or urgent talent needs.</div>
                    </div>
                </div>

                {/* Card 2: Fairness */}
                <div className="lp-why-card">
                    <div className="lp-why-card-visual">
                        <svg viewBox="0 0 280 200" overflow="hidden" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpWhyGrid2" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="280" height="200" fill="url(#lpWhyGrid2)" />
                            <g transform="translate(140, 100)">
                                <polygon points="0,-10 -7,4 7,4" fill="rgba(2,75,255,.12)" stroke="#024BFF" strokeWidth="1" />
                                <g style={{ transformOrigin: '0px 4px', animation: 'lp-whyBalanceRock 4s ease-in-out infinite' }}>
                                    <line x1="-60" y1="4" x2="60" y2="4" stroke="#024BFF" strokeWidth="1.5" />
                                    <line x1="-60" y1="4" x2="-72" y2="32" stroke="rgba(2,75,255,.25)" strokeWidth=".8" />
                                    <line x1="-60" y1="4" x2="-48" y2="32" stroke="rgba(2,75,255,.25)" strokeWidth=".8" />
                                    <line x1="-76" y1="32" x2="-44" y2="32" stroke="#024BFF" strokeWidth="1.2" opacity=".6" />
                                    <circle cx="-64" cy="26" r="4" fill="rgba(2,75,255,.1)" stroke="#024BFF" strokeWidth=".8" opacity=".7" />
                                    <circle cx="-56" cy="26" r="4" fill="rgba(2,75,255,.1)" stroke="#024BFF" strokeWidth=".8" opacity=".7" />
                                    <line x1="60" y1="4" x2="48" y2="32" stroke="rgba(2,75,255,.25)" strokeWidth=".8" />
                                    <line x1="60" y1="4" x2="72" y2="32" stroke="rgba(2,75,255,.25)" strokeWidth=".8" />
                                    <line x1="44" y1="32" x2="76" y2="32" stroke="#024BFF" strokeWidth="1.2" opacity=".6" />
                                    <circle cx="60" cy="22" r="7" fill="rgba(2,75,255,.08)" stroke="#024BFF" strokeWidth=".8" opacity=".8" />
                                    <polyline points="56,22 59,25 65,18" stroke="#024BFF" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />
                                </g>
                            </g>
                            <circle cx="140" cy="100" fill="none" stroke="rgba(2,75,255,.08)" strokeWidth="1">
                                <animate attributeName="r" values="20;40;20" dur="4s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values=".15;.03;.15" dur="4s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                    </div>
                    <div className="lp-why-card-body">
                        <div className="lp-why-card-title">Fairness</div>
                        <div className="lp-why-card-desc">Hiring decisions face increasing scrutiny. Inconsistent evaluations, bias risk, and compliance gaps create pressure on leadership and TA teams.</div>
                    </div>
                </div>

                {/* Card 3: Precision */}
                <div className="lp-why-card">
                    <div className="lp-why-card-visual">
                        <svg viewBox="0 0 280 200" overflow="hidden" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpWhyGrid3" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="280" height="200" fill="url(#lpWhyGrid3)" />
                            <circle cx="140" cy="90" r="56" fill="none" stroke="rgba(2,75,255,.06)" strokeWidth="1" />
                            <circle cx="140" cy="90" r="42" fill="none" stroke="rgba(2,75,255,.1)" strokeWidth="1" />
                            <circle cx="140" cy="90" r="28" fill="none" stroke="rgba(2,75,255,.15)" strokeWidth="1.2" />
                            <circle cx="140" cy="90" r="14" fill="rgba(2,75,255,.05)" stroke="rgba(2,75,255,.2)" strokeWidth="1.2" />
                            <circle cx="140" cy="90" fill="#024BFF">
                                <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="1;.4;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                            <line x1="140" y1="32" x2="140" y2="148" stroke="rgba(2,75,255,.08)" strokeWidth=".8" strokeDasharray="3 3" />
                            <line x1="82" y1="90" x2="198" y2="90" stroke="rgba(2,75,255,.08)" strokeWidth=".8" strokeDasharray="3 3" />
                            <g style={{ animation: 'lp-whyFloat 3.5s ease-in-out infinite' }}>
                                <circle cx="105" cy="62" r="3" fill="rgba(2,75,255,.2)" stroke="#024BFF" strokeWidth=".8" />
                                <line x1="108" y1="64" x2="136" y2="88" stroke="#024BFF" strokeWidth=".5" opacity=".2" strokeDasharray="2 2">
                                    <animate attributeName="strokeDashoffset" from="10" to="0" dur="2s" repeatCount="indefinite" />
                                </line>
                            </g>
                            <g style={{ animation: 'lp-whyFloat 4s ease-in-out .5s infinite' }}>
                                <circle cx="180" cy="58" r="3" fill="rgba(2,75,255,.15)" stroke="#024BFF" strokeWidth=".8" />
                                <line x1="178" y1="60" x2="143" y2="87" stroke="#024BFF" strokeWidth=".5" opacity=".2" strokeDasharray="2 2">
                                    <animate attributeName="strokeDashoffset" from="10" to="0" dur="2.5s" repeatCount="indefinite" />
                                </line>
                            </g>
                        </svg>
                    </div>
                    <div className="lp-why-card-body">
                        <div className="lp-why-card-title">Precision</div>
                        <div className="lp-why-card-desc">Roles now require highly specific, evolving skill combinations. Legacy screening fails to identify true fit beyond keywords and job titles.</div>
                    </div>
                </div>

                {/* Card 4: Technology */}
                <div className="lp-why-card">
                    <div className="lp-why-card-visual">
                        <svg viewBox="0 0 280 200" overflow="hidden" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="lpWhyGrid4" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,75,255,.03)" strokeWidth=".5" />
                                </pattern>
                            </defs>
                            <rect width="280" height="200" fill="url(#lpWhyGrid4)" />
                            <rect x="65" y="30" width="150" height="100" rx="6" fill="none" stroke="rgba(2,75,255,.15)" strokeWidth="1.2" />
                            <rect x="65" y="30" width="150" height="18" rx="6" fill="rgba(2,75,255,.03)" />
                            <rect x="65" y="46" width="150" height="1" fill="rgba(2,75,255,.06)" />
                            <circle cx="77" cy="39" r="2" fill="rgba(2,75,255,.15)" />
                            <circle cx="85" cy="39" r="2" fill="rgba(2,75,255,.1)" />
                            <circle cx="93" cy="39" r="2" fill="rgba(2,75,255,.07)" />
                            <g opacity=".5">
                                <rect x="78" y="55" width="45" height="3" rx="1.5" fill="rgba(2,75,255,.12)" />
                                <rect x="78" y="63" width="60" height="3" rx="1.5" fill="rgba(2,75,255,.08)" />
                                <rect x="78" y="71" width="35" height="3" rx="1.5" fill="rgba(2,75,255,.1)" />
                                <rect x="78" y="79" width="55" height="3" rx="1.5" fill="rgba(2,75,255,.06)" />
                                <rect x="78" y="87" width="40" height="3" rx="1.5" fill="rgba(2,75,255,.08)" />
                            </g>
                            <rect x="133" y="87" width="2" height="8" fill="#024BFF" style={{ animation: 'lp-pcCursorBlink 1s step-end infinite' }} />
                            <line x1="140" y1="130" x2="140" y2="142" stroke="rgba(2,75,255,.12)" strokeWidth="1.5" />
                            <line x1="120" y1="142" x2="160" y2="142" stroke="rgba(2,75,255,.12)" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="lp-why-card-body">
                        <div className="lp-why-card-title">Technology</div>
                        <div className="lp-why-card-desc">Recruitment technology exists, but execution is fragmented. Poor adoption and manual workarounds limit impact and outcomes.</div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default LandingWhyCards;
