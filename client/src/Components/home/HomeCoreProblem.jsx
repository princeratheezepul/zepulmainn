import React, { useEffect, useRef } from 'react';

const POINTS = [
    {
        num: '01',
        stage: 'Job creation',
        title: 'Recruitment is too manual',
        body: 'Repetitive human effort at every stage, from job creation to interviews.',
    },
    {
        num: '02',
        stage: 'Sourcing',
        title: 'Hiring is fragmented',
        body: 'Disconnected tools create broken workflows and scattered candidate data.',
    },
    {
        num: '03',
        stage: 'Screening',
        title: 'Skills are evolving',
        body: 'Skill requirements shift faster than employers or candidates can keep up.',
    },
    {
        num: '04',
        stage: 'Interview',
        title: 'Candidate journey is underserved',
        body: 'No personalised support across discovery, applications and interview prep.',
    },
    {
        num: '05',
        stage: 'Hiring',
        title: 'Matching is inefficient',
        body: "Employers can't find the right talent fast; candidates can't find the right roles.",
    },
];

/** ms the staged draw-in takes before the looping "signal" animation starts.
 *  Must match the last delay in the `.zs2 .in ...` block of HomeLanding.css. */
const DRAW_IN_MS = 2350;

/**
 * Adds `in` (then `live`) to `el` once it scrolls into view. The wide and
 * narrow layouts each get their own observer: only one of them is displayed at
 * a time, and a `display: none` element never intersects, so watching just one
 * would leave the other permanently un-animated.
 */
function useDrawIn(ref) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let liveTimer;
        const start = () => {
            el.classList.add('in');
            liveTimer = setTimeout(() => el.classList.add('live'), DRAW_IN_MS);
        };

        if (!('IntersectionObserver' in window)) {
            start();
            return () => clearTimeout(liveTimer);
        }

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                start();
                io.disconnect();
            });
        }, { threshold: 0.1 });

        io.observe(el);
        return () => {
            io.disconnect();
            clearTimeout(liveTimer);
        };
    }, [ref]);
}

const HomeCoreProblem = () => {
    const timelineRef = useRef(null);
    const mobileRef = useRef(null);

    useDrawIn(timelineRef);
    useDrawIn(mobileRef);

    return (
        <section className="section" aria-labelledby="z2-coreTitle">
            <div className="head">
                <h2 id="z2-coreTitle">
                    Why recruitment needs reinvention?
                    <span className="sub">The core problem</span>
                </h2>
                <p className="quote">
                    Hiring hasn&apos;t evolved in decades, while talent markets have become global, digital, and AI-native.
                    <span>Recruitment has software. It still lacks intelligent execution.</span>
                </p>
            </div>

            {/* ---- wide screens: horizontal timeline (scroll-snapped when it overflows) ---- */}
            <p className="hint">Swipe to follow the hiring journey <i>→</i></p>
            <div className="swipe">
                <div className="timeline" ref={timelineRef}>
                    {POINTS.map((p, i) => (
                        <div className="point" tabIndex={0} style={{ '--i': i }} key={p.num}>
                            <p className="num" data-stage={p.stage}>{p.num}</p>
                            <h3>{p.title}</h3>
                            <p>{p.body}</p>
                        </div>
                    ))}

                    <div className="track" aria-hidden="true">
                        <span className="solid" />
                        <span className="dots" />
                        {POINTS.map((p, i) => (
                            <span className="tick" style={{ '--i': i, left: `${i * 20}%` }} key={p.num} />
                        ))}
                        <span className="signal" />
                    </div>

                    {POINTS.map((p, i) => (
                        <div className="stage" style={{ '--i': i, gridColumn: i + 1 }} key={p.num}>
                            {p.stage}
                        </div>
                    ))}

                    <div className="gap" role="img" aria-label="A gap separates employers from talent">
                        <div className="node emp"><span className="dot" />EMPLOYER</div>
                        <div className="drop">
                            <span className="break b1" />
                            <span className="break b2" />
                            <span className="label">THE GAP</span>
                            <span className="faller" />
                        </div>
                        <div className="node tal"><span className="dot" />TALENT</div>
                    </div>
                </div>
            </div>

            {/* ---- narrow screens: the same journey as a vertical rail ---- */}
            <div className="mtl" ref={mobileRef}>
                <div className="mrail" aria-hidden="true">
                    <span className="solid" />
                    <span className="dots" />
                    <span className="msig" />
                </div>
                {POINTS.map((p, i) => (
                    <div className="mi" style={{ '--i': i }} key={p.num}>
                        <span className="tk" />
                        <p className="mn">{p.num}<span>{p.stage}</span></p>
                        <h3>{p.title}</h3>
                        <p className="md">{p.body}</p>
                    </div>
                ))}
                <div className="mgap" role="img" aria-label="A gap separates employers from talent">
                    <div className="mnode"><span className="d emp" />EMPLOYER</div>
                    <div className="mdrop">
                        <span className="line" />
                        <span className="brk b1" />
                        <span className="brk b2" />
                        <span className="lab">THE GAP</span>
                        <span className="fall" />
                    </div>
                    <div className="mnode"><span className="d tal" />TALENT</div>
                </div>
            </div>
        </section>
    );
};

export default HomeCoreProblem;
