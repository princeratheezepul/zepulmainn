import React, { Fragment, useState } from "react";
import LandingNav from "../Components/landing/LandingNav";
import TheaHero from "../Components/TheaLanding/TheaHero";
import TheaWhy from "../Components/TheaLanding/TheaWhy";
import TheaHow from "../Components/TheaLanding/TheaHow";
import TheaStart from "../Components/TheaLanding/TheaStart";
import TheaClose from "../Components/TheaLanding/TheaClose";
import "../styles/LandingPage.css";
import "../styles/TheaLanding.css";

const Thea = () => {
  // 0 = Talk to Thea, 1 = Prep document.
  const [tab, setTab] = useState(0);

  return (
    <Fragment>
      <LandingNav />
      <main className="th-page">
        <TheaHero />
        <TheaHow />
        <TheaWhy />
        <TheaStart tab={tab} onTab={setTab} />
        <TheaClose />
      </main>
    </Fragment>
  );
};

export default Thea;
