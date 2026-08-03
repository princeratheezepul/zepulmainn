import React, { useEffect } from 'react';
import '../styles/LandingPage.css';
import '../styles/LandingEcosystem.css';

import LandingNav from '../Components/landing/LandingNav';
import LandingHero from '../Components/landing/LandingHero';
import LandingStats from '../Components/landing/LandingStats';
import LandingTicker from '../Components/landing/LandingTicker';
import LandingWhyCards from '../Components/landing/LandingWhyCards';
import LandingFallShort from '../Components/landing/LandingFallShort';
import LandingApproach from '../Components/landing/LandingApproach';
import LandingProducts from '../Components/landing/LandingProducts';
import LandingCoreValue from '../Components/landing/LandingCoreValue';
import LandingHowItWorks from '../Components/landing/LandingHowItWorks';

const LandingPage = () => {
    // Scroll reveal for .lp-reveal elements
    useEffect(() => {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('lp-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.lp-reveal').forEach(el => revealObserver.observe(el));
        return () => revealObserver.disconnect();
    }, []);

    return (
        <div className="lp-root">
            <LandingNav />
            <LandingHero />
            <LandingStats />
            <LandingTicker />
            <LandingWhyCards />
            <LandingFallShort />
            <LandingApproach />
            <LandingHowItWorks />
            <LandingProducts />
            <LandingCoreValue />
        </div>
    );
};

export default LandingPage;
