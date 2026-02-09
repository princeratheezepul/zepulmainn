import React from 'react';
import ZepConsultHero from '../Components/ZepConsultHero';
import ZepConsultAdvantage from '../Components/ZepConsultAdvantage';
import ZepConsultServices from '../Components/ZepConsultServices';
import ZepConsultStats from '../Components/ZepConsultStats';
import ZepConsultServe from '../Components/ZepConsultServe';
import ZepConsultContact from '../Components/ZepConsultContact';

const ZepConsult = () => {
    return (
        <div className="zep-consult-page">
            <ZepConsultHero />
            <ZepConsultAdvantage />
            <ZepConsultServices />
            <ZepConsultStats />
            <ZepConsultServe />
            <ZepConsultContact />
        </div>
    );
};

export default ZepConsult;
