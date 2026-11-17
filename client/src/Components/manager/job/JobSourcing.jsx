import React, { useMemo } from 'react';
import { codingTestSent, initialsOf } from '../../dashboard/dashboardUtils';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const DAY = 86400000;
// The confirmation link a candidate gets expires after 24 hours (see
// requestRoleConfirmation on the server).
const LINK_TTL = DAY;

const stamp = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const days = (Date.now() - d.getTime()) / DAY;
  if (d.toDateString() === new Date().toDateString()) return `Today ${time}`;
  if (days < 6) return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${time}`;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${time}`;
};

/**
 * Sourcing & outreach for one job: every ZepDB search Zeus ran, and how the
 * candidates it emailed have answered. Searches come from job.sourcingRuns;
 * outreach from each candidate's roleConfirmation.
 */
const JobSourcing = ({ t, job, title, resumes, onBack, onRunSearch, onOpenCandidates, onOpenOutreach, sourcingNow }) => {
  const codingRequired = Boolean(job?.intake?.codingTest?.required);
  const runs = Array.isArray(job?.sourcingRuns) ? job.sourcingRuns : [];
  const bar = job?.cvStrengthCutoff;

  const v = useMemo(() => {
    const now = Date.now();
    const sent = resumes.filter((r) => r?.roleConfirmation?.sentAt);
    const status = (r) => r.roleConfirmation?.status;
    const expired = (r) => status(r) === 'pending' && now - new Date(r.roleConfirmation.sentAt).getTime() > LINK_TTL;
    const interested = sent.filter((r) => status(r) === 'accepted');
    const declined = sent.filter((r) => status(r) === 'declined');
    const lapsed = sent.filter(expired);
    const waiting = sent.filter((r) => status(r) === 'pending' && !expired(r));
    const total = sent.length;
    const w = (n) => (total ? `${((n / total) * 100).toFixed(1)}%` : '0%');
    const split = [
      { l: 'Interested', v: interested.length, c: t.ok },
      { l: 'Not now', v: declined.length, c: t.danger },
      { l: 'Waiting', v: waiting.length, c: t.accent },
      { l: 'Link expired', v: lapsed.length, c: t.dark ? 'rgba(255,255,255,0.18)' : t.lineStrong },
    ].map((x) => ({ ...x, w: w(x.v) }));

    const lastSent = sent.reduce((m, r) => Math.max(m, new Date(r.roleConfirmation.sentAt).getTime() || 0), 0);
    // When the earliest live link runs out.
    const nextExpiry = waiting.reduce((m, r) => {
      const at = new Date(r.roleConfirmation.sentAt).getTime() + LINK_TTL;
      return m == null || at < m ? at : m;
    }, null);

    const replies = [...interested, ...declined]
      .sort((a, b) => (new Date(b.roleConfirmation.respondedAt).getTime() || 0) - (new Date(a.roleConfirmation.respondedAt).getTime() || 0))
      .slice(0, 8)
      .map((r) => {
        const yes = status(r) === 'accepted';
        const cv = r.ats_score != null ? `CV ${Math.round(r.ats_score)}` : null;
        let next;
        // Accepting emails the coding test straight away (confirm.controller.js).
        if (!yes) next = 'Kept for future roles';
        else next = [cv, !codingRequired ? 'ready for the AI interview' : codingTestSent(r) ? 'coding test sent' : 'coding test on its way'].filter(Boolean).join(' · ');
        return { id: r._id, name: r.name || 'Candidate', when: stamp(r.roleConfirmation.respondedAt), yes, next };
      });

    return { total, split, lastSent, nextExpiry, replies, waiting: waiting.length, lapsed: lapsed.length };
  }, [resumes, t, bar, codingRequired]);

  const panel = { background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16 };
  const link = { background: 'transparent', padding: 0, fontSize: 13.5, color: t.accent };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <button type="button" className="zcc-btn" onClick={onBack} style={{ background: 'transparent', padding: 0, fontSize: 13.5, color: t.muted }}>← {title}</button>
          <h1 className="zcc-title" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 700, color: t.text }}>Sourcing &amp; outreach</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14.5, color: t.muted }}>
            Zeus searches ZepDB in batches and adds the strong matches to this job. You choose who to reach out to; replies usually take a day or two.
          </p>
        </div>
      </div>

      {/* Searches */}
      <section style={{ ...panel, padding: '18px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <b style={{ fontSize: 15 }}>Searches</b>
          <span style={{ ...MONO, fontSize: 11, color: t.faint, letterSpacing: '0.08em' }}>ZEPDB</span>
          <button type="button" className="zcc-btn" onClick={onRunSearch} disabled={sourcingNow} style={{ ...link, marginLeft: 'auto', opacity: sourcingNow ? 0.6 : 1 }}>
            ⟲ {sourcingNow ? 'Searching…' : runs.length ? 'Run another search' : 'Run a search'}
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          {!runs.length && (
            <div style={{ padding: '12px 14px', borderRadius: 12, background: t.panel2, fontSize: 13.5, color: t.muted }}>
              No searches recorded for this job yet. Searches run from now on are listed here.
            </div>
          )}
          {runs.map((s, i) => {
            const found = Number(s.found) || 0;
            const pct = (n) => (found ? `${Math.min(100, (n / found) * 100).toFixed(1)}%` : '0%');
            const when = [stamp(s.at), s.auto ? 'started automatically' : null, s.widened ? 'Zeus widened the search' : null].filter(Boolean).join(' · ');
            return (
              <div key={`${s.at}-${i}`} className="zjs-run" style={{ background: t.panel2 }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', ...MONO, fontSize: 12 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.filters}>{s.filters || 'Search'}</b>
                  <span style={{ fontSize: 12, color: t.faint }}>{when}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ flex: 1, height: 8, borderRadius: 4, background: t.track, overflow: 'hidden', display: 'flex' }}>
                    <i style={{ display: 'block', height: '100%', width: pct(s.strong), background: t.accent }} />
                    <i style={{ display: 'block', height: '100%', width: pct(s.partial), background: t.accentSoft }} />
                  </span>
                  <span style={{ ...MONO, fontSize: 12, color: t.muted, whiteSpace: 'nowrap' }}>{found} found</span>
                </span>
                <b style={{ ...MONO, fontWeight: 500, fontSize: 14, textAlign: 'right' }}>{s.strong || 0} strong</b>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 12, fontSize: 12.5, color: t.muted }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: t.accent, display: 'block' }} />Strong match · added to the job</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: t.accentSoft, display: 'block' }} />Partial match · kept in ZepDB</span>
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        {/* Outreach */}
        <section style={{ ...panel, flex: '3 1 420px', minWidth: 0, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <b style={{ fontSize: 15 }}>Outreach</b>
            {onOpenOutreach && (
              <button type="button" className="zcc-btn" onClick={onOpenOutreach} style={{ ...link, fontWeight: 600 }}>Choose who to invite →</button>
            )}
            <span style={{ marginLeft: 'auto', ...MONO, fontSize: 11.5, color: t.muted, textTransform: 'uppercase' }}>
              {v.total} invite{v.total === 1 ? '' : 's'} sent{v.lastSent ? ` · ${stamp(v.lastSent)}` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 16, background: t.track }}>
            {v.split.map((x) => <i key={x.l} style={{ display: 'block', height: '100%', width: x.w, background: x.c }} />)}
          </div>
          <div className="zjs-split">
            {v.split.map((x) => (
              <div key={x.l}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: t.muted }}>
                  <i style={{ width: 9, height: 9, borderRadius: '50%', background: x.c, display: 'block' }} />{x.l}
                </span>
                <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 24, marginTop: 4 }}>{x.v}</b>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, ...MONO, fontSize: 11, letterSpacing: '0.12em', color: t.faint }}>REPLIES SO FAR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {!v.replies.length && (
              <div style={{ padding: '10px 12px', borderRadius: 10, background: t.panel2, fontSize: 13.5, color: t.muted }}>
                {v.total ? 'No replies yet.' : 'No invites sent yet. Choose who to reach out to in Outreach.'}
              </div>
            )}
            {v.replies.map((r) => (
              <button key={r.id} type="button" className="zcc-btn zjs-reply" onClick={onOpenCandidates} style={{ background: t.panel2, color: t.text }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, color: t.accent, fontSize: 11.5, fontWeight: 700 }}>
                  {initialsOf(r.name, '?')}
                </span>
                <span style={{ minWidth: 0, textAlign: 'left' }}><b>{r.name}</b> <span style={{ color: t.faint }}>{r.when ? `· ${r.when}` : ''}</span></span>
                <span style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, background: r.yes ? t.okSoft : t.warnSoft, color: r.yes ? t.ok : t.danger }}>{r.yes ? 'Interested' : 'Not now'}</span>
                <span className="zjs-next" style={{ fontSize: 12, color: t.muted, textAlign: 'right' }}>{r.next}</span>
              </button>
            ))}
          </div>
        </section>

        <aside style={{ flex: '2 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {v.waiting > 0 && (
            <div style={{ padding: 18, borderRadius: 16, background: t.warnSoft, border: `1px solid ${t.warn}55` }}>
              <b style={{ ...MONO, fontSize: 11, letterSpacing: '0.14em', color: t.warn }}>WAITING ON CANDIDATES</b>
              <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.55 }}>
                {v.waiting} {v.waiting === 1 ? "hasn't" : "haven't"} replied yet. Each invite link stays open for 24 hours.
              </p>
              {v.nextExpiry && (
                <div style={{ marginTop: 12, ...MONO, fontSize: 12, color: t.muted }}>Next link expires · {stamp(v.nextExpiry)}</div>
              )}
            </div>
          )}
          {v.lapsed > 0 && (
            <div style={{ padding: 18, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}` }}>
              <b style={{ fontSize: 14 }}>{v.lapsed} invite{v.lapsed === 1 ? '' : 's'} expired</b>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: t.muted }}>
                These candidates didn't answer within 24 hours. Run another search to reach new matches.
              </p>
            </div>
          )}
          <div style={{ padding: 18, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}` }}>
            <b style={{ fontSize: 14 }}>What happens when someone says yes</b>
            <p style={{ margin: '6px 0 0', fontSize: 12.5, color: t.faint }}>
              Only candidates whose <b style={{ color: t.muted }}>CV strength</b> clears {bar != null ? `your bar of ${bar}` : 'the bar'} are added to the job.
            </p>
            <ol style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: t.muted }}>
              <li>They confirm and share a <b style={{ color: t.text }}>phone number</b>.</li>
              {codingRequired
                ? <li>The <b style={{ color: t.text }}>coding test</b> link is emailed automatically.</li>
                : <li>This job has <b style={{ color: t.text }}>no coding test</b>, so they are ready for the interview step.</li>}
              <li>You pick who goes to the <b style={{ color: t.text }}>AI interview</b>{codingRequired ? ' once results are in' : ''}.</li>
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
};

export default JobSourcing;
