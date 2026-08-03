import React, { useEffect, useRef, useState } from 'react';

const AgencyIcon = () => (
    <svg className="lp-fs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SaasIcon = () => (
    <svg className="lp-fs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <polyline points="8 21 12 17 16 21" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="12" x2="13" y2="12" />
    </svg>
);

const PortalIcon = () => (
    <svg className="lp-fs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);

const CARDS = [
    {
        num: '01',
        Icon: AgencyIcon,
        title: ['Recruitment', 'Agencies'],
        limitation: 'Expensive, tech-limitation & low talent reach',
        tags: ['Expensive', 'Unscalable', 'Limited Data'],
    },
    {
        num: '02',
        Icon: SaasIcon,
        title: ['SaaS', 'Tools'],
        limitation: 'Fragmented point solutions with limited ability.',
        tags: ['Fragmented', 'Point Solutions', 'No Outcomes'],
    },
    {
        num: '03',
        Icon: PortalIcon,
        title: ['Job', 'Portals'],
        limitation: 'Passive talent dumps — not actual hires',
        tags: ['Low Relevance', 'Not Vetted', 'No intelligence'],
    },
];

const LandingFallShort = () => {
    const gridRef = useRef(null);
    const stripRef = useRef(null);
    const [cardsIn, setCardsIn] = useState(false);
    const [strip, setStrip] = useState({ lit: false, arrow: false, revealed: false });

    // Staggered card entrance
    useEffect(() => {
        const node = gridRef.current;
        if (!node) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setCardsIn(true);
                observer.disconnect();
            }
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    // Sequenced "What's missing → The Future" reveal
    useEffect(() => {
        const node = stripRef.current;
        if (!node) return;
        const timers = [];
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            timers.push(setTimeout(() => setStrip(s => ({ ...s, lit: true })), 200));
            timers.push(setTimeout(() => setStrip(s => ({ ...s, arrow: true })), 700));
            timers.push(setTimeout(() => setStrip(s => ({ ...s, revealed: true })), 1100));
        }, { threshold: 0.45 });
        observer.observe(node);
        return () => {
            observer.disconnect();
            timers.forEach(clearTimeout);
        };
    }, []);

    return (
        <section className="lp-eco lp-fs" aria-labelledby="lp-fs-title">
            <div className="lp-fs-header">
                <p className="lp-eco-kicker is-centered">The Problem</p>
                <h2 className="lp-eco-title" id="lp-fs-title">
                    Why existing solutions <span className="lp-blue">fall short</span>
                </h2>
                <p className="lp-fs-sub">None of them own the outcome.</p>
            </div>

            <div className="lp-fs-grid" ref={gridRef}>
                {CARDS.map(({ num, Icon, title, limitation, tags }) => (
                    <article
                        key={num}
                        className={`lp-fs-card${cardsIn ? ' is-visible' : ''}`}
                        aria-label={`${title.join(' ')} limitation`}
                    >
                        <div className="lp-fs-card-visual">
                            <Icon />
                            <div className="lp-fs-num" aria-hidden="true">{num}</div>
                        </div>
                        <div className="lp-fs-card-body">
                            <p className="lp-fs-eyebrow">Existing Approach</p>
                            <h3 className="lp-fs-card-title">{title[0]}<br />{title[1]}</h3>
                            <div className="lp-fs-rule" aria-hidden="true" />
                            <p className="lp-fs-limit-label">Limitation</p>
                            <p className="lp-fs-limit-text">{limitation}</p>
                            <div className="lp-fs-tags">
                                {tags.map(tag => <span key={tag}>{tag}</span>)}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="lp-fs-bottom" ref={stripRef}>
                <div className="lp-fs-missing">
                    <p className="lp-fs-strip-eyebrow">What&apos;s Missing?</p>
                    <p className={`lp-fs-missing-q${strip.lit ? ' is-lit' : ''}`}>
                        An intelligent system that owns outcomes, not tasks.
                    </p>
                </div>

                <div className={`lp-fs-arrow${strip.arrow ? ' is-in' : ''}`} aria-hidden="true">
                    <svg width="48" height="24" viewBox="0 0 48 24">
                        <path d="M0 12 H40 M32 4 L40 12 L32 20" stroke="#024BFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className={`lp-fs-future${strip.revealed ? ' is-revealed' : ''}`}>
                    <p className="lp-fs-strip-eyebrow">The Future</p>
                    <p className="lp-fs-future-headline">An AI Native Operating System for Hiring.</p>
                </div>
            </div>
        </section>
    );
};

export default LandingFallShort;
