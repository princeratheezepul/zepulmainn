import React, { useEffect, useRef, useState } from 'react';

/* ── visual 1 · managed hiring service ── */
const ManagedServiceVisual = () => (
    <div className="lp-pv lp-pv-service" aria-hidden="true">
        <p className="lp-pv-label">Managed Hiring Service</p>

        <div className="lp-pv-flow">
            <div className="lp-pv-node">
                <div className="lp-pv-node-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#024BFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                </div>
                <span className="lp-pv-node-name">Your Company</span>
                <span className="lp-pv-node-sub">Shares JD &amp; needs</span>
            </div>

            <div className="lp-pv-middle">
                <div className="lp-pv-tags">
                    <span className="lp-pv-tag">AI Sourcing</span>
                    <span className="lp-pv-tag">CV Screening</span>
                    <span className="lp-pv-tag">AI Interviews</span>
                    <span className="lp-pv-tag">Report Cards</span>
                </div>
                <div className="lp-pv-powered">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="5 12 19 12" />
                        <polyline points="13 6 19 12 13 18" />
                    </svg>
                    Powered by Zepul
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="5 12 19 12" />
                        <polyline points="13 6 19 12 13 18" />
                    </svg>
                </div>
            </div>

            <div className="lp-pv-node">
                <div className="lp-pv-node-icon is-green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0DA864" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                    </svg>
                </div>
                <span className="lp-pv-node-name">Decision-Ready Talent</span>
                <span className="lp-pv-node-sub">Shortlisted &amp; assessed</span>
            </div>
        </div>

        <div className="lp-pv-stats">
            <div className="lp-pv-stat"><span className="lp-pv-stat-n">50%</span><span className="lp-pv-stat-l">Faster Hiring</span></div>
            <div className="lp-pv-stat-div" />
            <div className="lp-pv-stat"><span className="lp-pv-stat-n">30%</span><span className="lp-pv-stat-l">Lower Cost</span></div>
            <div className="lp-pv-stat-div" />
            <div className="lp-pv-stat"><span className="lp-pv-stat-n">0</span><span className="lp-pv-stat-l">Manual Effort</span></div>
        </div>
    </div>
);

/* ── visual 2 · automated evaluation pipeline ── */
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ClockIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const FileIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const PIPELINE = [
    { name: 'CV Strength Analysis', state: 'done', badge: 'Score: 82%', badgeKind: 'is-score', Icon: CheckIcon, conn: 'is-done' },
    { name: 'Dynamic Coding Test', state: 'done', badge: 'Score: 91%', badgeKind: 'is-score', Icon: CheckIcon, conn: 'is-active' },
    { name: 'AI Interview', state: 'active', badge: 'In Progress', badgeKind: 'is-running', Icon: ClockIcon, conn: '' },
    { name: 'Report Card', state: 'pending', badge: 'Pending', badgeKind: 'is-waiting', Icon: FileIcon, conn: null },
];

const PipelineVisual = () => (
    <div className="lp-pv" aria-hidden="true">
        <p className="lp-pv-label">Automated Evaluation Flow</p>

        <div className="lp-pv-pipe">
            {PIPELINE.map(({ name, state, badge, badgeKind, Icon, conn }) => (
                <React.Fragment key={name}>
                    <div className={`lp-pv-step is-${state}`}>
                        <div className="lp-pv-step-icon"><Icon /></div>
                        <div className="lp-pv-step-body">
                            <span className="lp-pv-step-name">{name}</span>
                            <span className={`lp-pv-badge ${badgeKind}`}>{badge}</span>
                        </div>
                    </div>
                    {conn !== null && <div className={`lp-pv-conn ${conn}`} />}
                </React.Fragment>
            ))}
        </div>

        <div className="lp-pv-zero">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#024BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Zero human intervention
        </div>
    </div>
);

/* ── visual 3 · conversational AI career partner ── */
const ChatVisual = () => (
    <div className="lp-pv lp-pv-chat" aria-hidden="true">
        <div className="lp-pv-chat-hd">
            <div className="lp-pv-av-wrap">
                <div className="lp-pv-av">Z</div>
                <div className="lp-pv-av-dot" />
            </div>
            <div className="lp-pv-chat-id">
                <span className="lp-pv-chat-name">Zep AI</span>
                <span className="lp-pv-chat-status">Your career partner · Always on</span>
            </div>
            <div className="lp-pv-chat-pulse"><span /><span /><span /></div>
        </div>

        <div className="lp-pv-msgs">
            <div className="lp-pv-bubble is-ai">Hi! Tell me about your dream role — I&apos;ll find your best global matches.</div>
            <div className="lp-pv-bubble is-user">Senior product designer, fintech, open to relocate.</div>
            <div className="lp-pv-bubble is-ai">
                Found <strong>12 roles</strong> across 4 countries.
                <span className="lp-pv-chips">
                    <span>Razorpay · 95%</span>
                    <span>Stripe India · 91%</span>
                    <span>+10 more</span>
                </span>
            </div>
            <div className="lp-pv-typing"><span /><span /><span /></div>
        </div>

        <div className="lp-pv-chat-inp">
            <div className="lp-pv-inp-field">Ask Zep anything about your career…</div>
            <div className="lp-pv-inp-send">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </div>
        </div>
    </div>
);

const PRODUCTS = [
    {
        Visual: ManagedServiceVisual,
        audience: 'For Employers',
        name: 'Zep Recruit',
        type: 'Fullstack AI Recruitment Managed Services',
        desc: 'Let us handle the heavy lifting. Our AI-powered platform, combined with expertrecruiters, manages the entire hiring process—from JD creation, AI-driven sourcing and CV assessment to tailored coding tests and structured AI interviews. You receive decision-ready talent reports with detailed evaluations, along with real-time market insights and benchmarking analytics. The result is a faster, more efficient hiring model that consistently outperforms traditional recruitment.',
    },
    {
        Visual: PipelineVisual,
        audience: 'For Recruiters',
        name: 'Zep Pro Recruiter',
        type: 'DIY AI Recruitment Platform',
        desc: 'Our Agentic AI Hiring Execution Layer is an autonomous AI platform that sits on top of existing HR systems to execute the entire hiring lifecycle—from JD creation and intelligent sourcing to AI-powered CV reading, ranking, JD matching, dynamic coding assessments, AI interviews, and decision-ready candidate scorecards. By orchestrating AI agents, workflows, and third-party tools, it delivers a fully autonomous hiring experience with zero human intervention until the final hiring decision.',
    },
    {
        Visual: ChatVisual,
        audience: 'For Job Seekers',
        name: 'Zep Jobs',
        type: 'Agentic AI Job Portal',
        desc: 'Agentic AI powered job portal where Talent Meets Opportunity ....Job seeker’s personal AI career partner that understand their aspirations and scans millions of opportunities, prepares them for interviews, and connects them directly with decision-makers — at no cost.',
    },
];

const LandingProducts = () => {
    const gridRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = gridRef.current;
        if (!node) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="lp-eco lp-pr" aria-labelledby="lp-pr-title">
            <div className="lp-pr-inner">
                <div className="lp-pr-header">
                    <div>
                        <p className="lp-eco-kicker">Offerings</p>
                        <h2 className="lp-eco-title" id="lp-pr-title">
                            Built Around Real <span className="lp-blue">Business Needs</span>
                        </h2>
                    </div>
                    <p className="lp-eco-copy">Three intelligent solutions. One ecosystem. Built for every Stakeholder in Hiring.</p>
                </div>

                <div className="lp-pr-grid" ref={gridRef}>
                    {PRODUCTS.map(({ Visual, audience, name, type, desc }) => (
                        <article key={name} className={`lp-pr-card${visible ? ' is-visible' : ''}`}>
                            <Visual />
                            <div className="lp-pr-text">
                                <p className="lp-pr-for">{audience}</p>
                                <strong className="lp-pr-name">{name}</strong>
                                <p className="lp-pr-type">{type}</p>
                                <p className="lp-pr-desc">{desc}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingProducts;
