import React, { Fragment } from "react";

import { FeatureCards } from "../Components/ZepRecruit/FeatureCards";
import { HeroSection } from "../Components/ZepRecruit/HeroSection";
import { ScrollingTicker } from "../Components/ZepRecruit/ScrollingTicker";
import WhyZepRecruit from "../Components/ZepRecruit/WhyZepRecruit";
import HowItWorks from "../Components/Shared/HowItWorks";

import { ServicesSection } from "../Components/ZepRecruit/ServicesSection";
import { WhyChooseUs } from "../Components/ZepRecruit/WhyChooseUs";
import RecruitmentPartner from "../Components/ZepRecruit/RecruitmentPartner";
import HiringModelContact from "../Components/HiringModelContact";

function ZepRecruit() {
  // How Zep Recruit Works steps
  const howItWorksSteps = [
    { id: 1, title: "Requirement & Engagement Setup", image: "/assets/zeprecruit/step1.jpg" },
    { id: 2, title: "Dedicated Manager Assigned", image: "/assets/zeprecruit/step2.jpg" },
    { id: 3, title: "Activation Of In-House Team", image: "/assets/zeprecruit/step3.jpg" },
    { id: 4, title: "AI CV Strength Scoring & Skill Assessments", image: "/assets/zeprecruit/step4.jpg" },
    { id: 5, title: "AI-Assisted Interviews & Unified Scorecards", image: "/assets/zeprecruit/step5.jpg" },
    { id: 6, title: "Interview Coordination And Closure", image: "/assets/zeprecruit/step6.jpg" },
  ];

  return (
    <Fragment>
      <HeroSection />
      <ScrollingTicker />
      <FeatureCards />
      <WhyZepRecruit />
      <HowItWorks
        title={<>How Zep Recruit<br />Works</>}
        subtitle="Output quality remains consistent — regardless of who sources the candidate."
        steps={howItWorksSteps}
      />
      <HiringModelContact />
      {/* <WhyChooseUs />
      <ServicesSection /> */}
      {/* <ServiceFeatures /> */}
      {/* <RecruitmentPartner /> */}
      {/* <CallToAction /> */}
    </Fragment>
  );
}

export default ZepRecruit;
