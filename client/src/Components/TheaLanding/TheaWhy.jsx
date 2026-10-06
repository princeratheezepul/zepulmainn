import React, { useState } from "react";

const QUESTIONS = [
  {
    q: "Which roles fit me?",
    a: <>Thea matches you with jobs and internships worldwide, <b>chosen for your skills and goals</b>, not keywords.</>,
  },
  {
    q: "Am I ready for this one?",
    a: <>For any role, Thea shows <b>where you are strong and where you fall short</b>, before an employer does.</>,
  },
  {
    q: "What should I prepare?",
    a: <>Your prep document <b>pinpoints the gaps and the topics to focus on</b>, so preparation is never guesswork.</>,
  },
];

// On phones the three questions become an accordion (only one open at a time);
// on wider screens every answer is always shown, so taps do nothing.
const isMobile = () => window.matchMedia && window.matchMedia("(max-width: 600px)").matches;

const TheaWhy = () => {
  const [open, setOpen] = useState(0);

  const toggle = (i) => {
    if (!isMobile()) return;
    setOpen((cur) => (cur === i ? -1 : i));
  };

  return (
    <section className="th-why" id="th-why">
      <div className="th-wrap">
        <span className="th-eyebrow">
          Why Thea<span className="th-sep"> · </span><span className="th-dpp">Discover, prepare, progress</span>
        </span>
        <h2>More than a job board. <em>A partner for every move.</em></h2>
        <div className="th-q3">
          {QUESTIONS.map((item, i) => (
            <div key={item.q} className={open === i ? "th-open" : ""}>
              <p
                className="th-q"
                role="button"
                tabIndex={0}
                aria-expanded={open === i}
                onClick={() => toggle(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(i);
                  }
                }}
              >
                {item.q}
              </p>
              <p className="th-a">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TheaWhy;
