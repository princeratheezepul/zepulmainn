import React from 'react';
import AboutHero from '../Components/AboutHero';
import AboutTeam from '../Components/AboutTeam';
import AboutFAQ from '../Components/AboutFAQ';
import AboutSpotlight from '../Components/AboutSpotlight';

const About = () => {
    return (
        <div className="about-page">
            <AboutHero />
            <AboutTeam />
            <AboutFAQ />
            <AboutSpotlight />
        </div>
    );
};

export default About;
