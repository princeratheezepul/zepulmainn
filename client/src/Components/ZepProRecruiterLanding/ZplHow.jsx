import React, { useEffect, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

const STEP_COUNT = 8;

// Compact version shown under 640px instead of the eight-column flow.
const MOBILE_STEPS = [
  { title: "Job description", text: "Ready in minutes", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6" /></svg> },
  { title: "Sourcing", text: "800M+ global profiles", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></svg> },
  { title: "CV strength", text: "Read, rank, match", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16" /><path d="M7 20v-6M11 20v-10M15 20v-8M19 20v-13" /></svg> },
  { title: "Coding test", text: "Customised per candidate", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></svg> },
  { title: "AI interview", text: "Finds the “more”", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg> },
  { title: "Scorecard", text: "Ranked, comparable", icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" /><path d="M8 8h8M8 12h5M8 16h7" /></svg> },
];

const ZplHow = () => {
  const reduce = usePrefersReducedMotion();
  // n === STEP_COUNT is the "everything done" beat before the loop restarts.
  const [n, setN] = useState(0);
  const [mobileActive, setMobileActive] = useState(0);

  useEffect(() => {
    if (reduce) {
      setN(STEP_COUNT - 1);
      setMobileActive(-1);
      return undefined;
    }
    setN(0);
    const desk = setInterval(() => setN((v) => (v + 1) % (STEP_COUNT + 1)), 1500);
    const mobile = setInterval(
      () => setMobileActive((v) => (v + 1) % (MOBILE_STEPS.length + 1)),
      1100
    );
    return () => {
      clearInterval(desk);
      clearInterval(mobile);
    };
  }, [reduce]);

  const allDone = n === STEP_COUNT;
  const stepClass = (k, you = false) =>
    (you ? "zp-you" : "") +
    (!allDone && k === n ? " zp-on" : "") +
    (allDone || k < n ? " zp-done" : "");
  const barIndex = allDone ? STEP_COUNT - 1 : n;
  const barWidth = `calc(${(barIndex / STEP_COUNT) * 100}% + 6px)`;
  const mobileClass = (i) => (i === mobileActive ? "zp-on" : undefined);

  return (
    <div className="zp-zs2">
    <section id="how">
      <div className="zp-wrap">
        <div className="zp-head">
          <div>
            <span className="zp-eyebrow">How it works</span>
            <h2>From one conversation to a shortlist. <em>Zeus runs everything in between.</em></h2>
          </div>
          <p className="zp-lede">You start it with a brief. You finish it with a decision. The six steps in between run on their own.</p>
        </div>

        <div className="zp-flow">
          <div className="zp-brk"><span>ZEUS · AUTONOMOUS</span></div>
          <ol className="zp-steps">
            <span className="zp-bar" style={{ width: barWidth }} aria-hidden="true"></span>

            <li className={stepClass(0, true)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <path className="zp-s" d="M4 6 h76 v26 h-56 l-10 9 v-9 h-10 z" />
                <rect className="zp-f" x="14" y="16" width="44" height="3" /><rect className="zp-l" x="14" y="23" width="30" height="3" />
                <path className="zp-s" d="M44 44 h80 v26 h-10 v9 l-10 -9 h-60 z" />
                <circle className="zp-f" cx="64" cy="57" r="2.4" /><circle className="zp-f" cx="74" cy="57" r="2.4" /><circle className="zp-f" cx="84" cy="57" r="2.4" />
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">01 · YOU</span><h3>Brief Zeus</h3><p>A two-minute chat</p>
            </li>

            <li className={stepClass(1)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <path className="zp-s" d="M24 2 h58 l14 14 v66 h-72 z" /><path className="zp-s" d="M82 2 v14 h14" />
                <rect className="zp-f" x="34" y="20" width="34" height="4" />
                <rect className="zp-l" x="34" y="31" width="52" height="3" /><rect className="zp-l" x="34" y="38" width="46" height="3" /><rect className="zp-l" x="34" y="45" width="50" height="3" />
                <rect className="zp-s" x="34" y="56" width="18" height="10" /><rect className="zp-s" x="56" y="56" width="28" height="10" />
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">02 · ZEUS</span><h3>Job description</h3><p>Ready in minutes</p>
            </li>

            <li className={stepClass(2)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <defs><clipPath id="zp-gclip"><circle cx="40" cy="42" r="36" /></clipPath></defs>
                <circle className="zp-s" cx="40" cy="42" r="36" />
                <g clipPath="url(#zp-gclip)">
                  <ellipse className="zp-s" cx="40" cy="42" rx="36" ry="10" strokeWidth="1" />
                  <line className="zp-s" x1="8.8" y1="24" x2="71.2" y2="24" strokeWidth="1" /><line className="zp-s" x1="8.8" y1="60" x2="71.2" y2="60" strokeWidth="1" />
                  <ellipse className="zp-s" cx="40" cy="42" rx="0" ry="36" strokeWidth="1"><animate attributeName="rx" values="0;36;0" dur="6s" repeatCount="indefinite" /></ellipse>
                  <ellipse className="zp-s" cx="40" cy="42" rx="0" ry="36" strokeWidth="1"><animate attributeName="rx" values="0;36;0" dur="6s" begin="-2s" repeatCount="indefinite" /></ellipse>
                  <ellipse className="zp-s" cx="40" cy="42" rx="0" ry="36" strokeWidth="1"><animate attributeName="rx" values="0;36;0" dur="6s" begin="-4s" repeatCount="indefinite" /></ellipse>
                  <circle className="zp-l" r="2.6"><animateMotion dur="5s" repeatCount="indefinite" path="M2 30 L78 30" /></circle>
                  <circle className="zp-f" r="3"><animateMotion dur="5s" begin="-1.6s" repeatCount="indefinite" path="M2 44 L78 44" /></circle>
                  <circle className="zp-l" r="2.6"><animateMotion dur="5s" begin="-3.2s" repeatCount="indefinite" path="M2 56 L78 56" /></circle>
                  <circle className="zp-f" r="3"><animateMotion dur="5s" begin="-.8s" repeatCount="indefinite" path="M2 36 L78 36" /></circle>
                  <circle className="zp-l" r="2.4"><animateMotion dur="5s" begin="-4s" repeatCount="indefinite" path="M2 50 L78 50" /></circle>
                </g>
                <circle className="zp-f" r="3.4"><animateMotion dur="2.4s" repeatCount="indefinite" path="M56 38 C 70 20, 82 18, 94 20" /><animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite" /></circle>
                <rect className="zp-s" x="88" y="12" width="38" height="16" /><circle className="zp-f" cx="95" cy="20" r="3" /><rect className="zp-l" x="101" y="18.5" width="20" height="3" />
                <rect className="zp-s" x="88" y="34" width="38" height="16" /><circle className="zp-f" cx="95" cy="42" r="3" /><rect className="zp-l" x="101" y="40.5" width="16" height="3" />
                <rect className="zp-s" x="88" y="56" width="38" height="16" /><circle className="zp-f" cx="95" cy="64" r="3" /><rect className="zp-l" x="101" y="62.5" width="18" height="3" />
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">03 · ZEUS</span><h3>Sourcing</h3><p>Sourced from 800M+ profiles, readiness verified</p>
            </li>

            <li className={stepClass(3)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <path className="zp-s" d="M4 6 h28 l8 8 v62 h-36 z" />
                <rect className="zp-l" x="10" y="20" width="22" height="3" /><rect className="zp-l" x="10" y="28" width="24" height="3" /><rect className="zp-l" x="10" y="36" width="18" height="3" /><rect className="zp-l" x="10" y="44" width="24" height="3" /><rect className="zp-l" x="10" y="52" width="20" height="3" /><rect className="zp-l" x="10" y="60" width="22" height="3" />
                <rect className="zp-f" x="6" y="18" width="32" height="2" opacity=".8"><animate attributeName="y" values="16;66;16" dur="2.6s" repeatCount="indefinite" /></rect>
                <path className="zp-s" d="M46 41 h12 M54 37 l4 4 l-4 4" />
                <g fontSize="9" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                  <text x="66" y="22" className="zp-f">1</text><rect className="zp-f" x="76" y="16" width="34" height="7" /><text x="126" y="22" className="zp-f" textAnchor="end">96</text>
                  <text x="66" y="44" className="zp-f">2</text><rect className="zp-f" x="76" y="38" width="28" height="7" opacity=".7" /><text x="126" y="44" className="zp-f" textAnchor="end">91</text>
                  <text x="66" y="66" className="zp-f">3</text><rect className="zp-f" x="76" y="60" width="22" height="7" opacity=".45" /><text x="126" y="66" className="zp-f" textAnchor="end">88</text>
                </g>
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">04 · ZEUS</span><h3>CV strength</h3><p>Read, rank, match</p>
            </li>

            <li className={stepClass(4)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <rect x="22" y="2" width="100" height="62" fill="#FFFFFF" stroke="#E4E7EF" />
                <rect x="14" y="10" width="100" height="62" fill="#FFFFFF" stroke="#DDE1EB" />
                <rect className="zp-s" x="6" y="18" width="100" height="64" fill="#FFFFFF" /><line className="zp-s" x1="6" y1="30" x2="106" y2="30" />
                <circle className="zp-f" cx="13" cy="24" r="1.8" /><circle className="zp-f" cx="20" cy="24" r="1.8" /><circle className="zp-f" cx="27" cy="24" r="1.8" />
                <path className="zp-s" d="M36 46 l-9 9 l9 9 M76 46 l9 9 l-9 9 M61 42 l-10 26" />
                <path className="zp-f" d="M112 2 l2.6 6.4 l6.4 2.6 l-6.4 2.6 l-2.6 6.4 l-2.6 -6.4 l-6.4 -2.6 l6.4 -2.6 z"><animateTransform attributeName="transform" type="rotate" values="0 112 11;90 112 11" dur="3s" repeatCount="indefinite" /></path>
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">05 · ZEUS</span><h3>Coding test</h3><p>AI-customised per candidate</p>
            </li>

            <li className={stepClass(5)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <circle className="zp-s" cx="26" cy="30" r="12" /><path className="zp-s" d="M4 82 c0 -17 9 -26 22 -26 s22 9 22 26" />
                <path className="zp-s" d="M58 4 h66 v28 h-48 l-9 8 v-8 h-9 z" />
                <text x="91" y="23" textAnchor="middle" className="zp-f" fontSize="11" fontWeight="600">+ more</text>
                <rect className="zp-f" x="62" y="56" width="4" height="12" /><rect className="zp-f" x="70" y="49" width="4" height="26" /><rect className="zp-f" x="78" y="53" width="4" height="18" /><rect className="zp-f" x="86" y="45" width="4" height="34" /><rect className="zp-f" x="94" y="52" width="4" height="20" /><rect className="zp-f" x="102" y="56" width="4" height="12" /><rect className="zp-f" x="110" y="51" width="4" height="22" />
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">06 · ZEUS</span><h3>AI interview</h3><p>Structured to find the ‘more’</p>
            </li>

            <li className={stepClass(6)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <rect className="zp-s" x="14" y="4" width="100" height="76" />
                <text x="26" y="38" className="zp-f" fontSize="24" style={{ fontFamily: "Lora, Georgia, serif" }}>87</text>
                <rect className="zp-l" x="64" y="20" width="38" height="4" /><rect className="zp-f" x="64" y="20" width="32" height="4" />
                <rect className="zp-l" x="64" y="30" width="38" height="4" /><rect className="zp-f" x="64" y="30" width="29" height="4" />
                <rect className="zp-l" x="64" y="40" width="38" height="4" /><rect className="zp-f" x="64" y="40" width="34" height="4" />
                <line className="zp-s" x1="26" y1="56" x2="102" y2="56" /><rect className="zp-l" x="26" y="64" width="50" height="4" />
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">07 · ZEUS</span><h3>Scorecard</h3><p>Ranked and comparable</p>
            </li>

            <li className={stepClass(7, true)}>
              <div className="zp-art"><svg viewBox="0 0 128 84" aria-hidden="true">
                <circle className="zp-s" cx="28" cy="26" r="13" /><path className="zp-s" d="M4 80 c0 -18 10 -28 24 -28 s24 10 24 28" />
                <circle className="zp-f" cx="46" cy="14" r="9" /><path d="M42 14 l3 3 l5 -6" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path className="zp-s" d="M62 46 h14 M72 42 l4 4 l-4 4" />
                <path className="zp-s" d="M84 22 h26 l12 12 v46 h-38 z" /><rect className="zp-l" x="92" y="42" width="22" height="3" /><rect className="zp-l" x="92" y="50" width="18" height="3" /><rect className="zp-l" x="92" y="58" width="22" height="3" />
              </svg></div>
              <span className="zp-dot"></span>
              <span className="zp-who">08 · YOU</span><h3>You decide</h3><p>Finalists get a prep doc</p>
            </li>
          </ol>
        </div>

        <div className="zp-mhow">
          <div className="zp-mh-you">
            <i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H10l-5 4v-4H4z" /></svg></i>
            <div><small>01 · YOU</small><b>Brief Zeus</b><span>A two-minute chat about the role</span></div>
          </div>
          <span className="zp-mh-arrow"></span>
          <div className="zp-mh-z">
            <small>02–07 · ZEUS, AUTONOMOUSLY</small>
            <ol>
              {MOBILE_STEPS.map((s, i) => (
                <li key={s.title} className={mobileClass(i)}>
                  <i>{s.icon}</i>
                  <b>{s.title}</b>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
          <span className="zp-mh-arrow"></span>
          <div className="zp-mh-you">
            <i><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" /><path d="M15 11l2.2 2.2L21.5 9" /></svg></i>
            <div><small>08 · YOU</small><b>You decide</b><span>Finalists receive a prep document</span></div>
          </div>
        </div>

        <p className="zp-closing">Zeus runs the workflow. <span>You make the decisions.</span></p>
      </div>
    </section>
    </div>
  );
};

export default ZplHow;
