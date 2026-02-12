import React, { Fragment } from "react";
import ZepRecruitHero from "../Components/ZepRecruitHero";
import ScrollingTicker from "../Components/ScrollingTicker";
import HowZepRecruitWorks from "../Components/HowZepRecruitWorks";
import HowItWorksDiagram from "../Components/HowItWorksDiagram";
import WhyZepRecruit from "../Components/WhyZepRecruit";
import ZepRecruitContact from "../Components/ZepRecruitContact";
import ContactForm from "../Components/ContactForm";

function ZepRecruit() {
  return (
    <Fragment>
      <ZepRecruitHero />
      <ScrollingTicker />
      <HowZepRecruitWorks />
      <HowItWorksDiagram />
      <section className="why-zep-recruit-section">
        <WhyZepRecruit />
      </section>
      {/* <ZepRecruitContact /> */}
      <div id="contact-form">
        <ContactForm />
      </div>
    </Fragment>
  );
}

export default ZepRecruit;
