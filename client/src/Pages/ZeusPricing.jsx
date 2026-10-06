import React, { Fragment, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LandingNav from "../Components/landing/LandingNav";
import "../styles/LandingPage.css";
import "../styles/ZeusPricing.css";

// Columns of the plan matrix. "q" ties a column to a finder question so it can
// be highlighted (wanted) or struck through (not needed) once answered.
const COLUMNS = [
  { label: "AI sourcing", q: "src" },
  { label: "Interest verification", q: "src" },
  { label: "CV strength", q: "" },
  { label: "Coding test", q: "" },
  { label: "AI interview", q: "int" },
  { label: "Shortlist & scorecard", q: "" },
];

// Each cell is [text, on, isSegmentStart, isSegmentEnd]; text "—" means not included.
const PLANS = [
  {
    key: "recruit",
    name: "Zeus Assist",
    desc: "Find and engage the right candidates.",
    req: "5 active hiring requirements",
    price: "$499",
    cells: [["3,000 credits", 1, 1, 0], ["✓", 1, 0, 0], ["500 CVs", 1, 0, 0], ["500 Tests", 1, 0, 1], ["—", 0], ["✓", 1, 1, 1]],
  },
  {
    key: "screen",
    name: "Zeus Screen",
    desc: "Screen and interview your own applicants.",
    req: "10 active hiring requirements",
    price: "$1,500",
    cells: [["—", 0], ["—", 0], ["1,000 CVs", 1, 1, 0], ["1,000 Tests", 1, 0, 0], ["3,000 min", 1, 0, 0], ["✓", 1, 0, 1]],
  },
  {
    key: "hire",
    name: "Zeus Hire",
    desc: "The full pipeline, end to end.",
    req: "15 active hiring requirements",
    price: "$2,500",
    flag: "Most complete",
    cells: [["10,000 credits", 1, 1, 0], ["✓", 1, 0, 0], ["1,500 CVs", 1, 0, 0], ["1,500 Tests", 1, 0, 0], ["3,000 min", 1, 0, 0], ["✓", 1, 0, 1]],
  },
];

const QUESTIONS = [
  {
    id: "src",
    text: "Do you need AI to find candidates for you?",
    hint: "AI sourcing from global talent data, plus interest verification.",
    no: "No, I have applicants",
  },
  {
    id: "int",
    text: "Do you want AI to run interviews?",
    hint: "Authorised AI interviews with a scorecard for every candidate.",
    no: "No, we'll interview",
  },
];

const INCLUDED = [
  "CV strength analysis",
  "Coding assessment",
  "Automated candidate communication",
  "Candidate shortlisting & scorecards",
  "Phone reveal for shortlisted candidates",
  "Interview prep documents — up to 15 per active requirement",
  "Employer manager & recruiter logins",
  "Recruiter + hiring manager workflow",
];

const NOTES = {
  hire: "Sourcing to AI interview — the full pipeline.",
  screen: "AI screens and interviews your own applicants.",
  recruit: "AI finds and engages candidates; your team interviews.",
};

const pickPlan = ({ src, int }) => {
  if (src === 1 && int === 1) return "hire";
  if (int === 1) return "screen";
  return "recruit";
};

// Adds "zps-in" once the element scrolls into view (drives the fade-up and the
// coverage bars filling in).
const useReveal = () => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown ? " zps-in" : ""];
};

const ZeusPricing = () => {
  const [answers, setAnswers] = useState({});
  const rowRefs = useRef({});
  const [heroRef, heroIn] = useReveal();
  const [askRef, askIn] = useReveal();
  const [mxRef, mxIn] = useReveal();
  const [everyRef, everyIn] = useReveal();
  const [closeRef, closeIn] = useReveal();

  const answered = Object.keys(answers).length;
  const done = answered === QUESTIONS.length;
  const plan = done ? pickPlan(answers) : null;
  const planInfo = PLANS.find((p) => p.key === plan);

  const answer = (q, v) => {
    const next = { ...answers, [q]: v };
    setAnswers(next);
    // Once both answers are in, bring the recommended row into view if it is
    // below the fold.
    if (Object.keys(next).length === QUESTIONS.length) {
      const row = rowRefs.current[pickPlan(next)];
      if (row && row.getBoundingClientRect().top > window.innerHeight) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  let outName = "Answer 2 questions";
  let outText = "We’ll highlight the plan that fits below.";
  if (answered === 1) outName = "One more question";
  if (done) {
    outName = `${planInfo.name} · ${planInfo.price}/mo`;
    outText =
      answers.src === 0 && answers.int === 0
        ? "Our entry plan — CV strength and coding assessments come with every plan."
        : NOTES[plan];
  }

  const colClass = (q) => {
    if (!q || answers[q] === undefined) return "";
    return answers[q] ? "zps-want" : "zps-skip";
  };

  return (
    <Fragment>
      <LandingNav />
      <main className="zps-page">
        <div className="zps-wrap">
          <section className={`zps-hero zps-rv${heroIn}`} ref={heroRef}>
            <p className="zps-eyebrow">Pricing</p>
            <h1>Zeus AI hiring partner <em>pricing</em></h1>
            <p className="zps-sub">
              Tell us what you want the AI to handle — we’ll highlight the plan that fits. Every plan runs on the same
              agentic AI hiring platform.
            </p>
          </section>

          <section className={`zps-ask zps-rv${askIn}`} ref={askRef} aria-label="Find your plan">
            {QUESTIONS.map((q, i) => (
              <div key={q.id} className={`zps-q${answers[q.id] !== undefined ? " zps-done" : ""}`}>
                <p>
                  <span className="zps-num">{i + 1}</span>
                  {q.text}
                  <small>{q.hint}</small>
                </p>
                <div className="zps-seg">
                  <button type="button" aria-pressed={answers[q.id] === 1} onClick={() => answer(q.id, 1)}>Yes</button>
                  <button type="button" aria-pressed={answers[q.id] === 0} onClick={() => answer(q.id, 0)}>{q.no}</button>
                </div>
              </div>
            ))}
            <div className={`zps-out${done ? " zps-go" : ""}`} aria-live="polite">
              <span className="zps-l">Your plan</span>
              <b>{outName}</b>
              <span className="zps-s">{outText}</span>
              {done && (
                <button className="zps-reset" type="button" onClick={() => setAnswers({})}>Start over</button>
              )}
            </div>
          </section>

          <section
            className={`zps-mx zps-rv${mxIn}${done ? " zps-picked" : ""}`}
            ref={mxRef}
            aria-label="Plans by pipeline coverage"
          >
            <div className="zps-hd">
              <span />
              {COLUMNS.map((c) => (
                <span key={c.label} className={colClass(c.q)}>{c.label}</span>
              ))}
              <span />
            </div>
            {PLANS.map((p, r) => (
              <div
                key={p.key}
                ref={(el) => { rowRefs.current[p.key] = el; }}
                className={`zps-row${p.flag ? " zps-feat" : ""}${plan === p.key ? " zps-pick" : ""}`}
              >
                <div className="zps-pn">
                  <span className="zps-rec">Recommended for you</span>
                  <h3>{p.name}{p.flag && <span className="zps-flag">{p.flag}</span>}</h3>
                  <p>{p.desc}</p>
                  <span className="zps-req">{p.req}</span>
                </div>
                {p.cells.map(([text, on, s, e], i) => (
                  <div
                    key={COLUMNS[i].label}
                    className={`zps-cell ${on ? "zps-on" : "zps-off"}${s ? " zps-s" : ""}${e ? " zps-e" : ""}`}
                    style={{ "--i": i, "--r": r }}
                  >
                    <b>{text}<em>{COLUMNS[i].label}</em></b>
                  </div>
                ))}
                <div className="zps-pr">
                  <b>{p.price}</b>
                  <small>per month</small>
                  <br />
                  <Link className="zps-btn" to="/contact">Start →</Link>
                </div>
              </div>
            ))}
          </section>

          <section className={`zps-every zps-rv${everyIn}`} ref={everyRef}>
            <h3>
              Included in every plan
              <small>Credits and minutes are pooled across your active hiring requirements.</small>
            </h3>
            <ul>
              {INCLUDED.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className={`zps-close zps-rv${closeIn}`} ref={closeRef}>
            <div>
              <h3>Not sure which plan fits?</h3>
              <p>Talk to us for guidance, tailored configurations, and a plan built around your hiring needs</p>
            </div>
            <div className="zps-acts">
              <Link className="zps-p" to="/contact">Book a demo</Link>
              <Link className="zps-o" to="/zeprecruit">Talk to Us</Link>
            </div>
          </section>
        </div>
      </main>
    </Fragment>
  );
};

export default ZeusPricing;
