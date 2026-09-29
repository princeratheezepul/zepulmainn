import React, { useEffect, useRef, useState } from 'react';
import WorkflowDiagram from './WorkflowDiagram';

/** Let the boxes finish fading in before the signal starts its first lap. */
const SIGNAL_DELAY_MS = 700;

const HomeSolution = () => {
    const sectionRef = useRef(null);
    const [revealed, setRevealed] = useState(false);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        let timer;
        const start = () => {
            setRevealed(true);
            timer = setTimeout(() => setRunning(true), SIGNAL_DELAY_MS);
        };

        if (!('IntersectionObserver' in window)) {
            start();
            return () => clearTimeout(timer);
        }

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                start();
                io.disconnect();
            });
        }, { threshold: 0.2 });

        io.observe(el);
        return () => {
            io.disconnect();
            clearTimeout(timer);
        };
    }, []);

    return (
        <section
            className={`section${revealed ? ' in' : ''}`}
            id="solution"
            ref={sectionRef}
            aria-labelledby="z4-title"
        >
            <div className="head">
                <div>
                    <p className="eyebrow">The solution</p>
                    <h2 id="z4-title">An intelligent hiring operating system</h2>
                </div>
                <div>
                    <p className="tag">AI that thinks, acts, and executes — autonomously.</p>
                    <p className="zlead">
                        <b>Meet Zepul™</b> — an AI-powered talent acquisition operating system that connects
                        employers, job seekers and recruitment partners through a unified agentic AI ecosystem.
                    </p>
                </div>
            </div>

            <WorkflowDiagram running={running} />

            <div className="foot">
                <h3><em>Zeus</em> hires. <em>Thea</em> guides.</h3>
                <p>
                    <b className="ag">Zeus</b> autonomously executes the employer-side hiring workflow — from job
                    creation, sourcing and intelligent matching to screening, assessments, AI interviews and
                    decision-ready scorecards. <b className="ag">Thea</b> guides candidates — from discovering the
                    right opportunities and applying to personalised interview preparation and career support.
                    Together, they automate the hiring journey end to end, with humans stepping in only where
                    judgement matters.
                    <span className="patent">Patent application no. 202641095852</span>
                </p>
            </div>
        </section>
    );
};

export default HomeSolution;
