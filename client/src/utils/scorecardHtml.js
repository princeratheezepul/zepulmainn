/**
 * scorecardHtml.js
 * -------------------------------------------------------------------------
 * Builds the exact scorecard design used for the admin-generated scorecards,
 * as a self-contained HTML string with INLINE HEX styles (no Tailwind classes).
 *
 * Why inline hex and not JSX/Tailwind: the PDF download captures this node with
 * html2canvas (via react-to-pdf), and html2canvas cannot parse Tailwind v4's
 * oklch() colors. Inline hex renders identically in the browser and in the
 * captured canvas, so the downloaded PDF matches the on-screen card exactly.
 *
 * Two gauges (CV Strength + Interview) for an interview-only scorecard; a third
 * (Coding) plus a Coding Assessment section appear only when includeCoding.
 * -------------------------------------------------------------------------
 */

const esc = (s) =>
  String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const scoreGaugeSVG = (value, color, size = 96, strokeWidth = 8) => {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashoffset = circumference - (v / 100) * circumference;
  return `
    <div style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); display: block;">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="#e5e7eb" stroke-width="${strokeWidth}" fill="none" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}" stroke-linecap="round" />
      </svg>
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
        <span style="color: ${color}; font-size: 24px; font-weight: 700; line-height: 1;">${v}</span>
      </div>
    </div>`;
};

const sectionLabel = (text) => `
  <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">${esc(text)}</div>`;

const gaugeCell = (label, value, color, withRightBorder) => `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:18px 0;${withRightBorder ? 'border-right:1px solid #e5e7eb;' : ''}">
    <div style="font-size:10px;font-weight:600;letter-spacing:0.18em;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">${esc(label)}</div>
    ${scoreGaugeSVG(value, color)}
  </div>`;

export const buildScorecardHTML = (r = {}) => {
  // Coding gauge + Coding Assessment section render ONLY when the coding
  // assessment was included. Driven by the explicit includeCoding flag (with a
  // defensive check that the coding evaluation is actually present); when it is
  // false the top row shows just CV Strength + Interview and no coding section.
  const includeCoding = r.includeCoding === true && !!r.oa && typeof r.oa.evaluation?.score === 'number';

  const cvScore = Math.round(r.overallScore || 0);
  const results = r.interviewEvaluation?.evaluationResults || [];
  const perQ = results.map((x) => Number(x.score) || 0);
  const avg10 = perQ.length ? Math.round((perQ.reduce((a, b) => a + b, 0) / perQ.length) * 10) / 10 : 0;
  const interviewScore = Math.round(r.score || avg10 * 10);
  const codingScore = includeCoding ? Math.round(r.oa.evaluation.score) : 0;

  const initials = (r.name || 'NA').split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const skills = Array.isArray(r.skills) ? r.skills : [];
  const interviewBullets = r.interviewEvaluation?.aiInterviewSummary || [];
  const keyStrengths = r.keyStrength || [];
  const concerns = r.potentialConcern || [];
  const aiSummary = r.aiSummary || {};
  const strongest = [...results].sort((a, b) => (b.score || 0) - (a.score || 0))[0];

  const header = `
    <div style="background: #0a0a0a; color: #ffffff; padding: 20px 32px 18px; position: relative;">
      <div style="position: absolute; top: 20px; right: 32px; color: #ffffff; font-weight: 700; font-size: 18px; letter-spacing: 0.06em; line-height: 1;">ZEPUL<sup style="font-size: 9px; font-weight: 600; margin-left: 1px;">&trade;</sup></div>
      <div style="width: 46px; height: 46px; border-radius: 10px; background: #2563eb; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; margin-bottom: 10px;">${esc(initials)}</div>
      <h1 style="font-size: 25px; font-weight: 700; margin: 0 0 2px 0; color: #fff; line-height: 1.15;">${esc(r.name || 'Candidate')}</h1>
      <p style="font-size: 13px; color: #9ca3af; margin: 0 0 10px 0;">${esc(r.title || '')}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; color: #d1d5db; margin-bottom: 10px;">
        ${r.email ? `<span>&#9993;&nbsp; ${esc(r.email)}</span>` : ''}
        ${r.phone ? `<span>&#9742;&nbsp; ${esc(r.phone)}</span>` : ''}
        ${r.experience ? `<span>&#9720;&nbsp; ${esc(r.experience)}</span>` : ''}
        ${r.location ? `<span>&#9906;&nbsp; ${esc(r.location)}</span>` : ''}
      </div>
      ${skills.length ? `<div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${skills.slice(0, 10).map((s) => `<span style="background:#1f2937;color:#e5e7eb;padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:500;border:1px solid #374151;">${esc(s)}</span>`).join('')}
      </div>` : ''}
    </div>`;

  const scoreRow = `
    <div style="display: grid; grid-template-columns: ${includeCoding ? '1fr 1fr 1fr' : '1fr 1fr'}; border-bottom: 1px solid #e5e7eb;">
      ${gaugeCell('CV Strength', cvScore, '#f59e0b', true)}
      ${includeCoding ? gaugeCell('Coding', codingScore, '#22c55e', true) : ''}
      ${gaugeCell('Interview', interviewScore, '#3b82f6', false)}
    </div>`;

  const strengthsText = keyStrengths.length ? keyStrengths.join(' ') : 'Strong, relevant track record for this role.';
  const concernsText = concerns.length ? concerns.join(' ') : 'Minor areas to validate during the next round.';

  const assessment = `
    <div style="margin-bottom:16px;">
      ${sectionLabel('Assessment')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="background:#f0fdf4;border-left:3px solid #22c55e;border-radius:6px;padding:10px 12px;">
          <div style="font-size:10px;font-weight:600;letter-spacing:0.18em;color:#15803d;text-transform:uppercase;margin-bottom:4px;">Strengths</div>
          <p style="font-size:12px;color:#1f2937;line-height:1.5;margin:0;">${esc(strengthsText)}</p>
        </div>
        <div style="background:#fefce8;border-left:3px solid #eab308;border-radius:6px;padding:10px 12px;">
          <div style="font-size:10px;font-weight:600;letter-spacing:0.18em;color:#a16207;text-transform:uppercase;margin-bottom:4px;">Watch-outs</div>
          <p style="font-size:12px;color:#1f2937;line-height:1.5;margin:0;">${esc(concernsText)}</p>
        </div>
      </div>
    </div>`;

  const summaryEntries = [
    ['Project Experience', aiSummary.projectExperience],
    ['Key Achievements', aiSummary.keyAchievements],
    ['Skill Match', aiSummary.skillMatch],
  ].filter(([, v]) => v);

  const aiResumeSummary = summaryEntries.length ? `
    <div style="margin-bottom:16px;">
      ${sectionLabel('AI Resume Summary')}
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${summaryEntries.map(([t, v]) => `
          <div style="background:#f3f4f6;border-radius:6px;padding:10px 12px;">
            <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:2px;">${esc(t)}</div>
            <p style="font-size:12px;color:#374151;line-height:1.5;margin:0;">${esc(v)}</p>
          </div>`).join('')}
      </div>
    </div>` : '';

  const codingAssessment = includeCoding ? `
    <div style="margin-bottom:16px;">
      ${sectionLabel('Coding Assessment')}
      <div style="background:#f0fdf4;border-radius:6px;padding:12px 14px;display:flex;align-items:center;gap:16px;">
        <div style="font-size:30px;font-weight:700;color:#16a34a;line-height:1;flex-shrink:0;">${codingScore}<span style="font-size:15px;color:#4ade80;">/100</span></div>
        <div style="font-size:12px;color:#1f2937;line-height:1.5;">
          <span style="font-weight:700;">${r.oa.evaluation.pass ? 'Passed' : 'Below bar'}</span>${r.oa.questionCount ? ` &middot; ${r.oa.questionCount} problem(s) assessed` : ''}.
          ${r.oa.evaluation.feedback ? `<div style="margin-top:3px;color:#374151;">${esc(r.oa.evaluation.feedback)}</div>` : ''}
        </div>
      </div>
    </div>` : '';

  const interviewEval = `
    <div style="margin-bottom:16px;">
      ${sectionLabel('AI Interview Evaluation')}
      <div style="background:#eff6ff;border-radius:6px;padding:12px 14px;display:flex;align-items:center;gap:16px;">
        <div style="font-size:30px;font-weight:700;color:#2563eb;line-height:1;flex-shrink:0;">${interviewScore}<span style="font-size:15px;color:#60a5fa;">/100</span></div>
        <div style="font-size:12px;color:#1f2937;line-height:1.5;">
          <span style="font-weight:700;">${avg10}/10 average</span> across ${perQ.length} interview questions.
          ${strongest ? `<div style="margin-top:3px;color:#374151;"><span style="font-weight:600;color:#111827;">Strongest response (${strongest.score}/10):</span> ${esc(strongest.summary || strongest.question)}</div>` : ''}
        </div>
      </div>
    </div>`;

  const interviewSummary = interviewBullets.length ? `
    <div>
      ${sectionLabel('Interview Summary')}
      <ul style="margin:0;padding-left:18px;list-style:disc;">
        ${interviewBullets.map((b) => `<li style="font-size:12px;color:#1f2937;line-height:1.5;margin-bottom:3px;">${esc(b)}</li>`).join('')}
      </ul>
    </div>` : '';

  const footer = `
    <div style="border-top:1px solid #e5e7eb;padding:9px 32px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:10px;color:#6b7280;">Generated by Zepul AI Screening${includeCoding ? '' : ' &middot; Interview-only assessment (no coding round for this role)'}</span>
      <span style="font-size:10px;color:#9ca3af;">${esc(r.appDate || '')}</span>
    </div>`;

  return `
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f2937;">
      ${header}
      ${scoreRow}
      <div style="padding:16px 32px;">
        ${assessment}
        ${aiResumeSummary}
        ${codingAssessment}
        ${interviewEval}
        ${interviewSummary}
      </div>
      ${footer}
    </div>`;
};
