import React, { useEffect, useRef, useState } from "react";

const CHIPS = [
  "Data roles in Dubai, 2 years’ experience",
  "Design internships in London",
  "Move from support into product",
];

const Icon = ({ id, style }) => (
  <svg className="th-ic" style={style}><use href={`#th-i-${id}`} /></svg>
);

const TheaChat = () => {
  const [log, setLog] = useState([
    { who: "t", text: "Hi, I’m Thea. Tell me your skills, the work you want and where you want to be.", fresh: false },
  ]);
  const [value, setValue] = useState("");
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  // Demo only: the live product replaces this canned reply with real matches.
  const send = (text) => {
    const v = text.trim();
    if (!v) {
      inputRef.current?.focus();
      return;
    }
    setLog((l) => [...l, { who: "u", text: v }]);
    setValue("");
    timers.current.push(
      setTimeout(() => {
        setLog((l) => [
          ...l,
          {
            who: "t",
            text: "Got it. I’m searching jobs and internships worldwide for this. (On the live site, Thea’s matches appear here.)",
            fresh: true,
          },
        ]);
      }, 600)
    );
  };

  return (
    <div className="th-chat">
      <div className="th-log" ref={logRef}>
        {log.map((m, i) => (
          <div key={i} className={`th-${m.who}${m.fresh ? " th-new" : ""}`}>{m.text}</div>
        ))}
      </div>
      <div className="th-chips">
        {CHIPS.map((c) => (
          <button type="button" key={c} onClick={() => send(c)}>{c}</button>
        ))}
      </div>
      <form
        className="th-compose"
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type where you want your career to go…"
          aria-label="Message Thea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" aria-label="Send">
          <span className="th-stx">Send</span> <Icon id="send" style={{ width: 16, height: 16 }} />
        </button>
      </form>
    </div>
  );
};

const FileSlot = ({ n, title, hint, accept, file, onFile }) => {
  const [drag, setDrag] = useState(false);
  return (
    <label
      className={`th-slot${file ? " th-ok" : ""}${drag ? " th-drag" : ""}`}
      onDragEnter={() => setDrag(true)}
      onDragOver={() => setDrag(true)}
      onDragLeave={() => setDrag(false)}
      onDrop={() => setDrag(false)}
    >
      <span className="th-n">{n}</span>
      <div>
        <b>{title}</b>
        <span>{file ? file.name : hint}</span>
      </div>
      <Icon id={file ? "check" : "up"} />
      <input type="file" accept={accept} onChange={(e) => onFile(e.target.files[0] || null)} />
    </label>
  );
};

const TheaPrep = () => {
  const [cv, setCv] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [jd, setJd] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const ready = !!cv && (!!jdFile || jd.trim().length > 10);
  let msg = "";
  if (submitted) msg = "On the live site, your prep document is generated here.";
  else if (ready) msg = "Ready. Thea will compare your résumé with this role.";

  const change = (setter) => (v) => {
    setter(v);
    setSubmitted(false);
  };

  return (
    <form
      className="th-prep"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <p className="th-muted">Add your résumé and the job description. Thea shows your fit, your gaps and what to focus on.</p>
      <div className="th-two2">
        <FileSlot n="1" title="Your résumé" hint="PDF or Word" accept=".pdf,.doc,.docx" file={cv} onFile={change(setCv)} />
        <FileSlot n="2" title="Job description" hint="File, or paste below" accept=".pdf,.doc,.docx,.txt" file={jdFile} onFile={change(setJdFile)} />
      </div>
      <p className="th-or">OR PASTE IT</p>
      <textarea
        className="th-jd"
        placeholder="Paste the job description or a job link"
        value={jd}
        onChange={(e) => change(setJd)(e.target.value)}
      />
      <button className="th-btn th-p" type="submit" disabled={!ready}>Generate my prep document →</button>
      <p className="th-msg">{msg}</p>
    </form>
  );
};

const TheaStart = ({ tab, onTab }) => (
  <>
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="th-i-send" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></symbol>
      <symbol id="th-i-chat" viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" /></symbol>
      <symbol id="th-i-doc" viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6M9 18h3" /></symbol>
      <symbol id="th-i-up" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></symbol>
      <symbol id="th-i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" /></symbol>
    </svg>
    <section className="th-start" id="th-start">
      <div className="th-wrap th-c th-r2">
        <span className="th-eyebrow">Start here · free</span>
        <h2>Where do you want <em>your career to go?</em></h2>
        <p className="th-lede">Talk to Thea to find roles that fit, or switch to prepare for one you already have in mind.</p>
        <div className="th-ws">
          <div className="th-sw" role="tablist">
            <button type="button" role="tab" aria-selected={tab === 0} className={tab === 0 ? "th-on" : ""} onClick={() => onTab(0)}>
              <Icon id="chat" />
              <span><b>Talk to Thea</b><small>Find roles that fit you</small></span>
            </button>
            <button type="button" role="tab" aria-selected={tab === 1} className={tab === 1 ? "th-on" : ""} onClick={() => onTab(1)}>
              <Icon id="doc" />
              <span>
                <b><span className="th-dk">Get a prep document</span><span className="th-mb">Prep document</span></b>
                <small>For a role you have in mind</small>
              </span>
            </button>
          </div>
          {/* Both panes stay mounted so switching tabs keeps what was typed. */}
          <div className={`th-pane${tab === 0 ? " th-on" : ""}`}><TheaChat /></div>
          <div className={`th-pane${tab === 1 ? " th-on" : ""}`}><TheaPrep /></div>
        </div>
      </div>
    </section>
  </>
);

export default TheaStart;
