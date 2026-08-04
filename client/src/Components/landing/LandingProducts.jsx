import React, { useEffect, useRef, useState } from 'react';

/* ── shared icons ── */
const CheckIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ClockIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const FileIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const GlobeIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20z" />
    </svg>
);

/* ── visual 1 · hiring pipeline funnel ── */
const FUNNEL = [
    { name: 'Job Posted', value: '—', width: 100, tone: 1, valKind: 'is-muted' },
    { name: 'AI Sourced', value: '186', width: 72, tone: 2 },
    { name: 'CV Screened', value: '82', width: 45, tone: 3 },
    { name: 'Assessed', value: '38', width: 27, tone: 4 },
    { name: 'Shortlisted', value: '12', width: 13, tone: 5, valKind: 'is-key' },
];

const SCORES = [{ name: 'Coding', value: 88 }, { name: 'Interview', value: 82 }];

const HiringPipelineVisual = () => (
    <div className="lp-pv lp-pv-funnel" aria-hidden="true">
        <p className="lp-pv-label">Hiring Pipeline</p>

        <div className="lp-pv-rows">
            {FUNNEL.map(({ name, value, width, tone, valKind = '' }, i) => (
                <div className="lp-pv-row" key={name}>
                    <span className="lp-pv-row-name">{name}</span>
                    <span className="lp-pv-track">
                        <span className={`lp-pv-bar is-t${tone}`} style={{ '--w': `${width}%`, '--d': `${i * 90}ms` }} />
                    </span>
                    <span className={`lp-pv-row-val ${valKind}`}>{value}</span>
                </div>
            ))}
        </div>

        <div className="lp-pv-report">
            <div className="lp-pv-report-hd">
                <FileIcon size={14} />
                <span className="lp-pv-report-title">Candidate Report Card</span>
                <span className="lp-pv-report-badge">Ready</span>
            </div>
            {SCORES.map(({ name, value }, i) => (
                <div className="lp-pv-score" key={name}>
                    <span className="lp-pv-score-name">{name}</span>
                    <span className="lp-pv-track">
                        <span className="lp-pv-bar" style={{ '--w': `${value}%`, '--d': `${500 + i * 120}ms` }} />
                    </span>
                    <span className="lp-pv-score-val">{value}%</span>
                </div>
            ))}
        </div>
    </div>
);

/* ── visual 2 · automated evaluation pipeline ── */
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
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Zero human intervention
        </div>
    </div>
);

/* ── visual 3 · ai career matching ── */
const MATCHES = [
    { company: 'Razorpay', role: 'Senior Designer', isKey: true },
    { company: 'Stripe · India', role: 'Product Designer' },
    { company: 'Groww', role: 'Lead Designer' },
];

const CareerMatchVisual = () => (
    <div className="lp-pv lp-pv-match" aria-hidden="true">
        <p className="lp-pv-label">AI Career Matching</p>

        <div className="lp-pv-match-body">
            <div className="lp-pv-seeker">
                <span className="lp-pv-seeker-av">JS</span>
                <span className="lp-pv-seeker-name">Job Seeker</span>
                <span className="lp-pv-seeker-meta">Product Designer · 4 yrs</span>
            </div>

            <div className="lp-pv-bridge">
                <span className="lp-pv-agent"><ClockIcon size={11} />Zep AI</span>
                <svg className="lp-pv-arrow" width="38" height="12" viewBox="0 0 38 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 6h34M29 1l6 5-6 5" />
                </svg>
            </div>

            <div className="lp-pv-matches">
                {MATCHES.map(({ company, role, isKey }) => (
                    <div className={`lp-pv-match-row${isKey ? ' is-key' : ''}`} key={company}>
                        <span className="lp-pv-match-co">{company}</span>
                        <span className="lp-pv-match-role">{role}</span>
                    </div>
                ))}
            </div>
        </div>

        <p className="lp-pv-match-foot">
            <GlobeIcon />
            Matching across India, UAE, Singapore &amp; beyond
        </p>
    </div>
);

const PRODUCTS = [
    {
        Visual: HiringPipelineVisual,
        audience: 'For Employers',
        name: 'Zep Recruit',
        type: 'Fullstack AI Recruitment Managed Services',
        desc: 'We handle the heavy lifting — AI sourcing, CV assessment, and structured interviews. Decision-ready report cards with zero manual coordination.',
    },
    {
        Visual: PipelineVisual,
        audience: 'For Recruiters',
        name: 'Zep Pro Recruiter',
        type: 'DIY AI Recruitment Platform',
        desc: 'AI-driven execution layer — CV analysis, coding tests, and automated interviews. Comprehensive report cards generated with zero human intervention.',
    },
    {
        Visual: CareerMatchVisual,
        audience: 'For Job Seekers',
        name: 'Zep Jobs',
        type: 'Agentic AI Job Portal',
        desc: 'Your personal AI career partner. Understands your aspirations, matches you with global opportunities, and connects you to decision-makers — at no cost.',
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
                    <p className="lp-eco-copy">Three intelligent products. One ecosystem. Every stakeholder covered.</p>
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
