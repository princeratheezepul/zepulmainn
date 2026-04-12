import React, { Fragment } from 'react';
import ZepAboutNav from '../Components/ZepAboutNew/ZepAboutNav';
import ZepAboutHero from '../Components/ZepAboutNew/ZepAboutHero';
import ZepAboutOSSection from '../Components/ZepAboutNew/ZepAboutOSSection';
import ZepAboutPartners from '../Components/ZepAboutNew/ZepAboutPartners';
import ZepAboutValues from '../Components/ZepAboutNew/ZepAboutValues';
import ZepAboutFAQ from '../Components/ZepAboutNew/ZepAboutFAQ';
import ZepAboutBeyondCTA from '../Components/ZepAboutNew/ZepAboutBeyondCTA';
import ZepAboutFooter from '../Components/ZepAboutNew/ZepAboutFooter';
import '../styles/ZepAbout.css';
import LandingBeyondCTA from '../Components/landing/LandingBeyondCTA';

const About = () => {
    return (
        <Fragment>
            <ZepAboutNav />
            <ZepAboutHero />
            <ZepAboutOSSection />
            <ZepAboutPartners />
            {/* <ZepAboutValues /> */}
            <ZepAboutFAQ />
            {/* <ZepAboutBeyondCTA /> */}
            {/* <ZepAboutFooter /> */}
            <LandingBeyondCTA/>
        </Fragment>
    );
};

export default About;
