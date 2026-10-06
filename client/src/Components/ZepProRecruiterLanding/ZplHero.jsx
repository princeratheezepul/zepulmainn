import React, { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

// Hero: the brief chat plays out, then Zeus works through each stage on its
// own until the scorecard is ready, and the loop restarts.
const ZplHero = () => {
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(0); // number of chat messages visible
  const [typing, setTyping] = useState(null); // index of the message being "typed"
  const [stage, setStage] = useState(0); // 0 none, 1 JD done, 2..5 active stage, 6 scorecard
  const pulseRef = useRef(null);
  const pathInRef = useRef(null);
  const pathOutRef = useRef(null);

  useEffect(() => {
    if (reduce) {
      setShown(4);
      setTyping(null);
      setStage(7);
      return undefined;
    }

    let frame = null;
    const travel = (path, ms) => {
      const pulse = pulseRef.current;
      if (!path || !pulse) return;
      const length = path.getTotalLength();
      let t0 = null;
      pulse.setAttribute("opacity", 1);
      const step = (ts) => {
        if (t0 === null) t0 = ts;
        const k = Math.min((ts - t0) / ms, 1);
        const p = path.getPointAtLength(k * length);
        pulse.setAttribute("cx", p.x);
        pulse.setAttribute("cy", p.y);
        if (k < 1) frame = requestAnimationFrame(step);
        else pulse.setAttribute("opacity", 0);
      };
      frame = requestAnimationFrame(step);
    };

    // Delays (ms) before each step; one full loop is about 7.5s.
    const timeline = [
      [300, () => setShown(1)],
      [450, () => setTyping(1)],
      [450, () => { setTyping(null); setShown(2); }],
      [650, () => setShown(3)],
      [450, () => setTyping(3)],
      [450, () => { setTyping(null); setShown(4); setStage(1); travel(pathInRef.current, 400); }],
      [550, () => setStage(2)],
      [550, () => setStage(3)],
      [550, () => setStage(4)],
      [550, () => setStage(5)],
      [550, () => { setStage(6); travel(pathOutRef.current, 350); }],
      [1800, () => { setShown(0); setStage(0); }],
    ];

    let i = 0;
    let timer = null;
    const run = () => {
      const [delay, fn] = timeline[i];
      timer = setTimeout(() => {
        fn();
        i = (i + 1) % timeline.length;
        run();
      }, delay);
    };
    setShown(0);
    setTyping(null);
    setStage(0);
    run();

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [reduce]);

  const stepClass = (i) => {
    const on = i === stage && stage > 1;
    const done = i < stage || (i === 1 && stage >= 1);
    return "zp-st" + (on ? " zp-on" : "") + (done ? " zp-done" : "");
  };

  return (
    <div className="zp-zs1">
    <header className="zp-hero" id="top">
      <div className="zp-wrap zp-grid">
        <div>
          <h1>Meet Zeus. <span>Your AI hiring partner.</span></h1>
          <p className="zp-sub">Zeus is an autonomous AI agent that runs your hiring from job description to shortlist. It writes the job description, sources candidates, scores every CV for strength, runs coding tests and AI interviews, and hands you a decision-ready scorecard for each candidate.</p>
          <p className="zp-sub2">No handoffs between tools. No screening backlog. You make the final call.</p>
          <div className="zp-ctas"><a className="zp-btn zp-p" href="#book">Book a Demo →</a><a className="zp-btn zp-g" href="#how">See how Zeus works</a></div>
          <div className="zp-proof">
            <div><b>2M+</b><span>assessments and interviews completed</span></div>
            <div><b>800M+</b><span>global talent data</span></div>
            <div><b>60%</b><span>reduction in overall hiring time</span></div>
          </div>
        </div>

        <div className="zp-hv">
          <svg viewBox="0 0 600 606" role="img" aria-label="An employer briefs Zeus in a short conversation and the job description is ready in minutes. Zeus then sources candidates, scores CV strength, runs the coding test and the AI interview on its own, and delivers a scorecard. Your team decides.">
            <defs><radialGradient id="zp-orb" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#3D74FF" /><stop offset=".7" stopColor="#0A4DFF" /><stop offset="1" stopColor="#0733B0" /></radialGradient></defs>

            {/* conversation */}
            <g>
              <rect x="1" y="1" width="330" height="214" fill="#F6F8FC" stroke="#D4D9E5" />
              <text x="16" y="22" className="zp-mono" fontSize="9.5" letterSpacing="1.4" fill="#5E6477">YOU  ↔  ZEUS</text>
              <g className={"zp-msg" + (shown > 0 ? " zp-show" : "")}>
                <rect x="14" y="32" width="304" height="44" fill="#FFFFFF" stroke="#D4D9E5" />
                <text x="24" y="50" fontSize="11.5" fill="#111318">I need a senior backend engineer for our</text>
                <text x="24" y="66" fontSize="11.5" fill="#111318">London team. Hybrid, 6+ years, strong in Go.</text>
              </g>
              <g className={"zp-tp" + (typing === 1 ? " zp-show" : "")}><rect x="262" y="84" width="54" height="26" fill="#EEF3FF" stroke="#C8D6FF" /><g className="zp-dots" fill="#0A4DFF"><circle cx="279" cy="97" r="2.2" /><circle cx="289" cy="97" r="2.2" /><circle cx="299" cy="97" r="2.2" /></g></g>
              <g className={"zp-msg" + (shown > 1 ? " zp-show" : "")}>
                <rect x="40" y="84" width="276" height="44" fill="#EEF3FF" stroke="#C8D6FF" />
                <text x="50" y="102" fontSize="11.5" fill="#111318">Got it. Any must-have skills? And what</text>
                <text x="50" y="118" fontSize="11.5" fill="#111318">CV strength cutoff should I apply?</text>
              </g>
              <g className={"zp-msg" + (shown > 2 ? " zp-show" : "")}>
                <rect x="14" y="136" width="220" height="28" fill="#FFFFFF" stroke="#D4D9E5" />
                <text x="24" y="154" fontSize="11.5" fill="#111318">Kubernetes is a must. Cutoff 70.</text>
              </g>
              <g className={"zp-tp" + (typing === 3 ? " zp-show" : "")}><rect x="262" y="172" width="54" height="28" fill="#EEF3FF" stroke="#C8D6FF" /><g className="zp-dots" fill="#0A4DFF"><circle cx="279" cy="186" r="2.2" /><circle cx="289" cy="186" r="2.2" /><circle cx="299" cy="186" r="2.2" /></g></g>
              <g className={"zp-msg" + (shown > 3 ? " zp-show" : "")}>
                <rect x="40" y="172" width="276" height="30" fill="#0A4DFF" />
                <circle cx="55" cy="187" r="6" fill="#FFFFFF" /><path d="M52 187 l2 2 l4 -4.5" stroke="#0A4DFF" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <text x="68" y="191" fontSize="11.5" fontWeight="600" fill="#FFFFFF">Job description ready. Sourcing now.</text>
              </g>
            </g>

            <path ref={pathInRef} d="M160 215 C 160 238, 230 244, 276 239" fill="none" stroke="#C7CCDA" strokeDasharray="3 5" />
            <path ref={pathOutRef} d="M300 466 C 290 480, 270 488, 252 494" fill="none" stroke="#C7CCDA" strokeDasharray="3 5" />

            {/* orbit */}
            <circle cx="360" cy="340" r="125" fill="none" stroke="#E4E7EF" />
            <circle cx="360" cy="340" r="125" fill="none" stroke="#0A4DFF" strokeWidth="1.5" strokeDasharray="40 746" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 360 340" to="360 360 340" dur="9s" repeatCount="indefinite" /></circle>
            <circle cx="360" cy="340" r="90" fill="#EEF3FF" />
            <circle cx="360" cy="340" r="66" fill="url(#zp-orb)" />
            <text x="360" y="342" textAnchor="middle" fontSize="30" fill="#FFFFFF" style={{ fontFamily: "Lora, Georgia, serif" }}>Zeus</text>
            <text x="360" y="362" textAnchor="middle" className="zp-mono" fontSize="8" letterSpacing="1.4" fill="#C9D7FF">AI HIRING PARTNER</text>
            <text x="360" y="422" textAnchor="middle" className="zp-mono" fontSize="9" letterSpacing="1.4" fill="#0A4DFF">AUTONOMOUS</text>

            <g className={stepClass(1)}><circle cx="288" cy="238" r="10" /><path className="zp-ck" d="M284 238 l3 3 l5 -5.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text x="274" y="242" textAnchor="end">JD CREATED</text></g>
            <g className={stepClass(2)}><circle cx="422" cy="232" r="10" /><path className="zp-ck" d="M418 232 l3 3 l5 -5.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text x="438" y="228" textAnchor="start">SOURCING</text><text x="438" y="242" textAnchor="start" style={{ fontSize: "9.5px", letterSpacing: ".3px" }}>800M+ global profiles</text></g>
            <g className={stepClass(3)}><circle cx="485" cy="340" r="10" /><path className="zp-ck" d="M481 340 l3 3 l5 -5.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text x="501" y="344" textAnchor="start">CV STRENGTH</text></g>
            <g className={stepClass(4)}><circle cx="432" cy="442" r="10" /><path className="zp-ck" d="M428 442 l3 3 l5 -5.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text x="448" y="446" textAnchor="start">CODING TEST</text></g>
            <g className={stepClass(5)}><circle cx="307" cy="453" r="10" /><path className="zp-ck" d="M303 453 l3 3 l5 -5.5" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /><text x="324" y="480" textAnchor="start">AI INTERVIEW</text></g>

            <circle ref={pulseRef} r="4" fill="#0A4DFF" opacity="0" />

            {/* scorecard */}
            <g className={"zp-sc" + (stage >= 6 ? " zp-on" : "")}>
              <rect className="zp-bd" x="1" y="494" width="250" height="110" />
              <text x="16" y="515" className="zp-mono" fontSize="9.5" letterSpacing="1.2" fill="#5E6477">SCORECARD · CANDIDATE 04</text>
              <text x="16" y="550" fontSize="30" fill="#111318" style={{ fontFamily: "Lora, Georgia, serif" }}>87</text>
              <text x="54" y="550" fontSize="12" fill="#5E6477">/ 100</text>
              <g fontSize="10" fill="#5E6477">
                <text x="106" y="531">CV strength</text><rect x="176" y="524" width="60" height="4" fill="#E4E7EF" /><rect x="176" y="524" width="53" height="4" fill="#0A4DFF" />
                <text x="106" y="546">Coding</text><rect x="176" y="539" width="60" height="4" fill="#E4E7EF" /><rect x="176" y="539" width="52" height="4" fill="#0A4DFF" />
                <text x="106" y="561">Interview</text><rect x="176" y="554" width="60" height="4" fill="#E4E7EF" /><rect x="176" y="554" width="50" height="4" fill="#0A4DFF" />
              </g>
              <line x1="16" y1="572" x2="236" y2="572" stroke="#E4E7EF" />
              <g className="zp-rd"><circle cx="21" cy="589" r="4.5" fill="#0FA38E" /><text x="33" y="593" fontSize="12.5" fontWeight="600" fill="#111318">Ready for your decision</text></g>
            </g>
          </svg>
        </div>
      </div>
    </header>
    </div>
  );
};

export default ZplHero;
