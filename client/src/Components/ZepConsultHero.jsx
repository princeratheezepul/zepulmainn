import React, { useEffect } from 'react';
import '../styles/ZepConsult.css';

const ZepConsultHero = () => {
    return (
        <section className="zc-hero">
            <div className="zc-hero-left">
                <h1 className="zc-headline">ZEP<br /><span className="blue">CONSULT</span></h1>
                <p className="zc-tagline">Global, On-Demand IT Consulting for Scalable Enterprises</p>
                <p className="zc-desc">
                    Zep Consult is the technology consulting vertical of Zepul, delivering high-impact IT strategy,
                    engineering, and transformation services through a distributed network of senior consultants across
                    the globe. We help organizations architect, secure, and scale their technology with precision.
                </p>
                <button
                    className="zc-cta"
                    onClick={() => {
                        const el = document.getElementById('zc-contact-form');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    Book a Demo
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 7h10M7 2l5 5-5 5" />
                    </svg>
                </button>
            </div>

            {/* Hero Right Visual */}
            <div className="zc-hero-right">
                <div className="zc-hero-visual">
                    <svg viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Concentric rings */}
                        <g style={{ transformOrigin: '240px 240px', animation: 'heroOrbitSpin 40s linear infinite' }}>
                            <circle cx="240" cy="240" r="200" stroke="rgba(2,75,255,.06)" strokeWidth="1" />
                        </g>
                        <g style={{ transformOrigin: '240px 240px', animation: 'heroOrbitSpin 28s linear infinite reverse' }}>
                            <circle cx="240" cy="240" r="150" stroke="rgba(2,75,255,.1)" strokeWidth="1" />
                        </g>
                        <g style={{ transformOrigin: '240px 240px', animation: 'heroOrbitSpin 18s linear infinite' }}>
                            <circle cx="240" cy="240" r="95" stroke="rgba(2,75,255,.16)" strokeWidth="1.2" />
                        </g>
                        {/* Pulse ring */}
                        <circle cx="240" cy="240" r="55" stroke="rgba(2,75,255,.08)" strokeWidth="1" style={{ animation: 'heroPulse 3s ease-in-out infinite' }} />
                        {/* Center orb */}
                        <circle cx="240" cy="240" r="52" fill="url(#cGrad)" />
                        <defs>
                            <radialGradient id="cGrad" cx="35%" cy="35%">
                                <stop offset="0%" stopColor="#4d83ff" />
                                <stop offset="60%" stopColor="#024BFF" />
                                <stop offset="100%" stopColor="#0030bb" />
                            </radialGradient>
                        </defs>
                        {/* Consulting icon inside orb */}
                        <rect x="222" y="222" width="36" height="36" rx="5" stroke="white" strokeWidth="1.5" fill="none" />
                        <line x1="230" y1="234" x2="250" y2="234" stroke="white" strokeWidth="1.2" opacity=".7" />
                        <line x1="230" y1="240" x2="246" y2="240" stroke="white" strokeWidth="1.2" opacity=".7" />
                        <line x1="230" y1="246" x2="248" y2="246" stroke="white" strokeWidth="1.2" opacity=".7" />
                        {/* Node labels */}
                        <g style={{ animation: 'heroFloat 5s ease-in-out infinite' }}>
                            <rect x="190" y="18" width="100" height="36" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1.2" filter="url(#shadow)" />
                            <text x="240" y="42" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#024BFF">Upskilling</text>
                        </g>
                        <g style={{ animation: 'heroFloat 6s ease-in-out .5s infinite' }}>
                            <rect x="380" y="100" width="90" height="36" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1.2" filter="url(#shadow)" />
                            <text x="425" y="124" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#024BFF">Analytics</text>
                        </g>
                        <g style={{ animation: 'heroFloat 5.5s ease-in-out 1s infinite' }}>
                            <rect x="376" y="300" width="100" height="36" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1.2" filter="url(#shadow)" />
                            <text x="426" y="324" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#024BFF">Consulting</text>
                        </g>
                        <g style={{ animation: 'heroFloat 6.5s ease-in-out .3s infinite reverse' }}>
                            <rect x="190" y="426" width="100" height="36" rx="6" fill="#024BFF" stroke="none" />
                            <text x="240" y="450" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#fff">Delivered ✓</text>
                        </g>
                        <g style={{ animation: 'heroFloat 5s ease-in-out .8s infinite reverse' }}>
                            <rect x="4" y="300" width="110" height="36" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1.2" filter="url(#shadow)" />
                            <text x="59" y="324" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#024BFF">Performance</text>
                        </g>
                        <g style={{ animation: 'heroFloat 6s ease-in-out 1.2s infinite' }}>
                            <rect x="10" y="100" width="90" height="36" rx="6" fill="#fff" stroke="rgba(2,75,255,.25)" strokeWidth="1.2" filter="url(#shadow)" />
                            <text x="55" y="124" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="700" fill="#024BFF">Strategy</text>
                        </g>
                        {/* Drop shadow filter */}
                        <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,.06)" />
                            </filter>
                        </defs>
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default ZepConsultHero;
