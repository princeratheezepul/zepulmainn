import React, { useEffect, useRef, useState } from 'react';
import LandingNav from '../Components/landing/LandingNav';
import ZepProPricingHero from '../Components/zepProPricing/ZepProPricingHero';
import ZepProPlanFinder from '../Components/zepProPricing/ZepProPlanFinder';
import ZepProPlanMatrix from '../Components/zepProPricing/ZepProPlanMatrix';
import ZepProIncluded from '../Components/zepProPricing/ZepProIncluded';
import ZepProPricingCTA from '../Components/zepProPricing/ZepProPricingCTA';
import { recommendedPlan } from '../Components/zepProPricing/pricingData';
import '../styles/LandingPage.css';
import '../styles/ZepProRecruiterPricing.css';

const ZepProRecruiterPricing = () => {
    const pageRef = useRef(null);
    const [answers, setAnswers] = useState({});

    const complete = answers.src !== undefined && answers.int !== undefined;
    const picked = complete ? recommendedPlan(answers) : null;

    const handleAnswer = (key, value) => {
        setAnswers((prev) => ({ ...prev, [key]: value }));
    };

    // Once both answers are in, bring the recommendation into view if the
    // matrix has scrolled off the bottom of the screen.
    useEffect(() => {
        if (!picked) return;
        const row = pageRef.current?.querySelector('.zppr-row.pick');
        if (row && row.getBoundingClientRect().top > window.innerHeight) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [picked]);

    return (
        <div className="zppr-page" ref={pageRef}>
            <LandingNav />
            <main className="zppr-wrap">
                <ZepProPricingHero />
                <ZepProPlanFinder
                    answers={answers}
                    onAnswer={handleAnswer}
                    onReset={() => setAnswers({})}
                />
                <ZepProPlanMatrix answers={answers} picked={picked} />
                <ZepProIncluded />
                <ZepProPricingCTA />
            </main>
        </div>
    );
};

export default ZepProRecruiterPricing;
