import React, { Fragment, useState } from "react";
import LandingNav from "../Components/landing/LandingNav";
import TheaHero from "../Components/TheaLanding/TheaHero";
import TheaWhy from "../Components/TheaLanding/TheaWhy";
import TheaStart from "../Components/TheaLanding/TheaStart";
import TheaClose from "../Components/TheaLanding/TheaClose";
import "../styles/LandingPage.css";
import "../styles/TheaLanding.css";

const Thea = () => {
  // 0 = Talk to Thea, 1 = Prep document. "Get a free prep document" links
  // scroll to the workspace and switch it to the prep tab.
  const [tab, setTab] = useState(0);
  const openPrep = () => setTab(1);

  return (
    <Fragment>
      <LandingNav />
      <main className="th-page">
        <TheaHero onOpenPrep={openPrep} />
        <TheaWhy />
        <TheaStart tab={tab} onTab={setTab} />
        <TheaClose onOpenPrep={openPrep} />
      </main>
    </Fragment>
  );
};

export default Thea;
