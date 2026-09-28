import React, { useEffect, useState } from 'react';
import { Card, StatusPill, LoadingRow, GhostButton } from '../../dashboard/DashboardUI';
import { API, readAuth, relativeTime, initialsOf } from '../../dashboard/dashboardUtils';

/**
 * Which Recruitment Partners have taken a listing off the marketplace.
 *
 * Loaded on demand rather than with the surrounding list, because it names other
 * people's accounts. The endpoint is owner-only, so callers should offer this
 * for listings the signed-in manager published.
 */
const MarketplacePicksDrawer = ({ job, onClose }) => {
  const [picks, setPicks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!job?._id) return undefined;
    let active = true;
    const load = async () => {
      const { token } = readAuth();
      setLoading(true);
      setError('');
      setPicks(null);
      try {
        const res = await fetch(`${API}/api/manager/marketplace/${job._id}/picks`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not load who picked this job');
        if (active) setPicks(Array.isArray(data.picks) ? data.picks : []);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [job?._id]);

  if (!job) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#e7ebf2]">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#024bff] font-extrabold">
              Picked by
            </div>
            <div className="text-base font-extrabold truncate">{job.jobtitle}</div>
            <div className="text-xs text-[#778092] truncate">
              {job.company || 'Zepul'}
              {job.marketplace?.listedAt ? ` · listed ${relativeTime(job.marketplace.listedAt)}` : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-[#778092] hover:text-[#1d2430] cursor-pointer text-lg leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <LoadingRow label="Loading partners…" />
          ) : error ? (
            <Card className="p-[17px] text-xs text-[#d84c4c]">{error}</Card>
          ) : picks && picks.length > 0 ? (
            <div className="space-y-2.5">
              {picks.map((p) => (
                <Card key={p.id} className="p-[13px]">
                  <div className="flex items-start gap-3">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-[#e5ebff] text-[#024bff] grid place-items-center text-[11px] font-extrabold">
                      {initialsOf(p.name, '?')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate">{p.name}</div>
                      {p.email && <div className="text-xs text-[#778092] truncate">{p.email}</div>}
                      <div className="text-[11px] text-[#778092] mt-1">Picked {relativeTime(p.pickedAt)}</div>
                    </div>
                    {p.isProRecruiter && <StatusPill tone="green">Partner</StatusPill>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-[17px] text-xs text-[#778092]">
              No partner has picked this requirement up yet. It stays on the marketplace until you
              remove it.
            </Card>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#e7ebf2]">
          <GhostButton className="w-full" onClick={onClose}>
            Close
          </GhostButton>
        </div>
      </div>
    </>
  );
};

export default MarketplacePicksDrawer;
