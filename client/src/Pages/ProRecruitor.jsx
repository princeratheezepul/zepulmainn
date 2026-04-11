import React, { Fragment } from "react";
import ZepProHero from "../Components/ZepProRecruiterNew/ZepProHero";
import ZepProTicker from "../Components/ZepProRecruiterNew/ZepProTicker";
import ZepProPipeline from "../Components/ZepProRecruiterNew/ZepProPipeline";
import ZepProFeatures from "../Components/ZepProRecruiterNew/ZepProFeatures";
import ZepProWhyChoose from "../Components/ZepProRecruiterNew/ZepProWhyChoose";
import ZepProBeyondCTA from "../Components/ZepProRecruiterNew/ZepProBeyondCTA";
import "../styles/ZepProRecruiter.css";

const ProRecruitor = () => {
  return (
    <Fragment>
      <ZepProHero />
      <ZepProTicker />
      <ZepProPipeline />
      <ZepProFeatures />
      <ZepProWhyChoose />
      <ZepProBeyondCTA />
    </Fragment>
  );
};

export default ProRecruitor;