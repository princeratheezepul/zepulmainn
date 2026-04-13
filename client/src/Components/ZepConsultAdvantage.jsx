import React, { useEffect, useRef } from 'react';
import '../styles/ZepConsult.css';

const ZepConsultAdvantage = () => {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        const reveals = sectionRef.current?.querySelectorAll('.zc-reveal');
        reveals?.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <section className="zc-adv" ref={sectionRef}>
            <div className="zc-adv-header zc-reveal">
                <h2>Our Core <span>Advantage</span></h2>
            </div>
            <div className="zc-adv-grid">
                {/* Card 1 */}
                <div className="zc-adv-card zc-reveal">
                    <div className="zc-adv-visual">
                        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="120" cy="120" r="60" stroke="#024BFF" strokeWidth="1.5" opacity=".2" />
                            <g style={{ transformOrigin: '120px 120px', animation: 'advGlobeSpin 20s linear infinite' }}>
                                <ellipse cx="120" cy="120" rx="30" ry="60" stroke="#024BFF" strokeWidth="1" opacity=".3" />
                                <ellipse cx="120" cy="120" rx="50" ry="60" stroke="#024BFF" strokeWidth="1" opacity=".2" />
                            </g>
                            <path d="M60 120h120" stroke="#024BFF" strokeWidth="1" opacity=".15" />
                            <path d="M120 60v120" stroke="#024BFF" strokeWidth="1" opacity=".15" />
                            <circle cx="120" cy="60" r="4" fill="#024BFF" style={{ animation: 'advPing 2s ease-in-out infinite' }} />
                            <circle cx="180" cy="120" r="4" fill="#024BFF" opacity=".6" style={{ animation: 'advPing 2s ease-in-out .7s infinite' }} />
                            <circle cx="120" cy="180" r="4" fill="#024BFF" opacity=".6" style={{ animation: 'advPing 2s ease-in-out 1.4s infinite' }} />
                            <circle cx="60" cy="120" r="4" fill="#024BFF" opacity=".6" style={{ animation: 'advPing 2s ease-in-out .3s infinite' }} />
                            <g style={{ animation: 'advFloat 4s ease-in-out infinite' }}>
                                <rect x="22" y="28" width="50" height="34" rx="4" fill="#fff" stroke="#E3E5EE" strokeWidth="1.5" />
                                <circle cx="38" cy="42" r="6" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="50" y1="38" x2="64" y2="38" stroke="#E3E5EE" strokeWidth="2" />
                                <line x1="50" y1="46" x2="60" y2="46" stroke="#E3E5EE" strokeWidth="2" />
                            </g>
                            <g style={{ animation: 'advFloat 5s ease-in-out .6s infinite' }}>
                                <rect x="168" y="28" width="50" height="34" rx="4" fill="#fff" stroke="#E3E5EE" strokeWidth="1.5" />
                                <circle cx="184" cy="42" r="6" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="196" y1="38" x2="210" y2="38" stroke="#E3E5EE" strokeWidth="2" />
                                <line x1="196" y1="46" x2="206" y2="46" stroke="#E3E5EE" strokeWidth="2" />
                            </g>
                            <g style={{ animation: 'advFloat 4.5s ease-in-out 1.2s infinite' }}>
                                <rect x="22" y="178" width="50" height="34" rx="4" fill="#fff" stroke="#E3E5EE" strokeWidth="1.5" />
                                <circle cx="38" cy="192" r="6" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="50" y1="188" x2="64" y2="188" stroke="#E3E5EE" strokeWidth="2" />
                                <line x1="50" y1="196" x2="60" y2="196" stroke="#E3E5EE" strokeWidth="2" />
                            </g>
                            <g style={{ animation: 'advFloat 5.5s ease-in-out .9s infinite' }}>
                                <rect x="168" y="178" width="50" height="34" rx="4" fill="rgba(2,75,255,.06)" stroke="#024BFF" strokeWidth="1.5" />
                                <circle cx="184" cy="192" r="6" fill="#024BFF" stroke="#024BFF" strokeWidth="1.5" />
                                <line x1="196" y1="188" x2="210" y2="188" stroke="#024BFF" strokeWidth="2" />
                                <line x1="196" y1="196" x2="206" y2="196" stroke="#024BFF" strokeWidth="2" />
                            </g>
                            <line x1="72" y1="55" x2="96" y2="75" stroke="#024BFF" strokeWidth="1" strokeDasharray="3 3" opacity=".4" />
                            <line x1="168" y1="55" x2="144" y2="75" stroke="#024BFF" strokeWidth="1" strokeDasharray="3 3" opacity=".4" />
                            <line x1="72" y1="185" x2="96" y2="165" stroke="#024BFF" strokeWidth="1" strokeDasharray="3 3" opacity=".4" />
                            <line x1="168" y1="185" x2="144" y2="165" stroke="#024BFF" strokeWidth="1.5" opacity=".5" />
                        </svg>
                    </div>
                    <div className="zc-adv-body">
                        <div className="zc-adv-title">On-Demand Global Consultant Network</div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="zc-adv-card zc-reveal">
                    <div className="zc-adv-visual">
                        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity=".25">
                                <circle cx="60" cy="60" r="10" stroke="#7A7E92" strokeWidth="1.5" />
                                <path d="M44 86c0-10 7-16 16-16s16 6 16 16" stroke="#7A7E92" strokeWidth="1.5" />
                            </g>
                            <g opacity=".25">
                                <circle cx="180" cy="60" r="10" stroke="#7A7E92" strokeWidth="1.5" />
                                <path d="M164 86c0-10 7-16 16-16s16 6 16 16" stroke="#7A7E92" strokeWidth="1.5" />
                            </g>
                            <g opacity=".2">
                                <circle cx="120" cy="40" r="10" stroke="#7A7E92" strokeWidth="1.5" />
                                <path d="M104 66c0-10 7-16 16-16s16 6 16 16" stroke="#7A7E92" strokeWidth="1.5" />
                            </g>
                            <g style={{ animation: 'advScale 3s ease-in-out infinite' }}>
                                <circle cx="120" cy="130" r="40" stroke="#024BFF" strokeWidth="2" fill="#fff" />
                                <line x1="148" y1="158" x2="170" y2="180" stroke="#024BFF" strokeWidth="5" strokeLinecap="round" />
                            </g>
                            <circle cx="120" cy="118" r="12" stroke="#024BFF" strokeWidth="2" />
                            <path d="M102 150c0-12 8-18 18-18s18 6 18 18" stroke="#024BFF" strokeWidth="2" />
                            <g style={{ animation: 'advFloat 3s ease-in-out .5s infinite' }}>
                                <circle cx="148" cy="108" r="10" fill="#024BFF" />
                                <path d="M143 108l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <path d="M76 80l20 30" stroke="#024BFF" strokeWidth="1" strokeDasharray="3 3" opacity=".3" style={{ animation: 'advDash 2s linear infinite' }} />
                            <path d="M164 80l-20 30" stroke="#024BFF" strokeWidth="1" strokeDasharray="3 3" opacity=".3" style={{ animation: 'advDash 2s linear .5s infinite' }} />
                        </svg>
                    </div>
                    <div className="zc-adv-body">
                        <div className="zc-adv-title">Vetted Senior Consultants</div>
                        <div className="zc-adv-desc">Access vetted, senior IT consultants across North America, Europe, Asia, and the Middle East on demand.</div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="zc-adv-card zc-reveal">
                    <div className="zc-adv-visual">
                        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g style={{ animation: 'advScale 4s ease-in-out infinite' }}>
                                <rect x="80" y="80" width="80" height="80" rx="6" fill="rgba(2,75,255,.04)" stroke="#024BFF" strokeWidth="1.5" />
                            </g>
                            <g style={{ animation: 'advFloat 3s ease-in-out infinite' }}>
                                <path d="M90 90l-30-30" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" />
                                <path d="M60 60h14m-14 0v14" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <g style={{ animation: 'advFloat 3s ease-in-out .5s infinite' }}>
                                <path d="M150 90l30-30" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" />
                                <path d="M180 60h-14m14 0v14" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <g style={{ animation: 'advFloat 3s ease-in-out 1s infinite' }}>
                                <path d="M90 150l-30 30" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" />
                                <path d="M60 180h14m-14 0v-14" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <g style={{ animation: 'advFloat 3s ease-in-out 1.5s infinite' }}>
                                <path d="M150 150l30 30" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" />
                                <path d="M180 180h-14m14 0v-14" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <circle cx="105" cy="108" r="7" stroke="#024BFF" strokeWidth="1.5" />
                            <path d="M95 125c0-6 4-10 10-10s10 4 10 10" stroke="#024BFF" strokeWidth="1.5" />
                            <circle cx="135" cy="108" r="7" stroke="#024BFF" strokeWidth="1.5" />
                            <path d="M125 125c0-6 4-10 10-10s10 4 10 10" stroke="#024BFF" strokeWidth="1.5" />
                            <circle cx="120" cy="135" r="5" stroke="#024BFF" strokeWidth="1" opacity=".5" />
                            <g opacity=".4">
                                <line x1="36" y1="120" x2="48" y2="120" stroke="#024BFF" strokeWidth="2" />
                                <line x1="42" y1="114" x2="42" y2="126" stroke="#024BFF" strokeWidth="2" />
                            </g>
                            <g opacity=".4">
                                <line x1="192" y1="120" x2="204" y2="120" stroke="#024BFF" strokeWidth="2" />
                                <line x1="198" y1="114" x2="198" y2="126" stroke="#024BFF" strokeWidth="2" />
                            </g>
                        </svg>
                    </div>
                    <div className="zc-adv-body">
                        <div className="zc-adv-title">Instant Scalability</div>
                        <div className="zc-adv-desc">Scale expertise instantly without long hiring cycles or fixed overhead.</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ZepConsultAdvantage;
