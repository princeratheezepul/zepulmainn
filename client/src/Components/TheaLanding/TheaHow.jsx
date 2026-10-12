import React from "react";
import ClickToPlayVideo from "../ClickToPlayVideo";

const TheaHow = () => (
  <section id="how" className="th-how">
    <div className="th-wrap">
      <span className="th-how-eyebrow">How Thea Works</span>
      <div className="th-how-video">
        <ClickToPlayVideo src="/thea-video.mp4" label="Thea walkthrough video" />
      </div>
    </div>
  </section>
);

export default TheaHow;
