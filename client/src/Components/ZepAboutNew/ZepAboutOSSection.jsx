import React, { useEffect } from 'react';

const ZepAboutOSSection = () => {
    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

        const rootNode = document.getElementById('ZepAboutOSSection-root');
        if (rootNode) {
            rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
        }
        return () => revealObserver.disconnect();
    }, []);

    return (
        <div id="ZepAboutOSSection-root" className="zep-about-page">
            <section className="os-section reveal">
                <h2 className="os-section-title">The operating system for<br />modern talent acquisition.</h2>
                <div className="os-section-content">
                    <h3 className="os-content-head">Reimagining How Talent Acquisition Works</h3>
                    <p>We built Zepul around a simple belief: hiring should be intelligent, connected and autonomous.</p>
                    <p>Recruitment today is still fragmented across sourcing platforms, databases, assessments, interview tools, ATS systems and spreadsheets. Recruiters spend significant time coordinating these systems and moving candidates through processes that should be able to run themselves.</p>
                    <p className="os-content-emph">Zepul changes that.</p>
                    <p>Zepul is an agentic AI-powered Talent Acquisition Operating System designed to execute the hiring workflow end to end.</p>
                    <p>Our AI agents don't simply assist recruiters or recommend the next step. They understand the requirement, plan the workflow and autonomously execute it — from talent discovery and engagement through screening, assessments, interviews and evaluation — without human intervention.</p>
                    <p>At the centre of Zepul are two autonomous AI agents: Zeus and Thea.</p>
                    <p>Zeus works with employers and recruitment teams, autonomously executing the hiring workflow from a defined requirement to a decision-ready shortlist.</p>
                    <p>Thea works with talent as an AI career partner, understanding aspirations, discovering relevant opportunities, preparing candidates and helping them apply.</p>
                    <p>Together, they create a connected talent ecosystem where autonomous AI agents can engage, evaluate and move the hiring process forward at scale.</p>
                    <p>Human expertise remains where it matters most: the final hiring decision.</p>
                    <p>Zepul takes care of the execution. Recruiters and hiring leaders retain the judgment, context and accountability that define great hiring.</p>
                    <p>This is not another point solution added to the recruitment stack.</p>
                    <p>It is an intelligent operating system built to make the entire hiring workflow autonomous.</p>
                    <p className="os-content-emph">AI that executes. People who decide.</p>
                </div>
            </section>
        </div>
    );
};

export default ZepAboutOSSection;
