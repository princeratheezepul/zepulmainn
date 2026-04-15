import React, { useEffect, useRef } from 'react';
import '../styles/ZepConsult.css';

const ZepConsultServices = () => {
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
        <section className="zc-services" ref={sectionRef}>
            <div className="zc-services-header zc-reveal">
                <h2>Our <span>Services</span></h2>
            </div>
            <div className="zc-services-grid">
                <div className="zc-service-card zc-reveal">
                    <div className="zc-service-num">01</div>
                    <div className="zc-service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                    </div>
                    <div className="zc-service-title">Software Development</div>
                    <div className="zc-service-desc">Custom software solutions tailored to your business needs.</div>
                </div>
                <div className="zc-service-card zc-reveal">
                    <div className="zc-service-num">02</div>
                    <div className="zc-service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                        </svg>
                    </div>
                    <div className="zc-service-title">Cloud Migration</div>
                    <div className="zc-service-desc">Seamless transition to cloud infrastructure for scalability.</div>
                </div>
                <div className="zc-service-card zc-reveal">
                    <div className="zc-service-num">03</div>
                    <div className="zc-service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <div className="zc-service-title">Data Analytics</div>
                    <div className="zc-service-desc">Actionable insights derived from your data to drive decisions.</div>
                </div>
                <div className="zc-service-card zc-reveal">
                    <div className="zc-service-num">04</div>
                    <div className="zc-service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                    </div>
                    <div className="zc-service-title">AI/ML Solutions</div>
                    <div className="zc-service-desc">Leveraging artificial intelligence for process automation.</div>
                </div>
                <div className="zc-service-card zc-reveal">
                    <div className="zc-service-num">05</div>
                    <div className="zc-service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 00-3-3.87" />
                            <path d="M16 3.13a4 4 0 010 7.75" />
                        </svg>
                    </div>
                    <div className="zc-service-title">Cybersecurity</div>
                    <div className="zc-service-desc">Robust security measures to protect your digital assets.</div>
                </div>
                <div className="zc-service-card zc-reveal">
                    <div className="zc-service-num">06</div>
                    <div className="zc-service-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div className="zc-service-title">DevOps</div>
                    <div className="zc-service-desc">Streamlined development and operations for faster delivery.</div>
                </div>
            </div>
        </section>
    );
};

export default ZepConsultServices;
