import React, { Fragment } from "react";
import ZepRecruitHero from "../Components/ZepRecruitHero";
import HowZepRecruitWorks from "../Components/HowZepRecruitWorks";
import HowItWorksDiagram from "../Components/HowItWorksDiagram";
import WhyZepRecruit from "../Components/WhyZepRecruit";
import ZepRecruitContact from "../Components/ZepRecruitContact";

function ZepRecruit() {
  return (
    <Fragment>
      <ZepRecruitHero />
      <HowZepRecruitWorks />
      <HowItWorksDiagram />
      <WhyZepRecruit />
      <ZepRecruitContact />
    </Fragment>
  );
}

export default ZepRecruit;
