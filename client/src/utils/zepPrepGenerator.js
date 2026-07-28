import { toast } from "react-hot-toast";

/**
 * ZepPrep PDF generator (candidate-facing interview-prep pack).
 *
 * Mirrors utils/pdfGenerator.js: build a print-optimised HTML document from the
 * structured content the server returns, open it in a new window and call
 * window.print() so the browser's "Save as PDF" produces an A4 document.
 *
 * Input shape (from GET /api/candidate-application/prep/:applicationId):
 *   { meta: { candidateName, role, company, generatedAt, ref },
 *     content: { opportunity, company, roleIntelligence, profile, topicsToRevise,
 *                technicalQuestions, behaviouralQuestions, interviewStrategy,
 *                salary, checklist } }
 */

// --- helpers ---------------------------------------------------------------
const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Bold the "Label:" prefix a bullet often carries (e.g. "Overview: ...").
const labelled = (s) => {
  const str = String(s || "");
  const i = str.indexOf(":");
  if (i > 0 && i <= 42) {
    return `<b>${esc(str.slice(0, i + 1))}</b> ${esc(str.slice(i + 1).trim())}`;
  }
  return esc(str);
};

const arr = (v) => (Array.isArray(v) ? v.filter((x) => x != null && String(x).trim()) : []);

const tickList = (items, cls = "tick") => {
  const li = arr(items).map((x) => `<li>${labelled(x)}</li>`).join("");
  return li ? `<ul class="${cls}">${li}</ul>` : "";
};

const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
};

const sectionHead = (num, title, kicker) => `
  <div class="sec-head">
    <span class="sec-num">${esc(num)}</span>
    <span class="sec-title">${esc(title)}</span>
    ${kicker ? `<span class="sec-kicker">${esc(kicker)}</span>` : ""}
  </div>`;

// --- section renderers -----------------------------------------------------
const renderOpportunity = (o) => {
  const row = (dt, dd, wide) =>
    dd ? `<div${wide ? ' class="wide"' : ""}><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>` : "";
  return `
  <section class="sec">
    ${sectionHead("01", "Opportunity Overview", "The role at a glance")}
    <div class="dl">
      ${row("Company", o.company)}
      ${row("Role", o.role)}
      ${row("Employment type", o.employmentType)}
      ${row("Location", o.location)}
      ${row("Department", o.department)}
      ${row("Reports to", o.reportsTo)}
      ${row("Purpose of the role", o.purpose, true)}
      ${row("Why it matters", o.whyItMatters, true)}
    </div>
  </section>`;
};

const renderCompany = (c) => `
  <section class="sec">
    ${sectionHead("02", "About the Company", "Interview-focused research")}
    <div class="cards">
      <div class="card plain">
        <h4>What they do</h4>
        ${tickList(c.whatTheyDo) || '<p class="body">Research the company before your interview.</p>'}
      </div>
      <div class="card plain">
        <h4>How they think</h4>
        ${tickList(c.howTheyThink) || '<p class="body">Look up their values, leadership and recent news.</p>'}
      </div>
    </div>
    <p class="note-inline">Company notes are AI-generated for interview relevance — verify specifics against the company's own sources.</p>
  </section>`;

const renderRoleIntel = (ri) => `
  <section class="sec break">
    ${sectionHead("03", "Role Intelligence", "Beyond the job description")}
    <div class="cards">
      <div class="card plain">
        <h4>What success looks like</h4>
        ${tickList(ri.successLooksLike)}
        <h4 style="margin-top:7pt;">Daily responsibilities</h4>
        ${tickList(ri.dailyResponsibilities)}
      </div>
      <div class="card plain">
        <h4>Key stakeholders</h4>
        ${tickList(ri.keyStakeholders)}
        <h4 style="margin-top:7pt;">Technologies involved</h4>
        ${tickList(ri.technologies)}
        <h4 style="margin-top:7pt;">Hidden expectations</h4>
        ${tickList(ri.hiddenExpectations)}
      </div>
    </div>
  </section>`;

const renderProfile = (p) => `
  <section class="sec">
    ${sectionHead("04", "Understanding Your Profile", "No scores — signal only")}
    <div class="cards">
      <div class="card good">
        <h4>Your strengths</h4>
        ${tickList(p.strengths)}
      </div>
      <div class="card warn">
        <h4>Areas to strengthen</h4>
        ${tickList(p.areasToStrengthen, "dash")}
      </div>
    </div>
    ${
      arr(p.discussionTopics).length
        ? `<div class="card plain" style="margin-top:9pt;"><h4>Potential discussion topics</h4>${tickList(p.discussionTopics)}</div>`
        : ""
    }
  </section>`;

const PRIO_CLASS = { High: "h", Medium: "m", Low: "l" };
const renderRevise = (topics) => {
  const rows = arr(topics)
    .map(
      (t) => `
      <div class="prow">
        <span class="pill ${PRIO_CLASS[t.priority] || "m"}">${esc(t.priority || "Medium")}</span>
        <div>
          <h5>${esc(t.topic)}</h5>
          ${t.why ? `<div class="why">${esc(t.why)}</div>` : ""}
          ${t.focus ? `<div class="focus"><b>Focus:</b> ${esc(t.focus)}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
  return `
  <section class="sec break">
    ${sectionHead("05", "Topics to Revise", "Ranked by priority")}
    <div class="prio">${rows}</div>
  </section>`;
};

const renderQuestions = (num, title, kicker, questions, angleLabel) => {
  const li = arr(questions)
    .map(
      (q) => `
      <li>${esc(q.question)}
        ${q.why ? `<span class="angle"><b>${esc(angleLabel)}</b> ${esc(q.why)}</span>` : ""}
      </li>`
    )
    .join("");
  return `
  <section class="sec ${num === "07" ? "break" : ""}">
    ${sectionHead(num, title, kicker)}
    <ol class="q">${li}</ol>
  </section>`;
};

const renderStrategy = (s) => `
  <section class="sec">
    ${sectionHead("08", "Interview Strategy", "How to run your side of it")}
    <div class="cards">
      <div class="card plain">
        <h4>Introduce yourself</h4>
        ${s.introduceYourself ? `<p class="body" style="font-size:9pt;">${esc(s.introduceYourself)}</p>` : ""}
        <h4 style="margin-top:6pt;">Projects to discuss</h4>
        ${tickList(s.projectsToDiscuss)}
      </div>
      <div class="card plain">
        <h4>Achievements to highlight</h4>
        ${tickList(s.achievementsToHighlight)}
        <h4 style="margin-top:6pt;">Ask the interviewer</h4>
        ${tickList(s.questionsToAsk)}
      </div>
    </div>
  </section>`;

const renderSalary = (s) => {
  const row = (dt, dd, wide) =>
    dd ? `<div${wide ? ' class="wide"' : ""}><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>` : "";
  return `
  <section class="sec break">
    ${sectionHead("09", "Salary & Market Insights", "Context for the conversation")}
    <div class="dl">
      ${row("Estimated range", s.estimatedRange)}
      ${row("Typical for your experience", s.typicalForExperience)}
      ${row("Demand for the role", s.demand)}
      ${row("Industry outlook", s.outlook)}
      ${row("Career progression", s.careerProgression, true)}
    </div>
    <p class="note-inline">Ranges are indicative market estimates for negotiation context, not an offer.</p>
  </section>`;
};

const renderChecklist = (items) => {
  const cells = arr(items)
    .map(
      (c) =>
        `<div><span class="box"></span><span><b>${esc(c.label)}</b>${c.detail ? ` — ${esc(c.detail)}` : ""}</span></div>`
    )
    .join("");
  return `
  <section class="sec">
    ${sectionHead("10", "Interview Checklist", "Before you join the call")}
    <div class="check">${cells}</div>
  </section>`;
};

// --- document assembly -----------------------------------------------------
// Exported (pure, no DOM) so the output can be rendered/tested outside a browser.
export const buildZepPrepBody = (prep) => {
  const meta = prep.meta || {};
  const c = prep.content || {};
  const footerLabel = [meta.company, meta.role].filter(Boolean).join(" — ");

  return `
  <header class="mast">
    <div>
      <div class="brand">
        <span class="logo">Zep<span>Prep</span></span>
        <span class="tag">Interview Preparation Pack</span>
      </div>
      <h1>${esc(meta.role || "Your Role")}</h1>
      <div class="sub">${esc([meta.company, meta.candidateName ? `prepared for ${meta.candidateName}` : ""].filter(Boolean).join(" · "))}</div>
    </div>
    <div class="right">
      <span class="chip">Generated on apply</span>
      <div class="metabox">
        ${meta.generatedAt ? `Generated ${esc(formatDate(meta.generatedAt))}<br>` : ""}
        ${meta.ref ? `Ref ${esc(meta.ref)}` : ""}
      </div>
    </div>
  </header>

  <div class="lead">
    You applied to this role through Zepul. <b>ZepPrep</b> turns the job description, the company, and your own
    profile into a focused preparation pack — what to research, what to revise, and the questions you are most
    likely to face. Work through it top to bottom.
  </div>

  ${renderOpportunity(c.opportunity || {})}
  ${renderCompany(c.company || {})}
  ${renderRoleIntel(c.roleIntelligence || {})}
  ${renderProfile(c.profile || {})}
  ${renderRevise(c.topicsToRevise)}
  ${renderQuestions("06", "Likely Technical Questions", "Customised to you · not generic", c.technicalQuestions, "why you")}
  ${renderQuestions("07", "Likely Behavioural Questions", "Mapped to the company's values", c.behaviouralQuestions, "angle")}
  ${renderStrategy(c.interviewStrategy || {})}
  ${renderSalary(c.salary || {})}
  ${renderChecklist(c.checklist)}

  <footer class="endnote">
    <span><b>ZepPrep</b> — ${esc(footerLabel) || "Interview Preparation Pack"}</span>
    <span>Prepared for the candidate · Confidential · Generated by Zepul</span>
  </footer>
  `;
};

// ===========================================================================
// Candidate Success Blueprint — the post-evaluation ZepPrep (manager download).
// Reuses the same CSS, helpers and section scaffold as the apply-time pack.
// ===========================================================================
const dlRow = (dt, dd, wide) =>
  dd ? `<div${wide ? ' class="wide"' : ""}><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>` : "";

const renderBpCongrats = (text) => `
  <section class="sec">
    ${sectionHead("01", "Congratulations", "You've completed the evaluation")}
    <div class="lead" style="margin:0;">${esc(text)}</div>
  </section>`;

const renderBpCompany = (ci) => `
  <section class="sec">
    ${sectionHead("02", "Company Intelligence", "Know who you're meeting")}
    <div class="cards">
      <div class="card plain">
        <h4>The company</h4>
        ${tickList(ci.overview) || '<p class="body">Research the company before your interview.</p>'}
      </div>
      <div class="card plain">
        <h4>How they operate</h4>
        ${tickList(ci.operating) || '<p class="body">Look up their leadership, culture and recent news.</p>'}
      </div>
    </div>
  </section>`;

const renderBpRole = (ri) => `
  <section class="sec break">
    ${sectionHead("03", "Role Intelligence", "What the job really involves")}
    <div class="cards">
      <div class="card plain">
        <h4>Team structure</h4>${tickList(ri.teamStructure)}
        <h4 style="margin-top:7pt;">Responsibilities</h4>${tickList(ri.responsibilities)}
        <h4 style="margin-top:7pt;">Success metrics</h4>${tickList(ri.successMetrics)}
      </div>
      <div class="card plain">
        <h4>Technologies</h4>${tickList(ri.technologies)}
        <h4 style="margin-top:7pt;">Stakeholders</h4>${tickList(ri.stakeholders)}
        <h4 style="margin-top:7pt;">Business impact</h4>${tickList(ri.businessImpact)}
      </div>
    </div>
  </section>`;

const renderBpEvaluation = (ev) => `
  <section class="sec">
    ${sectionHead("04", "Your Evaluation Highlights", "Evidence, not scores")}
    <div class="cards">
      <div class="card good"><h4>Key strengths demonstrated</h4>${tickList(ev.strengths)}</div>
      <div class="card plain"><h4>Areas worth revisiting</h4>${tickList(ev.areasToRevisit)}</div>
    </div>
    <p class="note-inline">These are preparation opportunities, not shortcomings — a quick refresh helps you walk in fully prepared.</p>
  </section>`;

const renderBpClientGuidance = (cg) => `
  <section class="sec break">
    ${sectionHead("05", "Client Interview Guidance", "How to steer the conversation")}
    <div class="cards">
      <div class="card plain">
        <h4>What interviewers will explore</h4>${tickList(cg.interviewersExplore)}
        <h4 style="margin-top:7pt;">Topics to prepare</h4>${tickList(cg.topicsToPrepare)}
      </div>
      <div class="card plain">
        <h4>Projects to highlight</h4>${tickList(cg.projectsToHighlight)}
        <h4 style="margin-top:7pt;">Experiences to emphasise</h4>${tickList(cg.experiencesToEmphasise)}
      </div>
    </div>
  </section>`;

const renderBpRefresh = (items) => {
  const rows = arr(items)
    .map(
      (t) => `
      <div class="prow">
        <span class="pill l">Revise</span>
        <div>
          <h5>${esc(t.topic)}</h5>
          ${t.why ? `<div class="why">${esc(t.why)}</div>` : ""}
          ${t.focus ? `<div class="focus"><b>Focus:</b> ${esc(t.focus)}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
  return `
  <section class="sec">
    ${sectionHead("06", "Technical Refresh", "Only what's worth reviewing")}
    <div class="prio">${rows}</div>
  </section>`;
};

// Statement-point section (bullet points, not question/answer pairs).
const renderBpPoints = (num, title, kicker, points, brk) => `
  <section class="sec ${brk ? "break" : ""}">
    ${sectionHead(num, title, kicker)}
    ${tickList(points)}
  </section>`;

const renderBpBehavioural = (beh) => `
  <section class="sec break">
    ${sectionHead("07", "Behavioural Preparation", "Tell your story well")}
    ${beh.approach ? `<div class="lead" style="margin:0 0 8pt;"><b>How to answer:</b> ${esc(beh.approach)}</div>` : ""}
    ${tickList(beh.points)}
  </section>`;

const renderBpCompensation = (comp) => `
  <section class="sec break">
    ${sectionHead("09", "Compensation & Negotiation Guidance", "Go in informed")}
    <div class="dl">
      ${dlRow("Estimated range", comp.estimatedRange, !comp.marketBenchmark)}
      ${dlRow("Market benchmark", comp.marketBenchmark)}
    </div>
    ${
      arr(comp.offerEvaluationTips).length
        ? `<div class="card plain" style="margin-top:9pt;"><h4>Evaluating the offer</h4>${tickList(comp.offerEvaluationTips)}</div>`
        : ""
    }
    <p class="note-inline">Ranges are indicative market estimates for context, not an offer.</p>
  </section>`;

const renderBpChecklist = (items) => {
  const cells = arr(items)
    .map(
      (c) =>
        `<div><span class="box"></span><span><b>${esc(c.label)}</b>${c.detail ? ` — ${esc(c.detail)}` : ""}</span></div>`
    )
    .join("");
  return `
  <section class="sec">
    ${sectionHead("10", "Client Interview Checklist", "Before you join the call")}
    <div class="check">${cells}</div>
  </section>`;
};

export const buildBlueprintBody = (blueprint) => {
  const meta = blueprint.meta || {};
  const c = blueprint.content || {};
  const footerLabel = [meta.company, meta.role].filter(Boolean).join(" — ");
  const logoSrc = blueprint.logoUrl || "/zepul_trademark.jpg";
  const metaLine = [
    "Post-evaluation",
    meta.generatedAt ? `Generated ${formatDate(meta.generatedAt)}` : "",
    meta.ref ? `Ref ${meta.ref}` : "",
  ].filter(Boolean).join("  ·  ");

  return `
  <div class="bp">
  <img class="pagelogo" src="${esc(logoSrc)}" alt="Zepul" />

  <header class="mast">
    <div>
      <div class="brand">
        <span class="logo">Zep<span>Prep</span></span>
        <span class="tag">Candidate Success Blueprint</span>
      </div>
      <h1>${esc(meta.role || "Your Next Interview")}</h1>
      <div class="sub">${esc([meta.company, meta.candidateName ? `prepared for ${meta.candidateName}` : ""].filter(Boolean).join(" · "))}</div>
      <div class="mmeta">${esc(metaLine)}</div>
    </div>
  </header>

  ${renderBpCongrats(c.congratulations)}
  ${renderBpCompany(c.companyIntelligence || {})}
  ${renderBpRole(c.roleIntelligence || {})}
  ${renderBpEvaluation(c.evaluation || {})}
  ${renderBpClientGuidance(c.clientGuidance || {})}
  ${renderBpRefresh(c.technicalRefresh)}
  ${renderBpBehavioural(c.behavioural || {})}
  ${renderBpPoints("08", "Personalised Practice Focus", "Close to the real thing", c.practicePoints, false)}
  ${renderBpCompensation(c.compensation || {})}
  ${renderBpChecklist(c.checklist)}

  <footer class="endnote">
    <span><b>ZepPrep</b> — ${esc(footerLabel) || "Candidate Success Blueprint"}</span>
    <span>Prepared for the candidate · Confidential · Generated by Zepul</span>
  </footer>
  </div>
  `;
};

export const ZEPPREP_CSS = `
  @page { size: A4; margin: 16mm 15mm 18mm; }
  :root {
    --ground:#fff; --panel:#f7f8fa; --ink:#0c0e16; --ink-soft:#33384a; --muted:#6b7280; --faint:#9aa0b0;
    --rule:#e3e5ee; --rule-soft:#eef0f5; --accent:#024bff; --accent-ink:#0230b8; --tint:#eef2ff;
    --good:#047857; --warn:#b45309; --warn-bg:#fdf1e1; --high:#be123c; --high-bg:#fdeef1;
    --sans:"Helvetica Neue",Helvetica,"Segoe UI",Roboto,Arial,sans-serif;
    --mono:"SF Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  }
  * { margin:0; padding:0; box-sizing:border-box; }
  html { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  body { background:var(--ground); color:var(--ink); font-family:var(--sans); font-size:9.6pt; line-height:1.55; -webkit-font-smoothing:antialiased; }

  .endnote { margin-top:16pt; padding-top:6pt; border-top:0.75pt solid var(--rule); display:flex;
    justify-content:space-between; align-items:center; gap:12pt; flex-wrap:wrap;
    font-family:var(--mono); font-size:6.4pt; letter-spacing:0.04em; color:var(--faint);
    text-transform:uppercase; break-inside:avoid; }
  .endnote b { color:var(--accent-ink); font-weight:600; }

  .mast { display:flex; justify-content:space-between; align-items:flex-start; gap:12pt; padding-bottom:11pt; border-bottom:2pt solid var(--accent); margin-bottom:4pt; }
  .brand { display:flex; align-items:baseline; gap:6pt; }
  .brand .logo { font-size:15pt; font-weight:800; letter-spacing:-0.02em; color:var(--ink); }
  .brand .logo span { color:var(--accent); }
  .brand .tag { font-family:var(--mono); font-size:6.2pt; text-transform:uppercase; letter-spacing:0.16em; color:var(--muted); }
  .mast h1 { font-size:19pt; font-weight:800; letter-spacing:-0.02em; line-height:1.08; margin-top:9pt; }
  .mast .sub { font-size:9.5pt; color:var(--muted); margin-top:3pt; }
  .mast .right { text-align:right; flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:5pt; }
  .chip { font-family:var(--mono); font-size:6pt; letter-spacing:0.12em; text-transform:uppercase; padding:2.5pt 5pt; border-radius:3pt; background:var(--tint); color:var(--accent-ink); font-weight:600; }
  .metabox { font-family:var(--mono); font-size:6.4pt; color:var(--faint); line-height:1.6; text-align:right; }
  /* Fixed brand logo — repeats top-right on every printed page. In paged media a
     fixed element's origin is the content box (negative offsets are unreliable in
     Chrome print), so it sits just inside the top-right; blueprint section kickers
     are hidden to keep that corner clear. */
  .pagelogo { position:fixed; top:2mm; right:0; height:13pt; width:auto; z-index:50; }
  .bp .sec-kicker { display:none; }
  .mmeta { font-family:var(--mono); font-size:6.4pt; letter-spacing:0.06em; text-transform:uppercase; color:var(--faint); margin-top:6pt; }

  .lead { background:var(--panel); border:0.5pt solid var(--rule); border-left:2.5pt solid var(--accent); border-radius:3pt; padding:8pt 11pt; margin:11pt 0 3pt; font-size:9.4pt; color:var(--ink-soft); }
  .lead b { color:var(--ink); }

  .sec { padding-top:15pt; break-inside:avoid; }
  .sec-head { display:flex; align-items:baseline; gap:8pt; padding-bottom:7pt; border-bottom:0.75pt solid var(--rule); margin-bottom:8pt; }
  .sec-num { font-family:var(--mono); font-size:8pt; font-weight:700; color:#fff; background:var(--accent); border-radius:3pt; padding:2pt 5pt; }
  .sec-title { font-size:13pt; font-weight:800; letter-spacing:-0.015em; }
  .sec-kicker { margin-left:auto; font-family:var(--mono); font-size:6pt; text-transform:uppercase; letter-spacing:0.1em; color:var(--faint); align-self:center; }

  p.body { color:var(--ink-soft); margin-bottom:5pt; }

  .dl { display:grid; grid-template-columns:1fr 1fr; border:0.5pt solid var(--rule); border-radius:4pt; overflow:hidden; }
  .dl > div { padding:6.5pt 9pt; border-bottom:0.5pt solid var(--rule-soft); }
  .dl > div:nth-child(odd) { border-right:0.5pt solid var(--rule-soft); }
  .dl dt { font-family:var(--mono); font-size:6pt; text-transform:uppercase; letter-spacing:0.08em; color:var(--muted); margin-bottom:1.5pt; }
  .dl dd { font-size:9.4pt; color:var(--ink); font-weight:500; }
  .dl .wide { grid-column:1 / -1; border-right:none; }

  .cards { display:grid; grid-template-columns:1fr 1fr; gap:9pt; }
  .card { border:0.5pt solid var(--rule); border-radius:4pt; padding:8pt 10pt; background:var(--ground); break-inside:avoid; }
  .card.good { border-top:2pt solid var(--good); }
  .card.warn { border-top:2pt solid var(--warn); }
  .card.plain { border-top:2pt solid var(--accent); }
  .card h4 { font-size:9.5pt; font-weight:700; margin-bottom:5pt; }
  .card.good h4 { color:var(--good); }
  .card.warn h4 { color:var(--warn); }
  .card.plain h4 { color:var(--accent-ink); }

  ul.tick, ul.dash { list-style:none; display:flex; flex-direction:column; gap:3.5pt; }
  ul.tick li, ul.dash li { position:relative; padding-left:12pt; color:var(--ink-soft); font-size:9.1pt; }
  ul.tick li::before { content:""; position:absolute; left:0; top:3.5pt; width:5pt; height:5pt; border-radius:50%; background:currentColor; opacity:0.55; }
  ul.dash li::before { content:"–"; position:absolute; left:2pt; top:0; color:var(--faint); }
  ul.tick li b, ul.dash li b { color:var(--ink); font-weight:600; }

  .prio { display:flex; flex-direction:column; gap:7pt; }
  .prow { display:grid; grid-template-columns:46pt 1fr; gap:10pt; align-items:start; border:0.5pt solid var(--rule); border-radius:4pt; padding:7pt 9pt; break-inside:avoid; }
  .pill { font-family:var(--mono); font-size:6pt; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; text-align:center; padding:2.5pt 0; border-radius:3pt; }
  .pill.h { background:var(--high-bg); color:var(--high); }
  .pill.m { background:var(--warn-bg); color:var(--warn); }
  .pill.l { background:var(--panel); color:var(--muted); }
  .prow h5 { font-size:9.6pt; font-weight:700; margin-bottom:2pt; }
  .prow .why { font-size:8.8pt; color:var(--ink-soft); }
  .prow .focus { font-size:8.8pt; color:var(--muted); margin-top:2pt; }
  .prow .focus b { font-family:var(--mono); font-size:6.2pt; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent-ink); }

  ol.q { list-style:none; counter-reset:q; display:flex; flex-direction:column; gap:5pt; }
  ol.q li { counter-increment:q; position:relative; padding-left:18pt; color:var(--ink-soft); font-size:9.2pt; break-inside:avoid; }
  ol.q li::before { content:"Q" counter(q); position:absolute; left:0; top:0; font-family:var(--mono); font-size:6.6pt; font-weight:700; color:var(--accent); }
  ol.q li .angle { display:block; font-size:8pt; color:var(--muted); margin-top:1pt; }
  ol.q li .angle b { font-family:var(--mono); font-size:6pt; text-transform:uppercase; letter-spacing:0.05em; color:var(--faint); font-weight:600; }

  .check { display:grid; grid-template-columns:1fr 1fr; gap:5pt 14pt; }
  .check div { display:flex; align-items:flex-start; gap:7pt; font-size:9.2pt; color:var(--ink-soft); break-inside:avoid; }
  .box { flex-shrink:0; width:9pt; height:9pt; border:1pt solid var(--faint); border-radius:2pt; margin-top:1.5pt; }
  .check b { color:var(--ink); font-weight:600; }

  .note-inline { font-size:8.4pt; color:var(--muted); font-style:italic; margin-top:6pt; }
  .break { break-before:page; }
`;

// Shared: open a print window with the ZepPrep stylesheet and trigger Save-as-PDF.
const openPrintDocument = (title, bodyHTML) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    toast.error("Please allow pop-ups to download your document.");
    return false;
  }
  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>${esc(title)}</title>
    <meta charset="utf-8" />
    <style>${ZEPPREP_CSS}</style>
  </head>
  <body>
    ${bodyHTML}
    <script>
      window.onload = function () {
        setTimeout(function () {
          window.print();
          setTimeout(function () { window.close(); }, 300);
        }, 400);
      };
    </script>
  </body>
</html>`);
  printWindow.document.close();
  return true;
};

const PRINT_HINT =
  'Print dialog opened — choose "Save as PDF", and uncheck "Headers and footers" for a clean file.';

// Apply-time candidate prep pack.
export const generateZepPrepPDF = async (prep) => {
  try {
    if (!prep || !prep.content) throw new Error("No prep content to render");
    if (openPrintDocument(`ZepPrep - ${prep.meta?.role || "Interview Prep"}`, buildZepPrepBody(prep))) {
      toast.success(PRINT_HINT);
    }
  } catch (err) {
    console.error("ZepPrep PDF error:", err);
    toast.error("Failed to open the prep document. Please try again.");
    throw err;
  }
};

// Post-evaluation Candidate Success Blueprint.
export const generateBlueprintPDF = async (blueprint) => {
  try {
    if (!blueprint || !blueprint.content) throw new Error("No blueprint content to render");
    if (openPrintDocument(`ZepPrep Blueprint - ${blueprint.meta?.role || "Candidate"}`, buildBlueprintBody(blueprint))) {
      toast.success(PRINT_HINT);
    }
  } catch (err) {
    console.error("Blueprint PDF error:", err);
    toast.error("Failed to open the blueprint. Please try again.");
    throw err;
  }
};
