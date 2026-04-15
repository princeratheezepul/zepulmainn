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
                    <p>When we built Zepul™, we didn't think of it as just another recruiting tool. We saw it as an operating system for modern talent acquisition.</p>
                    <p>The idea was simple why should hiring be spread across so many disconnected tools and processes? So we built a full-stack AI platform that handles everything end-to-end: sourcing, evaluation, hiring, and even onboarding all in one place.</p>
                    <p>What happens inside is where it gets powerful. Our AI agents understand the requisition , goes out and discovers talent across multiple channels, analyzes and matches profiles instantly, runs intelligent interviews, and then gives you structured, decision-ready insights. Every step is connected, so you're not guessing you're seeing what's working in real time through market intelligence and performance dashboards.</p>
                    <p>And we also know every company works differently. Some teams want to use the platform themselves, while others prefer to outsource hiring completely. We support both. But either way, the outcome we focus on is the same— consistently high-quality hires.</p>
                    <p>At the end of the day, this is how we think hiring should work: driven by insight, and built for real impact.</p>
                </div>
            </section>
        </div>
    );
};

export default ZepAboutOSSection;
