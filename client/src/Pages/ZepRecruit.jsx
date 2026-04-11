import React, { Fragment } from "react";
import ZepHero from "../Components/ZepRecruitNew/ZepHero";
import ZepTicker from "../Components/ZepRecruitNew/ZepTicker";
import ZepPipeline from "../Components/ZepRecruitNew/ZepPipeline";
import ZepFeatures from "../Components/ZepRecruitNew/ZepFeatures";
import ZepWhyChoose from "../Components/ZepRecruitNew/ZepWhyChoose";
import ZepEngagement from "../Components/ZepRecruitNew/ZepEngagement";
import ZepBeyondCTA from "../Components/ZepRecruitNew/ZepBeyondCTA";
import "../styles/ZepRecruitNew.css";

function ZepRecruit() {
  return (
    <Fragment>
      <ZepHero />
      <ZepTicker />
      <ZepPipeline />
      <ZepFeatures />
      <ZepWhyChoose />
      <ZepEngagement />
      <ZepBeyondCTA />
    </Fragment>
  );
}

export default ZepRecruit;
