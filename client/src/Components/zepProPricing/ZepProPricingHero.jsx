import React from 'react';
import useInView from './useInView';

const ZepProPricingHero = () => {
    const [ref, inView] = useInView();

    return (
        <section className={`zppr-hero zppr-rv${inView ? ' in' : ''}`} ref={ref}>
            <p className="zppr-eyebrow">Zep Pro Recruiter · Pricing</p>
            <h1>Two questions. <em>Your pipeline.</em></h1>
            <p className="zppr-sub">
                Tell us what you want the AI to handle — we’ll highlight the plan that fits.
                Every plan runs on the same agentic AI hiring platform.
            </p>
        </section>
    );
};

export default ZepProPricingHero;
