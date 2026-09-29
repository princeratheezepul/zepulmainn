import React, { useEffect, useRef, useState } from 'react';

const SparkleIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M10 2l1.8 5.2L17 9l-5.2 1.8L10 16l-1.8-5.2L3 9l5.2-1.8zM18 13l.9 2.1L21 16l-2.1.9L18 19l-.9-2.1L15 16l2.1-.9z" />
    </svg>
);

/**
 * The conversation, ordered by `i`. `side` drives which typing indicator runs
 * before an agent reply: L = Zeus panel, R = Thea panel, C = the agent-to-agent
 * exchange in the middle (which posts instantly, with no typing indicator).
 */
const ZEUS_MSGS = [
    { i: 0, kind: 'me', text: 'I need a senior backend engineer in London.' },
    { i: 1, kind: 'ai', text: "Got it. I've drafted the JD and started sourcing across Zep DB, job boards and partner pools." },
    { i: 7, kind: 'ai', text: 'Candidates confirmed, assessed and interviewed. Your decision-ready scorecard is here.' },
];

const THEA_MSGS = [
    { i: 2, kind: 'me', text: "I'm a backend developer looking for roles abroad." },
    { i: 3, kind: 'ai', text: 'Here are global roles that match your skills. Want to prep for one?' },
    { i: 6, kind: 'ai', text: "You've been matched to a role in London. Let's run a mock interview for this JD." },
];

const MID_MSGS = [
    { i: 4, kind: 'z', from: 'ZEUS → THEA', text: 'Looking for backend talent in London.' },
    { i: 5, kind: 't', from: 'THEA → ZEUS', text: 'I have an interview-ready candidate. Sharing the profile.' },
];

const SIDES = { L: ZEUS_MSGS, R: THEA_MSGS, C: MID_MSGS };

/** Flat playback order: [{ i, side, isAi }] sorted by i. */
const SCRIPT = Object.entries(SIDES)
    .flatMap(([side, msgs]) => msgs.map(m => ({ i: m.i, side, isAi: m.kind === 'ai' })))
    .sort((a, b) => a.i - b.i);

const BEAT_MS = 900;      // pause between messages, and typing-indicator duration
const LOOP_PAUSE_MS = 4000;
const RESTART_MS = 600;

const SHIFTS = [
    { d: 'Execution', old: 'AI assists', now: 'AI executes' },
    { d: 'Architecture', old: 'Multiple tools', now: 'One operating layer' },
    { d: 'Who leads', old: 'Recruiter-led', now: 'AI-led' },
    { d: 'Scaling', old: 'Some automation', now: 'Autonomous scaling' },
    { d: 'Candidate side', old: 'Candidate tools still separate', now: 'One connected ecosystem' },
];

const HomeAgents = () => {
    const stageRef = useRef(null);
    const shiftsRef = useRef(null);

    const [shown, setShown] = useState(() => new Set());
    const [typingSide, setTypingSide] = useState(null);
    const [shiftsIn, setShiftsIn] = useState(false);

    /* ---- conversation playback ---- */
    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        let reduce = false;
        try {
            reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch { /* matchMedia unavailable — keep animations */ }
        if (reduce) {
            setShown(new Set(SCRIPT.map(m => m.i)));
            return;
        }

        let timer;
        let idx = 0;

        const step = () => {
            if (idx >= SCRIPT.length) {
                timer = setTimeout(() => {
                    setShown(new Set());
                    idx = 0;
                    timer = setTimeout(step, RESTART_MS);
                }, LOOP_PAUSE_MS);
                return;
            }

            const msg = SCRIPT[idx];
            const post = () => {
                setShown(prev => new Set(prev).add(msg.i));
                idx += 1;
                timer = setTimeout(step, BEAT_MS);
            };

            if (msg.isAi) {
                // Agents "think" first; the agent-to-agent handoff posts instantly.
                setTypingSide(msg.side);
                timer = setTimeout(() => {
                    setTypingSide(null);
                    post();
                }, BEAT_MS);
            } else {
                post();
            }
        };

        let io;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    io.disconnect();
                    timer = setTimeout(step, 400);
                });
            }, { threshold: 0.3 });
            io.observe(stage);
        } else {
            timer = setTimeout(step, 400);
        }

        return () => {
            if (io) io.disconnect();
            clearTimeout(timer);
        };
    }, []);

    /* ---- "what makes Zepul different" reveal ---- */
    useEffect(() => {
        const el = shiftsRef.current;
        if (!el) return;
        if (!('IntersectionObserver' in window)) {
            setShiftsIn(true);
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                setShiftsIn(true);
                io.disconnect();
            });
        }, { threshold: 0.25 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const cls = i => `m ${i}`;
    const vis = i => (shown.has(i) ? ' zshow' : '');

    const renderChat = (variant, name, role, audience, msgs, side) => (
        <div className={`chat ${variant}`}>
            <div className="ch">
                <span className="av"><SparkleIcon /></span>
                <div><b>{name}</b><small>{role}</small></div>
                <span className="aud">{audience}</span>
            </div>
            <div className="msgs">
                {msgs.map(m => (
                    <div className={`${cls(m.kind)}${vis(m.i)}`} key={m.i}>{m.text}</div>
                ))}
                <span className={`typing${typingSide === side ? ' zshow' : ''}`}>
                    <i /><i /><i />
                </span>
            </div>
        </div>
    );

    return (
        <section className="section" aria-labelledby="z5-title">
            <div className="head">
                <div>
                    <p className="eyebrow">Where talent and hiring intelligence connect</p>
                    <h2 id="z5-title">Two agents. <em>One talent ecosystem.</em></h2>
                </div>
                <p className="zlead">
                    Employers talk to Zeus. Job seekers talk to Thea. And Zeus and Thea talk to each other —
                    so the right talent meets the right role.
                </p>
            </div>

            <div className="stage" ref={stageRef}>
                {renderChat('z', 'Zeus', 'AI Hiring Agent', 'Employers', ZEUS_MSGS, 'L')}

                <div className="mid">
                    <span className="lbl">they talk</span>
                    {MID_MSGS.map(m => (
                        <div className={`${cls(m.kind)}${vis(m.i)}`} key={m.i}>
                            <b>{m.from}</b>{m.text}
                        </div>
                    ))}
                </div>

                {renderChat('t', 'Thea', 'AI Career Partner', 'Job seekers', THEA_MSGS, 'R')}
            </div>

            <p className="quote">
                Thea helps talent become opportunity-ready. Zeus helps employers become talent-ready.
            </p>

            <div ref={shiftsRef} className={shiftsIn ? 'in' : undefined}>
                <div className="sub">
                    <h3>What makes Zepul different</h3>
                    <p>Where the market is <b>→ where Zepul is</b></p>
                </div>
                <div className="shifts">
                    {SHIFTS.map((s, i) => (
                        <div className="sh" style={{ '--d': i }} key={s.d}>
                            <p className="d">{s.d}</p>
                            <p className="o">{s.old}</p>
                            <p className="n">{s.now}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HomeAgents;
