import React, { useEffect } from 'react';
import '../../styles/ZepRecruitNew.css';

const Card = ({ icon, title, badText, goodText }) => (
    <div className="zrw-bento-card span-2 reveal" style={{
        background: '#fff', border: '1px solid #E3E5EE',
        borderRadius: '16px', padding: '32px',
        position: 'relative', overflow: 'hidden', transition: 'all 0.3s'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: '#F0F5FF', color: '#024BFF',
                display: 'grid', placeItems: 'center'
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#0C0E16', fontFamily: "'Lora', serif", margin: 0 }}>{title}</h3>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                <span style={{ color: '#f43f5e', fontSize: '12px', fontWeight: 'bold' }}>✕</span>
                <div style={{ width: '2px', height: '40px', background: '#E3E5EE', margin: '4px 0' }}></div>
                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                <p style={{ fontSize: '12px', color: '#7A7E92', margin: '0 0 16px 0', lineHeight: '1.6' }}>{badText}</p>
                <div style={{ background: '#F6F7FB', padding: '12px 14px', borderRadius: '8px' }}>
                    <p style={{ fontSize: '11px', color: '#0C0E16', margin: 0, fontWeight: 500, lineHeight: '1.5' }}>{goodText}</p>
                </div>
            </div>
        </div>
    </div>
);

const ZepProWhyBusinesses = () => {
    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        const rootNode = document.getElementById('ZepProWhyBusinesses-root');
        if (rootNode) {
            rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        }
        return () => revealObserver.disconnect();
    }, []);

    return (
        <div id="ZepProWhyBusinesses-root" className="zep-recruit-page">
            <section className="zrw-why" style={{ padding: '80px 52px', background: '#fff' }}>
                <div className="zrw-why-header reveal" style={{ marginBottom: '48px' }}>
                    <h2 className="section-head" style={{ fontFamily: "'Lora', serif", fontSize: 'clamp(32px, 4vw, 48px)', color: '#0C0E16', fontWeight: 400, lineHeight: 1.15, margin: 0 }}>
                        Why Businesses<br /><span className="blue" style={{ color: '#024BFF' }}>Choose Zepul?</span>
                    </h2>
                    <p className="section-sub" style={{ fontSize: '14px', color: '#7A7E92', marginTop: '16px', maxWidth: '400px', lineHeight: 1.6 }}>
                        From outdated limitations to AI-powered solutions — here's how Zepul solves every hiring challenge.
                    </p>
                </div>

                <div className="zrw-bento" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
                    <Card
                        title="Multi-Channel Sourcing"
                        badText="Manual keyword searches & limited databases"
                        goodText="AI-powered discovery across job boards, databases "
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>}
                    />
                    <Card
                        title="AI CV Matching"
                        badText="Subjective human screening, prone to bias and delays"
                        goodText="Automated ranking with precision scoring"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
                    />
                    <Card
                        title="Decision-Ready Data"
                        badText="Scattered notes and fragmented email chains"
                        goodText="Comprehensive Report Cards (CV, Code & Interview ranks)"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>}
                    />

                    <Card
                        title="Bias-Free Interviews"
                        badText="Unstructured, inconsistent, and scheduling nightmares"
                        goodText="100% AI-driven structured interviews with clear summaries"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>}
                    />
                    <Card
                        title="Dynamic Assessments"
                        badText="Generic tests or heavy reliance on hiring managers"
                        goodText="Personalised coding & technical tests generated per role"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>}
                    />
                    <Card
                        title="Full stack AI Hiring Platform"
                        badText="Toggling between many SaaS tools for the hiring end goal"
                        goodText="One integrated Agentic AI hiring platform, right from requisition to Selection"
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
                    />

                    <Card
                        title="Recruitment Lifecycle Control"
                        badText="Too many middlemen. Too much delay. Too little control "
                        goodText="Two AI agents. Zero middlemen. Faster, smarter hiring."
                        icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>}
                    />
                </div>
            </section>
        </div>
    );
};

export default ZepProWhyBusinesses;
