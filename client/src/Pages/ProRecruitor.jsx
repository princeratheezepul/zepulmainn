import React from 'react';
import ProRecruiterHero from '../Components/ProRecruiterHero';
import ScrollingTicker from '../Components/ScrollingTicker';
import HowProRecruiterWorks from '../Components/HowProRecruiterWorks';
import ProRecruiterProcessDiagram from '../Components/ProRecruiterProcessDiagram';
import WhyZepProRecruiter from '../Components/WhyZepProRecruiter';
import ZepRecruitContact from '../Components/ZepRecruitContact';

const ProRecruitor = () => {
  return (
    <div className="font-sans text-black">
      <ProRecruiterHero />
      <ScrollingTicker />
      <HowProRecruiterWorks />
      <ProRecruiterProcessDiagram />
      <WhyZepProRecruiter />
      <ZepRecruitContact />
    </div>
  );
};

export default ProRecruitor;