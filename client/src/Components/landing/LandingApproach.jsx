import React, { useEffect, useRef, useState } from 'react';

const CHIPS = [
    'AI Native Managed Services',
    'DIY Agentic AI Platform',
    'AI Agent Engaged Talent',
    'Global On-Demand Recruiters',
];

const LABELS = [
    {
        key: 'emp',
        title: 'Employers',
        subs: ['AI Native Managed Services for Hiring', 'DIY Agentic AI Execution Layer Platform License'],
    },
    {
        key: 'seek',
        title: 'Job Seekers',
        subs: ['AI Agent Engaged Active Talent', 'Niche Global Talent'],
    },
    {
        key: 'rec',
        title: 'Recruiters',
        subs: ['In House · On Demand', '100% AI Powered + Global'],
    },
];

const LandingApproach = () => {
    const stageRef = useRef(null);
    const [merged, setMerged] = useState(false);
    // `animatable` is applied one frame before `merged` so the circles transition
    // in from their off-stage start positions instead of snapping into place.
    const [animatable, setAnimatable] = useState(false);

    useEffect(() => {
        const node = stageRef.current;
        if (!node) return;
        let raf1 = 0;
        let raf2 = 0;
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting) return;
            observer.disconnect();
            setAnimatable(true);
            raf1 = requestAnimationFrame(() => {
                raf2 = requestAnimationFrame(() => setMerged(true));
            });
        }, { threshold: 0.3 });
        observer.observe(node);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, []);

    return (
        <section className="lp-eco lp-vn" aria-labelledby="lp-vn-title">
            <div className="lp-vn-wrap">
                <div className="lp-vn-copy">
                    <p className="lp-eco-kicker">Our Approach</p>
                    <h2 className="lp-eco-title" id="lp-vn-title">
                        Full-Stack AI Operating<br />System for <span className="lp-blue">Hiring</span>
                    </h2>
                    <p className="lp-eco-copy">
                        This is an AI workforce that runs the entire hiring operation — from sourcing to hiring decisions.
                    </p>
                    <div className="lp-vn-chips">
                        {CHIPS.map(chip => <span className="lp-vn-chip" key={chip}>{chip}</span>)}
                    </div>
                </div>

                <div className="lp-vn-visual">
                    <div
                        className="lp-vn-stage"
                        ref={stageRef}
                        role="img"
                        aria-label="Employers, job seekers and recruiters merging into the Zepul agentic AI engine"
                    >
                        <div className={`lp-vn-circles${merged ? ' is-merged' : ''}`}>
                            <div className={`lp-vc lp-vc-emp${animatable ? ' is-animatable' : ''}`} />
                            <div className={`lp-vc lp-vc-seek${animatable ? ' is-animatable' : ''}`} />
                            <div className={`lp-vc lp-vc-rec${animatable ? ' is-animatable' : ''}`} />

                            <div className="lp-vn-core">
                                <span className="lp-vn-core-title">ZEPUL</span>
                                <span className="lp-vn-core-sub">AGENTIC AI<br />ENGINE</span>
                            </div>
                        </div>
                    </div>

                    <div className="lp-vn-labels">
                        {LABELS.map(({ key, title, subs }) => (
                            <div className={`lp-vl lp-vl-${key}`} key={key}>
                                <span className="lp-vl-title">{title}</span>
                                {subs.map(sub => <span className="lp-vl-sub" key={sub}>{sub}</span>)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingApproach;
