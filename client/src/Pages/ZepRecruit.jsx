import React, { Fragment } from "react";
import ZepRecruitHero from "../Components/ZepRecruitHero";
import ScrollingTicker from "../Components/ScrollingTicker";
import HowZepRecruitWorks from "../Components/HowZepRecruitWorks";
import HowItWorksDiagram from "../Components/HowItWorksDiagram";
import WhyZepRecruit from "../Components/WhyZepRecruit";
import ZepRecruitContact from "../Components/ZepRecruitContact";

function ZepRecruit() {
  return (
    <Fragment>
      <ZepRecruitHero />
      <ScrollingTicker />
      <HowZepRecruitWorks />
      <HowItWorksDiagram />
      <WhyZepRecruit />
      <ZepRecruitContact />
    </Fragment>
  );
}

export default ZepRecruit;
