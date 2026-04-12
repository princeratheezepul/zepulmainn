import React, { Fragment } from 'react';
import ZepAboutNav from '../Components/ZepAboutNew/ZepAboutNav';
import ZepAboutHero from '../Components/ZepAboutNew/ZepAboutHero';
import ZepAboutOSSection from '../Components/ZepAboutNew/ZepAboutOSSection';
import ZepAboutValues from '../Components/ZepAboutNew/ZepAboutValues';
import ZepAboutFAQ from '../Components/ZepAboutNew/ZepAboutFAQ';
import ZepAboutBeyondCTA from '../Components/ZepAboutNew/ZepAboutBeyondCTA';
import ZepAboutFooter from '../Components/ZepAboutNew/ZepAboutFooter';
import '../styles/ZepAbout.css';

const About = () => {
    return (
        <Fragment>
            <ZepAboutNav />
            <ZepAboutHero />
            <ZepAboutOSSection />
            <ZepAboutValues />
            <ZepAboutFAQ />
            <ZepAboutBeyondCTA />
            <ZepAboutFooter />
        </Fragment>
    );
};

export default About;
