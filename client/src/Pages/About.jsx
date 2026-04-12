import React, { Fragment } from 'react';
import ZepAboutNav from '../Components/ZepAboutNew/ZepAboutNav';
import ZepAboutHero from '../Components/ZepAboutNew/ZepAboutHero';
import ZepAboutMission from '../Components/ZepAboutNew/ZepAboutMission';
import ZepAboutPartners from '../Components/ZepAboutNew/ZepAboutPartners';
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
            <ZepAboutMission />
            <ZepAboutPartners />
            <ZepAboutValues />
            <ZepAboutFAQ />
            <ZepAboutBeyondCTA />
            <ZepAboutFooter />
        </Fragment>
    );
};

export default About;
