import React, { useEffect, useRef, useState } from 'react';
import { X, Database, Loader2, CheckCircle2, AlertCircle, Users, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

// Scoring hits OpenAI once per candidate — cap parallel calls so a large ZepDB
// match doesn't fire 50 requests at once.
const CONCURRENCY = 4;

const runWithConcurrency = async (items, worker, limit) => {
  let cursor = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(lanes);
};

const statusStyles = {
  pending: { label: 'Queued', className: 'bg-gray-100 text-gray-500' },
  submitting: { label: 'Submitting', className: 'bg-blue-50 text-blue-600' },
  submitted: { label: 'Submitted', className: 'bg-green-50 text-green-700' },
  existing: { label: 'Already in list', className: 'bg-amber-50 text-amber-700' },
  error: { label: 'Failed', className: 'bg-red-50 text-red-600' },
};

/**
 * One-click bulk submit: searches ZepDB for candidates matching this job and
 * submits every match to the job's candidate list (scorecard + resume record).
 */
export default function ZepDBBulkSubmit({ jobId, jobTitle, onClose, onComplete, onViewCandidates }) {
  const [phase, setPhase] = useState('searching'); // searching | submitting | done | empty | error
  const [candidates, setCandidates] = useState([]);
  const [statuses, setStatuses] = useState({});    // { candidateId: pending|submitting|submitted|existing|error }
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const startedRef = useRef(false);
  const doneCountRef = useRef(0);

  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo?.data?.accessToken;
  };

  const run = async () => {
    setPhase('searching');
    setCandidates([]);
    setStatuses({});
    setErrorMessage('');
    setProgress({ done: 0, total: 0 });
    doneCountRef.current = 0;

    const authHeaders = {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    };

    try {
      // Step 1 — find every ZepDB candidate matching this job (fast, DB only)
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/zepdb/match-job/${jobId}`,
        { method: 'POST', headers: authHeaders }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'ZepDB search failed');

      const found = data.data.candidates || [];
      if (!found.length) {
        setPhase('empty');
        return;
      }

      setCandidates(found);

      // Candidates already submitted to this job are skipped, not re-scored.
      const initialStatuses = {};
      found.forEach(c => { initialStatuses[c.id] = c.existing ? 'existing' : 'pending'; });
      setStatuses(initialStatuses);

      const toSubmit = found.filter(c => !c.existing);
      if (!toSubmit.length) {
        setPhase('done');
        onComplete?.();
        return;
      }

      // Step 2 — submit each remaining candidate to this job
      setPhase('submitting');
      setProgress({ done: 0, total: toSubmit.length });

      await runWithConcurrency(toSubmit, async (candidate) => {
        setStatuses(prev => ({ ...prev, [candidate.id]: 'submitting' }));
        try {
          const r = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/zepdb/score-candidate/${jobId}`,
            {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({ candidateId: candidate.id }),
            }
          );
          const result = await r.json();
          if (!r.ok || !result.success) throw new Error(result.message || 'Submission failed');
          setStatuses(prev => ({ ...prev, [candidate.id]: result.existing ? 'existing' : 'submitted' }));
        } catch (err) {
          console.error('ZepDB bulk submit failed for candidate:', candidate.id, err);
          setStatuses(prev => ({ ...prev, [candidate.id]: 'error' }));
        } finally {
          doneCountRef.current += 1;
          setProgress({ done: doneCountRef.current, total: toSubmit.length });
        }
      }, CONCURRENCY);

      setPhase('done');
      onComplete?.();
    } catch (err) {
      console.error('ZepDB bulk submit error:', err);
      setErrorMessage(err.message || 'Something went wrong');
      setPhase('error');
      toast.error(err.message || 'Failed to submit resumes from ZepDB');
    }
  };

  // Auto-start on open — the whole point is one click, no second confirmation.
  // The ref guard keeps StrictMode's double-mount from submitting twice.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    run();
  }, []);

  const counts = Object.values(statuses).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const busy = phase === 'searching' || phase === 'submitting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Database size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-sm">Upload Resumes from ZepDB</div>
            <div className="text-xs text-gray-400 truncate">
              Submitting matching candidates to {jobTitle}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className={`text-gray-400 hover:text-gray-700 ${busy ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            title={busy ? 'Please wait until submission finishes' : 'Close'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {phase === 'searching' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <div className="text-sm font-medium text-gray-700">Searching ZepDB...</div>
              <div className="text-xs text-gray-400">Finding every candidate that matches this job</div>
            </div>
          )}

          {phase === 'empty' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="text-4xl text-gray-300">🔍</div>
              <div className="text-sm text-gray-600">No matching candidates found in ZepDB.</div>
              <button onClick={run} className="text-blue-600 text-sm underline cursor-pointer">Try again</button>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <div className="text-sm text-gray-700">{errorMessage}</div>
              <button
                onClick={run}
                className="flex items-center gap-2 text-blue-600 text-sm cursor-pointer hover:underline"
              >
                <RotateCw size={14} /> Retry
              </button>
            </div>
          )}

          {(phase === 'submitting' || phase === 'done') && (
            <div className="space-y-4">
              {phase === 'submitting' && (
                <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-xs font-medium text-gray-700">Submitting resumes to this job...</div>
                    <div className="text-xs font-bold text-blue-600">{percent}%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{progress.done} of {progress.total} submitted</div>
                </div>
              )}

              {phase === 'done' && (
                <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <div className="font-semibold">Done — {counts.submitted || 0} resume{(counts.submitted || 0) === 1 ? '' : 's'} submitted</div>
                    <div className="text-xs text-green-700 mt-0.5">
                      {counts.existing ? `${counts.existing} already in the candidate list. ` : ''}
                      {counts.error ? `${counts.error} failed — retry to try them again.` : ''}
                      {!counts.existing && !counts.error ? 'All matching ZepDB candidates were added to this job.' : ''}
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 font-medium">
                {candidates.length} candidate{candidates.length === 1 ? '' : 's'} matched in ZepDB
              </div>

              <div className="space-y-2">
                {candidates.map((c) => {
                  const status = statuses[c.id] || 'pending';
                  const style = statusStyles[status];
                  return (
                    <div key={c.id} className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {c.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{c.name}</div>
                        <div className="text-xs text-gray-400 truncate">{c.role} · {c.experienceYears}y exp</div>
                      </div>
                      {status === 'submitting' ? (
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
                      ) : null}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${style.className}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex justify-end gap-3">
          {phase === 'done' && counts.error > 0 && (
            <button
              onClick={run}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RotateCw size={14} /> Retry failed
            </button>
          )}
          {phase === 'done' && onViewCandidates && (
            <button
              onClick={onViewCandidates}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Users size={16} /> View Candidate List
            </button>
          )}
          <button
            onClick={onClose}
            disabled={busy}
            className={`text-sm font-semibold px-5 py-2 rounded-lg transition-colors ${
              busy
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
