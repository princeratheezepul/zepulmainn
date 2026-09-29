import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const OPTIONS = [
    {
        tab: 'Run it yourself',
        who: 'YOU',
        whoTitle: 'Your team',
        whoText: 'operates the platform',
        num: '01 — Platform license',
        name: 'Zep Pro Recruiter',
        sub: 'Agentic AI hiring platform',
        rows: [
            ['How it works', 'License the AI hiring operating system for your team'],
            ['Who operates', 'Your team, with the AI executing every step'],
            ['Best for', 'Employers and recruitment agencies'],
            ['You get', 'Hiring that scales without scaling headcount'],
        ],
        cta: 'Explore Zep Pro Recruiter →',
        ctaTo: '/prorecruitor',
        ctaClass: 'cta p',
    },
    {
        tab: 'Let Zepul run it',
        who: 'ZEPUL',
        whoTitle: 'Zepul',
        whoText: 'operates it for you',
        num: '02 — Managed services',
        name: 'Zep Recruit',
        sub: 'AI-managed hiring services',
        rows: [
            ['How it works', 'Outsource your hiring to Zepul'],
            ['Who operates', 'Zepul, on the same AI platform'],
            ['Best for', 'Employers who want hiring done for them'],
            ['You get', 'Hires delivered — you make the final call'],
        ],
        cta: 'Talk to our team →',
        ctaTo: '/contact',
        ctaClass: 'cta o',
    },
];

const SWAP_MS = 250;    // crossfade before the panel content changes
const AUTO_MS = 5500;   // auto-advance interval, until the user picks a tab

const HomeBusiness = () => {
    const sectionRef = useRef(null);
    const pillRef = useRef(null);
    const tabRefs = useRef([]);
    const swapTimer = useRef(null);

    const [revealed, setRevealed] = useState(false);
    const [current, setCurrent] = useState(0);   // selected tab
    const [shown, setShown] = useState(0);       // panel content (lags during the crossfade)
    const [fading, setFading] = useState(false);
    const [auto, setAuto] = useState(true);

    /* ---- section reveal ---- */
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        if (!('IntersectionObserver' in window)) {
            setRevealed(true);
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                setRevealed(true);
                io.disconnect();
            });
        }, { threshold: 0.2 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    /* ---- slide the pill under the selected tab ---- */
    const placePill = useCallback(() => {
        const pill = pillRef.current;
        const btn = tabRefs.current[current];
        if (!pill || !btn) return;
        pill.style.left = `${btn.offsetLeft}px`;
        pill.style.width = `${btn.offsetWidth}px`;
    }, [current]);

    useLayoutEffect(placePill, [placePill]);

    useEffect(() => {
        window.addEventListener('resize', placePill);
        // The pill is measured from the tab's text width, so re-place it once the
        // webfont swaps in — otherwise it keeps the fallback font's measurement.
        let stale = false;
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => { if (!stale) placePill(); }).catch(() => {});
        }
        return () => {
            stale = true;
            window.removeEventListener('resize', placePill);
        };
    }, [placePill]);

    /* ---- crossfade the panel whenever the selection changes ---- */
    useEffect(() => {
        if (current === shown) return;
        setFading(true);
        clearTimeout(swapTimer.current);
        swapTimer.current = setTimeout(() => {
            setShown(current);
            setFading(false);
        }, SWAP_MS);
        return () => clearTimeout(swapTimer.current);
    }, [current, shown]);

    /* ---- auto-advance until the visitor chooses ---- */
    useEffect(() => {
        if (!auto) return;
        let reduce = false;
        try {
            reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch { /* matchMedia unavailable — keep animations */ }
        if (reduce) return;

        const id = setInterval(() => setCurrent(c => 1 - c), AUTO_MS);
        return () => clearInterval(id);
    }, [auto]);

    const pick = k => {
        setAuto(false);
        setCurrent(k);
    };

    const d = OPTIONS[shown];

    return (
        <section
            className={`section${revealed ? ' in' : ''}`}
            ref={sectionRef}
            aria-labelledby="z6-title"
        >
            <div className="head rv">
                <div>
                    <p className="eyebrow">AI hiring solutions</p>
                    <h2 id="z6-title">One AI platform. <em>Two ways to hire.</em></h2>
                </div>
                <p className="zlead">
                    Autonomous AI that executes hiring end to end — without human intervention until the
                    final decision. Run it yourself, or let Zepul run it for you.
                </p>
            </div>

            <div className="sw rv" role="tablist" aria-label="Choose how to hire with Zepul">
                <span className="pill" ref={pillRef} />
                {OPTIONS.map((o, i) => (
                    <button
                        key={o.tab}
                        type="button"
                        role="tab"
                        id={`z6-tab-${i}`}
                        aria-selected={i === current}
                        aria-controls="z6-panel"
                        ref={el => { tabRefs.current[i] = el; }}
                        onClick={() => pick(i)}
                    >
                        {o.tab}
                    </button>
                ))}
            </div>

            <div
                className={`stage rv${fading ? ' zfade' : ''}`}
                style={{ '--d': 1 }}
                id="z6-panel"
                role="tabpanel"
                aria-labelledby={`z6-tab-${current}`}
            >
                <div className="flow" aria-hidden="true">
                    <div className="node who">
                        <div className="dot swap">{d.who}</div>
                        <p className="swap"><b>{d.whoTitle}</b>{d.whoText}</p>
                    </div>
                    <div className="ar" />
                    <div className="node core">
                        <div className="dot">
                            <svg viewBox="-14 -14 28 28">
                                <path d="M0,-12 L3,-3 L12,0 L3,3 L0,12 L-3,3 L-12,0 L-3,-3Z" />
                            </svg>
                            <span>AI HIRING<br />OS</span>
                        </div>
                        <p><b>Same AI platform</b>executes every step</p>
                    </div>
                    <div className="ar" />
                    <div className="node hired">
                        <div className="dot">HIRED</div>
                        <p><b>You decide</b>the final call is yours</p>
                    </div>
                </div>

                <div className="zcard">
                    <p className="n swap">{d.num}</p>
                    <h3 className="swap">{d.name}</h3>
                    <p className="s swap">{d.sub}</p>
                    <ul className="swap">
                        {d.rows.map(([label, value]) => (
                            <li key={label}><span>{label}</span>{value}</li>
                        ))}
                    </ul>
                    <Link className={`${d.ctaClass} swap`} to={d.ctaTo}>{d.cta}</Link>
                </div>
            </div>

            <p className="note rv" style={{ '--d': 2 }}>
                A scalable AI platform at the core — <b>use it yourself, or extend it with Zepul&apos;s managed hiring services.</b>
            </p>
        </section>
    );
};

export default HomeBusiness;
