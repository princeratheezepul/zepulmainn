import React, { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const CX = 150;
const CY = 180;
const ARC_R = 128;
const SWEEP_MS = 9000;
const HOLD_MS = 1800;

const STAGES = [
  { icon: "zp-g-jd", n: "Minutes", u: "", k: "JOB DESCRIPTION", w: "from one chat to a ready JD" },
  { icon: "zp-g-src", n: "<5", u: "min", k: "SOURCING", w: "to search 800M+ global profiles" },
  { icon: "zp-g-cv", n: "Seconds", u: "", k: "CV STRENGTH", w: "to read, rank and match each CV" },
  { icon: "zp-g-code", n: "Same", u: "day", k: "CODING TEST", w: "custom tests, sent and graded" },
  { icon: "zp-g-int", n: "24/7", u: "", k: "AI INTERVIEW", w: "in every time zone, no scheduling" },
  { icon: "zp-g-sc", n: "48", u: "hrs", k: "SCORECARDS", w: "brief to decision-ready shortlist" },
];

// Where on the dial (0..1 of a full turn) each stage is reached.
const MARKS_AT = [0.06, 0.2, 0.36, 0.54, 0.74, 0.94];

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const a = (i * 6 * Math.PI) / 180;
  const r1 = i % 5 ? 132 : 126;
  return {
    x1: CX + Math.sin(a) * r1,
    y1: CY - Math.cos(a) * r1,
    x2: CX + Math.sin(a) * 138,
    y2: CY - Math.cos(a) * 138,
    stroke: i % 5 ? "#D4D9E5" : "#9BA3BC",
  };
});

const MARKS = MARKS_AT.map((f) => {
  const a = f * 2 * Math.PI;
  return { cx: CX + Math.sin(a) * 112, cy: CY - Math.cos(a) * 112 };
});

const arcPath = (f) => {
  if (f <= 0) return "";
  const a = f * 2 * Math.PI;
  const x = CX + Math.sin(a) * ARC_R;
  const y = CY - Math.cos(a) * ARC_R;
  return `M${CX} ${CY - ARC_R} A${ARC_R} ${ARC_R} 0 ${f > 0.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
};

const stageAt = (f) => MARKS_AT.reduce((cur, p, i) => (f >= p ? i : cur), -1);

const ZplGet = () => {
  const reduce = usePrefersReducedMotion();
  const handRef = useRef(null);
  const arcRef = useRef(null);
  const [current, setCurrent] = useState(-1);

  // The hand and arc move every frame, so they are updated directly; React only
  // re-renders when the hand crosses into a new stage.
  useEffect(() => {
    const set = (f) => {
      handRef.current?.setAttribute("transform", `rotate(${f * 360} ${CX} ${CY})`);
      arcRef.current?.setAttribute("d", arcPath(f));
      setCurrent(stageAt(f));
    };

    if (reduce) {
      set(0.999);
      return undefined;
    }

    let t0 = null;
    let frame = requestAnimationFrame(function tick(ts) {
      if (t0 === null) t0 = ts;
      const t = (ts - t0) % (SWEEP_MS + HOLD_MS);
      set(Math.min(t / SWEEP_MS, 0.999));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [reduce]);

  return (
    <div className="zp-zs4">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <symbol id="zp-g-jd" viewBox="0 0 24 24"><path d="M5 2h10l5 5v15H5z" /><path d="M15 2v5h5" /><path className="zp-b" d="M8 10h8" /><path d="M8 14h9M8 18h6" /></symbol>
        <symbol id="zp-g-src" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" /><ellipse cx="12" cy="12" rx="9.5" ry="3.4" /><ellipse className="zp-b" cx="12" cy="12" rx="0" ry="9.5"><animate attributeName="rx" values="0;9.5;0" dur="5s" repeatCount="indefinite" /></ellipse><ellipse cx="12" cy="12" rx="0" ry="9.5"><animate attributeName="rx" values="0;9.5;0" dur="5s" begin="-2.5s" repeatCount="indefinite" /></ellipse></symbol>
        <symbol id="zp-g-cv" viewBox="0 0 24 24"><path d="M5 2h11l4 4v16H5z" /><path d="M8 9h9M8 13h10M8 17h6" /><path className="zp-b" d="M3 6h19"><animateTransform attributeName="transform" type="translate" values="0 0;0 13;0 0" dur="2.4s" repeatCount="indefinite" /></path></symbol>
        <symbol id="zp-g-code" viewBox="0 0 24 24"><path d="M8 6l-6 6 6 6M16 6l6 6-6 6" /><path className="zp-b" d="M14 4l-4 16" /></symbol>
        <symbol id="zp-g-int" viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v4" /><path className="zp-b" d="M1.5 9v4M22.5 9v4"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite" /></path></symbol>
        <symbol id="zp-g-sc" viewBox="0 0 24 24"><path d="M2 21h20" /><path d="M5 21v-6M10 21v-10M15 21v-7" /><path className="zp-b" d="M20 21v-15M17 8.5l3-3 3 3" /></symbol>
      </svg>

      <section className="zp-opt" id="get">
        <div className="zp-wrap">
          <div className="zp-head zp-c">
            <span className="zp-eyebrow">What you get with Zeus</span>
            <h2>From brief to shortlist, <em>on the clock.</em></h2>
          </div>
          <div className="zp-se">
            <svg className="zp-sw" viewBox="0 0 300 330" aria-hidden="true">
              <rect x="138" y="2" width="24" height="12" fill="none" stroke="#111318" strokeWidth="1.2" />
              <line x1="150" y1="14" x2="150" y2="26" stroke="#111318" strokeWidth="1.2" />
              <circle cx="150" cy="180" r="140" fill="none" stroke="#111318" strokeWidth="1.2" />
              <circle cx="150" cy="180" r="128" fill="none" stroke="#E4E7EF" />
              <g>
                {TICKS.map((t, i) => (
                  <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.stroke} strokeWidth="1" />
                ))}
              </g>
              <path ref={arcRef} fill="none" stroke="#0A4DFF" strokeWidth="2" strokeLinecap="round" />
              <g>
                {MARKS.map((m, i) => (
                  <circle key={i} cx={m.cx} cy={m.cy} r="3" fill={i <= current ? "#0A4DFF" : "#C8D6FF"} />
                ))}
              </g>
              <line ref={handRef} x1="150" y1="180" x2="150" y2="62" stroke="#0A4DFF" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="150" cy="180" r="5" fill="#0A4DFF" />
              <text x="150" y="232" textAnchor="middle" fontSize="11" letterSpacing="1.6" fill="#5E6477" style={{ fontFamily: "IBM Plex Mono, monospace" }}>ZEUS</text>
            </svg>
            <ul>
              {STAGES.map((s, i) => (
                <li
                  key={s.k}
                  className={(i <= current ? "zp-hit" : "") + (i === current ? " zp-now" : "")}
                >
                  <svg className="zp-ic" viewBox="0 0 24 24"><use href={`#${s.icon}`} /></svg>
                  <div className="zp-t">
                    <span className="zp-k">{s.k}</span>
                    <span className="zp-w">{s.w}</span>
                  </div>
                  <div className="zp-num">
                    {s.n}
                    {s.u && <small>{s.u}</small>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="zp-sum">
            <p>Your team spends its time <span>only on the finalists.</span></p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ZplGet;
