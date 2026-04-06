import React, { useEffect } from 'react';
import '../styles/LandingPage.css';

import LandingNav from '../Components/landing/LandingNav';
import LandingHero from '../Components/landing/LandingHero';
import LandingStats from '../Components/landing/LandingStats';
import LandingTicker from '../Components/landing/LandingTicker';
import LandingWhyCards from '../Components/landing/LandingWhyCards';
import LandingHowItWorks from '../Components/landing/LandingHowItWorks';
import LandingTwoPaths from '../Components/landing/LandingTwoPaths';
import LandingEngagement from '../Components/landing/LandingEngagement';
import LandingBeyondCTA from '../Components/landing/LandingBeyondCTA';
import LandingFooter from '../Components/landing/LandingFooter';

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
            <LandingHowItWorks />
            <LandingTwoPaths />
            <LandingEngagement />
            <LandingBeyondCTA />
            <LandingFooter />
        </div>
    );
};

export default LandingPage;
