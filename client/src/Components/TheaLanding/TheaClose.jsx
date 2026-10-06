import React, { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../ZepProRecruiterLanding/usePrefersReducedMotion";

const STATS = [
  { label: "Job seekers talking to Thea", value: 32417 },
  { label: "Prep documents generated", value: 14263 },
  { label: "Job applications assisted", value: 83117 },
];

const COUNT_MS = 1800;
const fmt = (n) => Math.round(n).toLocaleString("en-US");

const TheaClose = ({ onOpenPrep }) => {
  const reduce = usePrefersReducedMotion();
  const statsRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Counts the numbers up (ease-out) the first time the stats scroll into view.
  useEffect(() => {
    if (reduce || !("IntersectionObserver" in window)) {
      setProgress(1);
      return undefined;
    }
    let frame;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        obs.disconnect();
        let t0 = null;
        frame = requestAnimationFrame(function tick(ts) {
          if (t0 === null) t0 = ts;
          const k = Math.min((ts - t0) / COUNT_MS, 1);
          setProgress(1 - Math.pow(1 - k, 3));
          if (k < 1) frame = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <section className="th-close">
      <div className="th-wrap">
        <span className="th-eyebrow">Thea so far</span>
        <h2>Careers are already <em>moving with Thea.</em></h2>
        <div className="th-stats" ref={statsRef}>
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="th-lab">{s.label}</p>
              <p className="th-num">{fmt(s.value * progress)}</p>
            </div>
          ))}
        </div>
        <p className="th-mission">Every career move, <em>a prepared one.</em></p>
        <div className="th-ctas">
          <a className="th-btn th-p" href="#th-start">Talk to Thea →</a>
          <a className="th-btn th-g" href="#th-start" onClick={onOpenPrep}>Get a free prep document</a>
        </div>
      </div>
    </section>
  );
};

export default TheaClose;
