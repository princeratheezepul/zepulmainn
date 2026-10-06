import React from "react";
import { Link } from "react-router-dom";

const ZplCTA = () => (
  <div className="zp-zs6">
    <section className="zp-cta" id="book">
      <svg className="zp-rings" viewBox="0 0 760 760" aria-hidden="true">
        <circle cx="380" cy="380" r="370" />
        <circle cx="380" cy="380" r="290" />
        <circle className="zp-arc" cx="380" cy="380" r="370" />
      </svg>
      <div className="zp-wrap">
        <span className="zp-sigline">AI that executes. You decide.</span>
        <h2>Ready to <em>meet Zeus?</em></h2>
        <p className="zp-lede">Give Zeus one live role and see the shortlist it delivers.</p>
        <div className="zp-ctas">
          <Link className="zp-btn zp-p" to="/contact">Book a Demo →</Link>
          <Link className="zp-btn zp-g" to="/pricing">See pricing</Link>
        </div>
      </div>
    </section>
  </div>
);

export default ZplCTA;
