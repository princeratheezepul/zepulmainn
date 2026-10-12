import React from "react";
import ClickToPlayVideo from "../ClickToPlayVideo";

const ZplHow = () => {
  return (
    <div className="zp-zs2">
    <section id="how">
      <div className="zp-wrap">
        <div className="zp-head">
          <div>
            <span className="zp-eyebrow">How Zeus Works</span>
          </div>
          <p className="zp-closing">Zeus runs the workflow. <span>You make the decisions.</span></p>
        </div>

        <div className="zp-video">
          <ClickToPlayVideo src="/zeus-video.mp4" label="Zeus walkthrough video" />
        </div>
      </div>
    </section>
    </div>
  );
};

export default ZplHow;
