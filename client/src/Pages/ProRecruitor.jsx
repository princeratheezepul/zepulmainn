import React, { Fragment } from "react";
import LandingNav from "../Components/landing/LandingNav";
import ZplHero from "../Components/ZepProRecruiterLanding/ZplHero";
import ZplHow from "../Components/ZepProRecruiterLanding/ZplHow";
import ZplThea from "../Components/ZepProRecruiterLanding/ZplThea";
import ZplGet from "../Components/ZepProRecruiterLanding/ZplGet";
import ZplWhy from "../Components/ZepProRecruiterLanding/ZplWhy";
import ZplCTA from "../Components/ZepProRecruiterLanding/ZplCTA";
import "../styles/LandingPage.css";
import "../styles/ZepProRecruiterLanding.css";

const ProRecruitor = () => {
  return (
    <Fragment>
      <LandingNav />
      <main className="zp-page">
        <ZplHero />
        <ZplHow />
        <ZplThea />
        <ZplGet />
        <ZplWhy />
        <ZplCTA />
      </main>
    </Fragment>
  );
};

export default ProRecruitor;
