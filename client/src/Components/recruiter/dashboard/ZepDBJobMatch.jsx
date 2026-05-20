import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

const scoreColor = (score) => {
  if (score >= 75) return 'text-green-600 bg-green-50';
  if (score >= 55) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-500 bg-red-50';
};

const recommendationColor = (rec) => {
  if (!rec) return 'bg-gray-100 text-gray-500';
  if (rec === 'Strong Fit') return 'bg-green-100 text-green-700';
  if (rec === 'Good Fit') return 'bg-blue-100 text-blue-700';
  if (rec === 'Moderate Fit') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-600';
};

export default function ZepDBJobMatch({ jobId, jobTitle, onBack }) {
  const [phase, setPhase] = useState('idle'); // idle | searching | scoring | done
  const [candidates, setCandidates] = useState([]);
  const [scores, setScores] = useState({});   // { candidateId: scorecard | 'loading' | 'error' }
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [expanded, setExpanded] = useState(null);
  const completedRef = useRef(0);

  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo?.data?.accessToken;
  };

  const handleSearch = async () => {
    setPhase('searching');
    setCandidates([]);
    setScores({});
    setExpanded(null);
    completedRef.current = 0;

    try {
      // Phase 1: fast DB search — no AI, returns instantly
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/zepdb/match-job/${jobId}`,
        { method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' } }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Search failed');

      const found = data.data.candidates;
      if (!found.length) {
        setCandidates([]);
        setPhase('done');
        return;
      }

      setCandidates(found);

      // Populate existing scores immediately — no AI needed for them
      const initialScores = {};
      found.forEach(c => {
        if (c.existing) initialScores[c.id] = c.existing.scorecard;
      });
      setScores(initialScores);

      const toScore = found.filter(c => !c.existing);
      if (!toScore.length) {
        setPhase('done');
        return;
      }

      // Phase 2: fire all score calls in parallel
      setPhase('scoring');
      completedRef.current = 0;
      setProgress({ done: 0, total: toScore.length });

      // Mark all pending as 'loading'
      setScores(prev => {
        const next = { ...prev };
        toScore.forEach(c => { next[c.id] = 'loading'; });
        return next;
      });

      await Promise.all(
        toScore.map(async (candidate) => {
          try {
            const r = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/zepdb/score-candidate/${jobId}`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidateId: candidate.id })
              }
            );
            const result = await r.json();
            if (!r.ok || !result.success) throw new Error(result.message || 'Scoring failed');
            setScores(prev => ({ ...prev, [candidate.id]: result.scorecard }));
          } catch (err) {
            setScores(prev => ({ ...prev, [candidate.id]: 'error' }));
          } finally {
            completedRef.current += 1;
            setProgress({ done: completedRef.current, total: toScore.length });
          }
        })
      );

      setPhase('done');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      setPhase('idle');
    }
  };

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const allExisting = candidates.length > 0 && candidates.every(c => c.existing);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 8h6M9 16h4" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">ZepDB Match</div>
          <div className="text-xs text-gray-400 truncate">Best candidates for {jobTitle}</div>
        </div>
        {phase === 'done' && (
          <button onClick={handleSearch} className="text-xs text-blue-500 hover:underline cursor-pointer flex-shrink-0">
            Refresh
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">

        {/* IDLE */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">Search ZepDB</div>
              <div className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Auto-find and score best candidates for this role
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Find Best Candidates
            </button>
          </div>
        )}

        {/* SEARCHING (Phase 1 — DB only, fast) */}
        {phase === 'searching' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="text-sm text-gray-700 font-medium">Searching ZepDB...</div>
            <div className="text-xs text-gray-400">Finding best matches for this job</div>
          </div>
        )}

        {/* SCORING (Phase 2 — parallel AI calls) */}
        {phase === 'scoring' && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-medium text-gray-700">Generating scorecards...</div>
                <div className="text-xs font-bold text-blue-600">{percent}%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">{progress.done} of {progress.total} scored</div>
            </div>
            {/* Show candidate stubs while scoring */}
            {candidates.map((c, idx) => (
              <CandidateRow
                key={c.id || idx}
                candidate={c}
                scoreData={scores[c.id]}
                expanded={expanded === idx}
                onToggle={() => setExpanded(expanded === idx ? null : idx)}
              />
            ))}
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
            <div className="text-gray-300 text-4xl">🔍</div>
            <div className="text-sm text-gray-500">No matching candidates found in ZepDB.</div>
            <button onClick={handleSearch} className="text-blue-600 text-sm underline cursor-pointer">Try again</button>
          </div>
        )}

        {phase === 'done' && candidates.length > 0 && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 font-medium mb-1">
              {candidates.length} candidates found
              {allExisting && <span className="ml-1 text-green-600">(loaded from cache)</span>}
            </div>
            {candidates.map((c, idx) => (
              <CandidateRow
                key={c.id || idx}
                candidate={c}
                scoreData={scores[c.id]}
                expanded={expanded === idx}
                onToggle={() => setExpanded(expanded === idx ? null : idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Next button — shown only when done */}
      {phase === 'done' && onBack && (
        <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function CandidateRow({ candidate, scoreData, expanded, onToggle }) {
  const isLoading = scoreData === 'loading';
  const isError = scoreData === 'error';
  const scorecard = (scoreData && scoreData !== 'loading' && scoreData !== 'error') ? scoreData : null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {candidate.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{candidate.name}</div>
          <div className="text-xs text-gray-400 truncate">{candidate.role} · {candidate.experienceYears}y exp</div>
        </div>
        {/* Score badge */}
        {isLoading && (
          <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
        )}
        {isError && <div className="text-xs text-red-400 flex-shrink-0">Failed</div>}
        {scorecard && (
          <div className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${scoreColor(scorecard.overallScore)}`}>
            {scorecard.overallScore}%
          </div>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
          {isLoading && (
            <div className="text-xs text-gray-400 text-center py-2">Generating scorecard...</div>
          )}
          {isError && (
            <div className="text-xs text-red-400 text-center py-2">Scorecard generation failed.</div>
          )}
          {scorecard && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${recommendationColor(scorecard.recommendation)}`}>
                  {scorecard.recommendation}
                </span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  ✓ Saved to candidate list
                </span>
              </div>

              {scorecard.summary && (
                <p className="text-xs text-gray-600 leading-relaxed">{scorecard.summary}</p>
              )}

              {scorecard.aiScorecard && (
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(scorecard.aiScorecard).map(([key, val]) => (
                    <div key={key} className="bg-white border border-gray-100 rounded px-2 py-1.5 text-center">
                      <div className={`text-sm font-bold ${val >= 75 ? 'text-green-600' : val >= 55 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {val}
                      </div>
                      <div className="text-xs text-gray-400 leading-tight">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {scorecard.skillScores?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Skill Match</div>
                  <div className="space-y-1.5">
                    {scorecard.skillScores.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="text-xs text-gray-500 w-24 truncate flex-shrink-0">{s.skill}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${s.score >= 75 ? 'bg-green-500' : s.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                        <div className="text-xs font-medium text-gray-600 w-7 text-right flex-shrink-0">{s.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scorecard.keyStrengths?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Key Strengths</div>
                  <ul className="space-y-0.5">
                    {scorecard.keyStrengths.map((s, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scorecard.potentialConcerns?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">Potential Concerns</div>
                  <ul className="space-y-0.5">
                    {scorecard.potentialConcerns.map((c, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="text-yellow-500 mt-0.5 flex-shrink-0">!</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
