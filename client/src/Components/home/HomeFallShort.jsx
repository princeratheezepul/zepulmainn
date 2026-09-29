import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Each gap in today's hiring stack, paired with the notification that
 * illustrates it. The legend caption and the note's red footnote are the same
 * two strings, so they can never drift apart.
 */
const GAPS = [
    {
        n: '01',
        title: 'Automation ≠ Intelligence',
        desc: "It reminds. It doesn't act.",
        avatar: 'A',
        source: 'Automation tool',
        message: 'Reminder: 12 candidates are waiting for you to follow up.',
    },
    {
        n: '02',
        title: 'Disconnected ecosystems',
        desc: 'Tools in silos.',
        avatar: 'S',
        source: 'Sourcing tool',
        message: 'Export complete. Import this CSV into your assessment tool.',
    },
    {
        n: '03',
        title: 'Point tools',
        desc: 'One step, not the journey.',
        avatar: 'S',
        source: 'Screening tool',
        message: 'Screening done ✓ Next: schedule interviews manually.',
    },
    {
        n: '04',
        title: 'Job portals',
        desc: 'A talent dump, not hires.',
        avatar: 'J',
        source: 'Job portal',
        message: 'Hundreds of new applicants. Most are passive.',
    },
    {
        n: '05',
        title: 'Recruitment agencies',
        desc: 'Costly and hard to scale.',
        avatar: 'A',
        source: 'Agency',
        message: 'New invoice received. 2 roles still open.',
    },
    {
        n: '06',
        title: 'No talent intelligence',
        desc: 'Skills and demand never connect.',
        avatar: 'S',
        source: 'Skills report',
        message: "This skill wasn't in your JD last year. Update the role?",
    },
];

const NOTE_INTERVAL = 1400;   // gap between notifications
const HOLD_FULL = 3200;       // pause once the inbox is full
const RESTART_GAP = 900;      // pause before the loop starts over

const prefersReducedMotion = () => {
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
        return false;
    }
};

const HomeFallShort = () => {
    const sectionRef = useRef(null);
    const notesRef = useRef(null);
    const missRef = useRef(null);
    const noteEls = useRef([]);

    const [revealed, setRevealed] = useState(false);
    // How many notifications are on screen, and which legend row is highlighted.
    const [shown, setShown] = useState(0);
    const [active, setActive] = useState(-1);
    // 0 = idle, 1 = question, 2 = answer, 3 = answer + CTA. Stages are cumulative.
    const [missStage, setMissStage] = useState(0);

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
        }, { threshold: 0.15 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    /* ---- notification inbox loop ---- */
    useEffect(() => {
        const el = notesRef.current;
        if (!el) return;

        if (prefersReducedMotion()) {
            setShown(GAPS.length);
            return;
        }

        let timer;
        let i = 0;
        const step = () => {
            if (i < GAPS.length) {
                setShown(i + 1);
                setActive(i);
                i += 1;
                timer = setTimeout(step, NOTE_INTERVAL);
            } else {
                timer = setTimeout(() => {
                    setShown(0);
                    setActive(-1);
                    i = 0;
                    timer = setTimeout(step, RESTART_GAP);
                }, HOLD_FULL);
            }
        };

        let io;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    io.disconnect();
                    timer = setTimeout(step, 500);
                });
            }, { threshold: 0.3 });
            io.observe(el);
        } else {
            timer = setTimeout(step, 500);
        }

        return () => {
            if (io) io.disconnect();
            clearTimeout(timer);
        };
    }, []);

    /* ---- "What's missing?" staged reveal ---- */
    const playMiss = useCallback(() => {
        setMissStage(0);
        // Keep in step with the .zs3 .q / .a1 / .a2 / .lnk transitions in
        // HomeLanding.css — together they settle at ~2.2s.
        const timers = [
            setTimeout(() => setMissStage(1), 100),
            setTimeout(() => setMissStage(2), 1000),
            setTimeout(() => setMissStage(3), 1700),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        const el = missRef.current;
        if (!el) return;

        if (prefersReducedMotion()) {
            setMissStage(3);
            return;
        }

        let cancel;
        if (!('IntersectionObserver' in window)) {
            cancel = playMiss();
            return () => cancel && cancel();
        }

        let played = false;
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !played) {
                    played = true;
                    if (cancel) cancel();
                    cancel = playMiss();
                }
                // Scrolled back above the section: arm it to replay on return.
                if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
                    played = false;
                    if (cancel) cancel();
                    setMissStage(0);
                }
            });
        }, { threshold: 0.6 });

        io.observe(el);
        return () => {
            io.disconnect();
            if (cancel) cancel();
        };
    }, [playMiss]);

    const pulseNote = index => {
        const el = noteEls.current[index];
        if (!el || typeof el.animate !== 'function') return;
        el.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
            { duration: 400 },
        );
    };

    const goToSolution = e => {
        e.preventDefault();
        const target = document.getElementById('solution');
        if (!target) return;
        target.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
        });
    };

    const missClass = ['miss', missStage >= 1 && 's1', missStage >= 2 && 's2', missStage >= 3 && 's3']
        .filter(Boolean)
        .join(' ');

    return (
        <section className={`section${revealed ? ' in' : ''}`} ref={sectionRef} aria-labelledby="z3-title">
            <div className="wrap">
                <div className="rv">
                    <p className="eyebrow">The missing pieces in hiring</p>
                    <h2 id="z3-title">Why existing solutions <em>fall short</em></h2>
                    <p className="zlead">
                        A day in today&apos;s hiring stack: every tool sends a notification. None of them does the work.
                    </p>
                    <ol className="legend">
                        {GAPS.map((g, i) => (
                            <li
                                key={g.n}
                                className={i === active ? 'on' : undefined}
                                onMouseEnter={() => pulseNote(i)}
                            >
                                <b>{g.n}</b>
                                <span><strong>{g.title}</strong>{g.desc}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="phone rv" style={{ '--d': 2 }} aria-label="Example notifications from today's hiring tools">
                    <div className="bar"><span>9:41</span><span>Recruiter inbox</span></div>
                    <div className="notes" ref={notesRef}>
                        {GAPS.map((g, i) => (
                            <div
                                className={`note${i < shown ? ' zshow' : ''}`}
                                key={g.n}
                                ref={el => { noteEls.current[i] = el; }}
                            >
                                <span className="av" aria-hidden="true">{g.avatar}</span>
                                <div>
                                    <p className="src">{g.source}</p>
                                    <p className="msg">{g.message}</p>
                                </div>
                                <span className="t">now</span>
                                <span className="x">{g.title} · {g.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={missClass} ref={missRef} aria-live="polite">
                <div className="stage">
                    <p className="q"><span className="dot" aria-hidden="true" />What&apos;s missing?</p>
                    <p className="a1">An intelligent system that owns outcomes, <span>not tasks.</span></p>
                </div>
                <p className="a2">The future is an <b>AI-native operating system for hiring.</b></p>
                <a className="lnk" href="#solution" onClick={goToSolution}>See how Zepul works →</a>
            </div>
        </section>
    );
};

export default HomeFallShort;
