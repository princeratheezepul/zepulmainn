import React, { useMemo } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Code2,
  MessageSquareText, Trophy, TrendingDown, Info, ThumbsUp,
} from 'lucide-react';
import {
  buildHiringDecision, RISK_STYLES, RECOMMENDATION_STYLES,
} from '../../utils/hiringFitAnalysis';

/* ─────────────────────────── small primitives ───────────────────────────── */

const SectionCard = ({ title, icon: Icon, subtitle, children, className = '' }) => (
  <div className={`p-6 border rounded-xl bg-gray-50 ${className}`}>
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={20} className="text-gray-700" />}
      <div className="text-lg font-bold text-black">{title}</div>
    </div>
    {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
    <div className={subtitle ? '' : 'mt-4'}>{children}</div>
  </div>
);

// Labelled progress bar (matches existing scorecard bars).
const ScoreBar = ({ label, value, max = 100, suffix = '%', reason, weight }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-800 font-semibold text-sm flex items-center gap-2">
          {label}
          {weight != null && (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
              Weight {weight}%
            </span>
          )}
        </div>
        <span className="font-bold text-gray-900 text-sm">{value}{suffix}</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {reason && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{reason}</p>}
    </div>
  );
};

const Pill = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

/* ───────────────────── 1. Hiring Fit Analysis ───────────────────────────── */

export const HiringFitAnalysis = ({ decision }) => {
  const { skillFit, risk } = decision;
  const hasAny = skillFit.strongMatches.length || skillFit.missingSkills.length;
  if (!hasAny) return null;

  const risky = RISK_STYLES[risk.level] || RISK_STYLES.Medium;

  return (
    <SectionCard title="Hiring Fit Analysis" icon={ShieldCheck}
      subtitle="Role requirements matched against evidence in the resume">
      {/* Strong Match Areas */}
      {skillFit.strongMatches.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-600" />
            <div className="font-bold text-gray-900 text-sm">Strong Match Areas</div>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 font-semibold">Requirement</th>
                  <th className="px-4 py-2 font-semibold">Evidence Found</th>
                </tr>
              </thead>
              <tbody>
                {skillFit.strongMatches.map((m, i) => (
                  <tr key={m.requirement + i} className="border-t border-gray-200 bg-white">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{m.requirement}</td>
                    <td className="px-4 py-2.5">
                      <Pill className="bg-green-50 text-green-700">{m.evidence}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {skillFit.derivedFromResume && (
            <p className="text-[11px] text-gray-400 mt-2">
              No required-skill list on this job — showing the candidate's top demonstrated skills.
            </p>
          )}
        </div>
      )}

      {/* Missing or Unverified Skills */}
      {skillFit.missingSkills.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={16} className="text-red-500" />
            <div className="font-bold text-gray-900 text-sm">Missing or Unverified Skills</div>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-2 font-semibold">Requirement</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {skillFit.missingSkills.map((m, i) => (
                  <tr key={m.requirement + i} className="border-t border-gray-200 bg-white">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{m.requirement}</td>
                    <td className="px-4 py-2.5">
                      <Pill className="bg-red-50 text-red-600">{m.status}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hiring Risk Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-gray-700" />
          <div className="font-bold text-gray-900 text-sm">Hiring Risk Analysis</div>
        </div>
        <div className={`rounded-lg border ${risky.border} ${risky.bg} p-4`}>
          <Pill className={`${risky.bg} ${risky.text} border ${risky.border} mb-2`}>
            <span className={`w-2 h-2 rounded-full ${risky.dot}`} />
            {risky.label}
          </Pill>
          <p className={`text-sm leading-relaxed ${risky.text}`}>{risk.justification}</p>
        </div>
      </div>
    </SectionCard>
  );
};

/* ───────────────────── 2. Score Breakdown ───────────────────────────────── */

export const ScoreBreakdown = ({ decision }) => {
  const { scoreBreakdown } = decision;
  if (!scoreBreakdown.hasData) return null;

  return (
    <SectionCard title="CV Strength — Score Breakdown" icon={Info}
      subtitle="Every score is explained by its contributing factors">
      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-3xl font-bold text-gray-900">{scoreBreakdown.total}</span>
        <span className="text-gray-500 font-semibold">/ 100</span>
        {scoreBreakdown.headline && (
          <span className="text-xs text-gray-500 ml-2">{scoreBreakdown.headline}</span>
        )}
      </div>
      <div className="space-y-4">
        {scoreBreakdown.components.map((c) => (
          <ScoreBar key={c.key} label={c.label} value={c.score} weight={c.weight} reason={c.reason} />
        ))}
      </div>
    </SectionCard>
  );
};

/* ───────────────────── 3. Coding Assessment ─────────────────────────────── */

export const CodingBreakdown = ({ decision }) => {
  const { coding } = decision;
  if (!coding.hasData) return null;

  return (
    <SectionCard title="Coding Assessment Breakdown" icon={Code2}
      subtitle="Technical competencies assessed and how the candidate performed">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{coding.overall}</span>
          <span className="text-gray-500 font-semibold">/ 100</span>
        </div>
        <Pill className={coding.pass ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}>
          {coding.pass ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
          {coding.pass ? 'Passed' : 'Below bar'}
        </Pill>
        {coding.questionCount > 0 && (
          <span className="text-xs text-gray-500">{coding.assessedLabel} · {coding.questionCount} problem(s)</span>
        )}
      </div>

      {coding.competencies.length > 0 && (
        <div className="mb-5">
          <div className="font-bold text-gray-900 text-sm mb-3">Technical Competency Breakdown</div>
          <div className="space-y-3">
            {coding.competencies.map((c) => (
              <ScoreBar key={c.label} label={c.label} value={c.score} suffix="" max={100} />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {coding.strengths.length > 0 && (
          <div className="rounded-lg bg-green-50 p-3">
            <div className="text-xs font-bold text-green-800 mb-1.5 flex items-center gap-1">
              <ThumbsUp size={13} /> Strengths
            </div>
            <div className="flex flex-wrap gap-1.5">
              {coding.strengths.map((s) => <Pill key={s} className="bg-white text-green-700 border border-green-200">{s}</Pill>)}
            </div>
          </div>
        )}
        {coding.weaknesses.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3">
            <div className="text-xs font-bold text-red-700 mb-1.5 flex items-center gap-1">
              <TrendingDown size={13} /> To Probe
            </div>
            <div className="flex flex-wrap gap-1.5">
              {coding.weaknesses.map((s) => <Pill key={s} className="bg-white text-red-600 border border-red-200">{s}</Pill>)}
            </div>
          </div>
        )}
      </div>

      {(coding.complexityAnalysis || coding.improvementSuggestions || coding.feedback) && (
        <div className="space-y-2 text-sm">
          {coding.feedback && (
            <p className="text-gray-700"><span className="font-semibold text-gray-900">Evaluation: </span>{coding.feedback}</p>
          )}
          {coding.complexityAnalysis && (
            <p className="text-gray-700"><span className="font-semibold text-gray-900">Complexity: </span>{coding.complexityAnalysis}</p>
          )}
          {coding.improvementSuggestions && (
            <p className="text-gray-700"><span className="font-semibold text-gray-900">Improvement: </span>{coding.improvementSuggestions}</p>
          )}
        </div>
      )}
    </SectionCard>
  );
};

/* ───────────────────── 4. Interview Evaluation ──────────────────────────── */

const ResponseCard = ({ variant, title, resp }) => {
  const green = variant === 'strong';
  const wrap = green ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200';
  const head = green ? 'text-green-800' : 'text-amber-800';
  const Icon = green ? Trophy : TrendingDown;
  return (
    <div className={`rounded-lg border ${wrap} p-4`}>
      <div className={`flex items-center justify-between mb-2 ${head}`}>
        <div className="flex items-center gap-1.5 font-bold text-sm"><Icon size={15} /> {title}</div>
        <span className="text-sm font-bold">{resp.score}/10</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">Q: {resp.question}</p>
      {resp.answerSummary && <p className="text-xs text-gray-600 mb-2 italic">"{resp.answerSummary}"</p>}
      <p className="text-sm text-gray-700 leading-relaxed">
        <span className="font-semibold">{green ? 'Why it scored well: ' : 'Why it scored poorly: '}</span>
        {resp.why}
      </p>
    </div>
  );
};

export const InterviewEvaluation = ({ decision }) => {
  const { interview } = decision;
  if (!interview.hasData) return null;

  return (
    <SectionCard title="AI Interview Evaluation" icon={MessageSquareText}
      subtitle="Evidence-based assessment of interview performance">
      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-3xl font-bold text-gray-900">{interview.avgScore10}</span>
        <span className="text-gray-500 font-semibold">/ 10 avg · {interview.count} questions</span>
      </div>

      <div className="mb-6">
        <div className="font-bold text-gray-900 text-sm mb-3">Communication Assessment</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {interview.communication.map((m) => (
            <ScoreBar key={m.metric} label={m.metric} value={m.score} max={10} suffix="/10" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {interview.strongest && <ResponseCard variant="strong" title="Strongest Response" resp={interview.strongest} />}
        {interview.weakest && <ResponseCard variant="weak" title="Weakest Response" resp={interview.weakest} />}
      </div>

      {interview.summaryBullets.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="font-semibold text-gray-800 text-sm mb-2">Interview Summary</div>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {interview.summaryBullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}
    </SectionCard>
  );
};

/* ───────────────────── 5. Final Recommendation ──────────────────────────── */

export const HiringRecommendation = ({ decision }) => {
  const { recommendation } = decision;
  const style = RECOMMENDATION_STYLES[recommendation.recommendation] || RECOMMENDATION_STYLES['Not Recommended'];

  return (
    <div className={`rounded-xl border-2 ${style.border} ${style.bg} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <ThumbsUp size={18} className={style.text} />
        <div className="text-sm font-bold uppercase tracking-wide text-gray-500">Final Hiring Recommendation</div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className={`inline-flex items-center gap-2 text-lg font-bold ${style.text}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          {recommendation.recommendation}
        </span>
        {recommendation.signals.map((s) => (
          <Pill key={s.label} className="bg-white/70 text-gray-700 border border-gray-200">
            {s.label} {s.value}
          </Pill>
        ))}
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">{recommendation.reason}</p>
    </div>
  );
};

/* ─────────────────── convenience: full stacked scorecard ─────────────────── */

/**
 * Drop-in "Hiring Decision Engine" block. Pass the raw resume + job objects;
 * it derives everything and renders only the sections it has data for.
 */
const HiringDecisionScorecard = ({
  resumeData,
  jobDetails = null,
  show = ['recommendation', 'fit', 'score', 'coding', 'interview'],
}) => {
  const decision = useMemo(
    () => buildHiringDecision(resumeData || {}, jobDetails || {}),
    [resumeData, jobDetails]
  );

  return (
    <div className="space-y-6">
      {show.includes('recommendation') && <HiringRecommendation decision={decision} />}
      {show.includes('fit') && <HiringFitAnalysis decision={decision} />}
      {show.includes('score') && <ScoreBreakdown decision={decision} />}
      {show.includes('coding') && <CodingBreakdown decision={decision} />}
      {show.includes('interview') && <InterviewEvaluation decision={decision} />}
    </div>
  );
};

export default HiringDecisionScorecard;
