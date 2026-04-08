import React from 'react';
import LandingNav from '../Components/landing/LandingNav';
import ZepConsultHero from '../Components/ZepConsultHero';
import ZepConsultTicker from '../Components/ZepConsultTicker';
import ZepConsultAdvantage from '../Components/ZepConsultAdvantage';
import ZepConsultServices from '../Components/ZepConsultServices';
import ZepConsultStats from '../Components/ZepConsultStats';
import ZepConsultServe from '../Components/ZepConsultServe';
import ZepConsultContact from '../Components/ZepConsultContact';
import '../styles/LandingPage.css';

const ZepConsult = () => {
    return (
        <div className="zep-consult-page">
            <LandingNav />
            <ZepConsultHero />
            <ZepConsultTicker />
            <ZepConsultAdvantage />
            <ZepConsultServices />
            <ZepConsultStats />
            <ZepConsultServe />
            <ZepConsultContact />
        </div>
    );
};

export default ZepConsult;
