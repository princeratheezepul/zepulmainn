import React, { Fragment } from "react";
import LandingNav from "../Components/landing/LandingNav";
import ZepProHero from "../Components/ZepProRecruiterNew/ZepProHero";
import ZepProTicker from "../Components/ZepProRecruiterNew/ZepProTicker";
import ZepProPipeline from "../Components/ZepProRecruiterNew/ZepProPipeline";
import ZepProFeatures from "../Components/ZepProRecruiterNew/ZepProFeatures";
import ZepProWhyBusinesses from "../Components/ZepProRecruiterNew/ZepProWhyBusinesses";
import LandingBeyondCTA from "../Components/landing/LandingBeyondCTA";
import "../styles/LandingPage.css";
import "../styles/ZepProRecruiter.css";

const ProRecruitor = () => {
  return (
    <Fragment>
      <LandingNav />
      <ZepProHero />
      <ZepProTicker />
      <ZepProPipeline />
      <ZepProFeatures />
      <ZepProWhyBusinesses />
      <LandingBeyondCTA />
    </Fragment>
  );
};

export default ProRecruitor;