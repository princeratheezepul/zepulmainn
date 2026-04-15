import React from 'react';

const LandingHowItWorks = () => {
    return (
        <section className="lp-system-canvas lp-reveal">
            <h2 className="lp-section-head">How <span className="lp-blue">Zepul</span> Works</h2>
            <p className="lp-section-sub">A system-level view of our AI-powered recruitment pipeline.</p>

            <div className="lp-sc-scroll-wrapper" style={{ overflow: 'hidden', width: '100vw', maxWidth: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
                <img
                    src="/zepul%20works.png"
                    alt="How Zepul Works Flow Diagram"
                    className="lp-reveal"
                    style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '1200px', // constrain on very wide screens 
                        margin: '0 auto',
                        objectFit: 'contain'
                    }}
                />
            </div>
        </section>
    );
};

export default LandingHowItWorks;
