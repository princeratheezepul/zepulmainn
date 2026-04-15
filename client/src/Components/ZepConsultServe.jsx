import React, { useEffect, useRef } from 'react';
import '../styles/ZepConsult.css';

const ZepConsultServe = () => {
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
        <section className="zc-serve" ref={sectionRef}>
            <div className="zc-serve-header zc-reveal">
                <h2>Who We <span>Serve</span></h2>
                <p>We partner with enterprises across industries to deliver transformative IT consulting.</p>
            </div>
            <div className="zc-serve-grid zc-reveal">
                {/* Fintech */}
                <div className="zc-serve-item">
                    <div className="zc-serve-visual">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="2" y="6" width="20" height="12" rx="2" />
                            <path d="M6 10h4m-4 4h2" />
                            <circle cx="18" cy="10" r="1" />
                            <path d="M22 6l-4-4M2 6l4-4" />
                        </svg>
                    </div>
                    <div className="zc-serve-body">
                        <div className="zc-serve-name">Fintech</div>
                        <div className="zc-serve-sub">Payment platforms, banking, and financial services</div>
                    </div>
                </div>
                {/* HealthTech */}
                <div className="zc-serve-item">
                    <div className="zc-serve-visual">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4.8 2.3A.3.3 0 015 2h14a.3.3 0 01.2.3L18 22H6L4.8 2.3z" />
                            <path d="M9 12h6M12 9v6" />
                        </svg>
                    </div>
                    <div className="zc-serve-body">
                        <div className="zc-serve-name">HealthTech</div>
                        <div className="zc-serve-sub">Digital health, telemedicine, and medical platforms</div>
                    </div>
                </div>
                {/* E-commerce */}
                <div className="zc-serve-item">
                    <div className="zc-serve-visual">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                        </svg>
                    </div>
                    <div className="zc-serve-body">
                        <div className="zc-serve-name">E-commerce</div>
                        <div className="zc-serve-sub">Marketplaces, D2C brands, and retail technology</div>
                    </div>
                </div>
                {/* Manufacturing */}
                <div className="zc-serve-item">
                    <div className="zc-serve-visual">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 20h20M5 20V8l7-5 7 5v12" />
                            <rect x="9" y="12" width="6" height="8" />
                            <path d="M9 12h6" />
                        </svg>
                    </div>
                    <div className="zc-serve-body">
                        <div className="zc-serve-name">Manufacturing</div>
                        <div className="zc-serve-sub">Industrial automation and smart manufacturing</div>
                    </div>
                </div>
                {/* Education */}
                <div className="zc-serve-item">
                    <div className="zc-serve-visual">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                        </svg>
                    </div>
                    <div className="zc-serve-body">
                        <div className="zc-serve-name">Education</div>
                        <div className="zc-serve-sub">EdTech platforms and learning management systems</div>
                    </div>
                </div>
                {/* Logistics */}
                <div className="zc-serve-item">
                    <div className="zc-serve-visual">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="1" y="3" width="15" height="13" rx="2" />
                            <path d="M16 8h5l3 5v5h-3M16 16h-2" />
                            <circle cx="7" cy="18" r="2" />
                            <circle cx="19" cy="18" r="2" />
                        </svg>
                    </div>
                    <div className="zc-serve-body">
                        <div className="zc-serve-name">Logistics</div>
                        <div className="zc-serve-sub">Supply chain, fleet management, and warehousing</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ZepConsultServe;
