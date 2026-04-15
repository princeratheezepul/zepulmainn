import React, { useEffect, useRef } from 'react';
import '../styles/ZepConsult.css';

const ZepConsultStats = () => {
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
        <section className="zc-why" ref={sectionRef}>
            <div className="zc-why-split zc-reveal">
                <div className="zc-why-left">
                    <div className="zc-why-accent"></div>
                    <h2>Why <span>Zep Consult</span></h2>
                    <p>Technology Companies • Fintech • HealthTech Enterprise IT. From fast-growing startups to large organizations modernizing legacy systems.</p>
                </div>
                <div className="zc-why-grid">
                    <div className="zc-why-card">
                        <div className="zc-why-card-num">100<span>+</span></div>
                        <div className="zc-why-card-label">Delivery-ready engineers</div>
                    </div>
                    <div className="zc-why-card">
                        <div className="zc-why-card-num">&lt;15</div>
                        <div className="zc-why-card-label">Days to billable onboarding</div>
                    </div>
                    <div className="zc-why-card">
                        <div className="zc-why-card-num">100<span>%</span></div>
                        <div className="zc-why-card-label">Assessed consultants</div>
                    </div>
                    <div className="zc-why-card">
                        <div className="zc-why-card-num">100<span>%</span></div>
                        <div className="zc-why-card-label">Pre-vetted talent data</div>
                    </div>
                    <div className="zc-why-card">
                        <div className="zc-why-card-num">1-50<span>+</span></div>
                        <div className="zc-why-card-label">Consultants scalable per project</div>
                    </div>
                    <div className="zc-why-card">
                        <div className="zc-why-card-num">&lt;5<span>%</span></div>
                        <div className="zc-why-card-label">Unplanned attrition</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ZepConsultStats;
