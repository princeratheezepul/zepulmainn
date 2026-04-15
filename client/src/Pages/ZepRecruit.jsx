import React, { Fragment } from "react";
import LandingNav from "../Components/landing/LandingNav";
import ZepHero from "../Components/ZepRecruitNew/ZepHero";
import ZepTicker from "../Components/ZepRecruitNew/ZepTicker";
import ZepPipeline from "../Components/ZepRecruitNew/ZepPipeline";
import ZepFeatures from "../Components/ZepRecruitNew/ZepFeatures";
import ZepWhyChoose from "../Components/ZepRecruitNew/ZepWhyChoose";
import ZepEngagement from "../Components/ZepRecruitNew/ZepEngagement";
import LandingBeyondCTA from "../Components/landing/LandingBeyondCTA";
import ZepRecruitFooter from "../Components/ZepRecruitNew/ZepRecruitFooter";
import "../styles/LandingPage.css";
import "../styles/ZepRecruitNew.css";

function ZepRecruit() {
  return (
    <Fragment>
      <LandingNav />
      <ZepHero />
      <ZepTicker />
      <ZepPipeline />
      <ZepFeatures />
      <ZepWhyChoose />
      <ZepEngagement />
      <LandingBeyondCTA />
    </Fragment>
  );
}

export default ZepRecruit;
