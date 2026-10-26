import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import usePrefersReducedMotion from "../ZepProRecruiterLanding/usePrefersReducedMotion";

const VIDEO_BASE = "/assets/thea";

// The scripted conversation that plays over the hero video. "after" reveals a
// result card once that line has finished typing.
const SCRIPT = [
  { who: "u", text: "I’m looking for a data analyst role in Dubai." },
  { who: "t", text: "Here are three roles that match your profile.", after: "jobs" },
  { who: "u", text: "Am I ready to apply for the first one?" },
  { who: "t", text: "Almost. SQL is your gap. Your prep document shows exactly what to focus on.", after: "plan" },
];

const EMPTY_BUBBLE = { show: false, text: "", typing: false };

const Bubble = ({ who, state }) => (
  <div className={`th-bub th-${who}${state.show ? " th-show" : ""}`}>
    <small>{who === "u" ? "YOU" : "THEA"}</small>
    <span className="th-tx">
      {state.typing ? (
        <span className="th-dots"><i /><i /><i /></span>
      ) : (
        state.text
      )}
    </span>
  </div>
);

const TheaHero = () => {
  const reduce = usePrefersReducedMotion();
  const videoRef = useRef(null);
  const [bubbles, setBubbles] = useState({ u: EMPTY_BUBBLE, t: EMPTY_BUBBLE });
  const [jobs, setJobs] = useState(false);
  const [plan, setPlan] = useState(false);

  // React does not reliably set the muted attribute, and autoplay is blocked
  // without it, so the video is muted and started by hand. Some browsers also
  // stop looping in-memory video, so it is restarted when it pauses.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    v.muted = true;
    v.defaultMuted = true;
    const play = () => {
      const p = v.play && v.play();
      if (p && p.catch) p.catch(() => {});
    };
    const onEnded = () => {
      v.currentTime = 0;
      play();
    };
    const onVisible = () => {
      if (!document.hidden && v.paused) play();
    };
    v.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onVisible);
    const id = setInterval(() => {
      if (!document.hidden && v.paused && v.readyState > 1) play();
    }, 1500);
    play();
    return () => {
      v.removeEventListener("ended", onEnded);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (reduce) {
      setBubbles({
        u: { show: true, text: SCRIPT[2].text, typing: false },
        t: { show: true, text: SCRIPT[3].text, typing: false },
      });
      setJobs(true);
      setPlan(true);
      return undefined;
    }

    let cancelled = false;
    const timers = [];
    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    const run = async () => {
      for (let i = 0; !cancelled; i = (i + 1) % SCRIPT.length) {
        const { who, text, after } = SCRIPT[i];
        const other = who === "u" ? "t" : "u";
        if (i === 0) {
          setJobs(false);
          setPlan(false);
        }
        setBubbles((b) => ({
          ...b,
          [other]: { ...b[other], show: false },
          [who]: { show: true, text: "", typing: true },
        }));
        await wait(700);
        for (let c = 0; c <= text.length && !cancelled; c += 1) {
          setBubbles((b) => ({ ...b, [who]: { show: true, text: text.slice(0, c), typing: false } }));
          await wait(38);
        }
        await wait(700);
        if (cancelled) return;
        if (after === "jobs") setJobs(true);
        if (after === "plan") setPlan(true);
        await wait(i === SCRIPT.length - 1 ? 4000 : 1100);
      }
    };
    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  return (
    <header className="th-hero" id="th-top">
      <div className="th-wrap th-grid">
        <div>
          <h1>Meet Thea. <span>Your AI career partner.</span></h1>
          <p className="th-sub">
            Tell Thea where you want your career to go. Thea finds the jobs and internships worldwide that fit you,
            shows where you fall short, and tells you exactly what to prepare.
          </p>
          <p className="th-sub2">Fewer listings. Sharper matches. No guesswork.</p>
          <div className="th-ctas">
            <Link className="th-btn th-p" to="/candidate/dashboard">Talk to Thea →</Link>
            <Link className="th-btn th-g" to="/candidate/dashboard">Get a free prep document</Link>
          </div>
          <span className="th-free">FREE FOR JOB SEEKERS AND STUDENTS</span>
        </div>

        <div className="th-vis">
          <div
            className="th-scene"
            role="img"
            aria-label="A young woman at her desk talks with Thea, a holographic AI career partner rising from her laptop. As they talk, Thea finds matching jobs and prepares a document highlighting her skill gaps."
          >
            <div className="th-cam">
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={`${VIDEO_BASE}/thea-poster.jpg`}
                aria-hidden="true"
              >
                <source src={`${VIDEO_BASE}/thea-hero.webm`} type="video/webm" />
                <source src={`${VIDEO_BASE}/thea-hero.mp4`} type="video/mp4" />
              </video>
              <Bubble who="u" state={bubbles.u} />
              <Bubble who="t" state={bubbles.t} />
              <span className="th-live" aria-hidden="true">
                <b>LIVE</b>
                <small>Talking with Thea</small>
              </span>
            </div>
            <div className="th-cards">
              <div className={`th-panel th-pjobs${jobs ? " th-show" : ""}`}>
                <span className="th-k">MATCHED FOR YOU <em>{jobs ? "3 MATCHES" : ""}</em></span>
                <p className="th-wait">Listening…</p>
                <div className="th-row"><b>Data Analyst</b><span>Dubai</span></div>
                <div className="th-row"><b>BI Analyst, Graduate</b><span>Dubai</span></div>
                <div className="th-row"><b>Analytics Intern</b><span>Abu Dhabi</span></div>
              </div>
              <div className={`th-panel th-pplan${plan ? " th-show" : ""}`}>
                <span className="th-k">YOUR PREP DOCUMENT <em>DATA ANALYST</em></span>
                <p className="th-wait">Generated on request</p>
                <div className="th-row"><b>Role fit</b><span>Strong</span></div>
                <div className="th-row"><b>Gap to close</b><span>SQL</span></div>
                <div className="th-row"><b>Focus on</b><span>Joins · Window functions</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TheaHero;
