import React, { useMemo, useState } from 'react';
import { initials } from './recruiterModel';

const MONO = { fontFamily: 'var(--rc-mono)' };

const ZepulMark = ({ t }) => (
  <svg width="20" height="28" viewBox="-44 -60 88 120" aria-hidden="true">
    <g fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
      <path d="M-13.5,-13.3 L-37.5,-37 A46,46 0 0,1 37.5,-37 L0,0" stroke={t.text} />
      <path d="M0,0 L-37.5,37 A46,46 0 0,0 37.5,37 L13.5,13.3" stroke={t.accent} />
    </g>
  </svg>
);

/**
 * `items`: [{ key, label, badge? }]. Search looks through the recruiter's own
 * candidates and opens the one picked.
 */
const RecNav = ({ t, items, active, onSelect, userName, resumes = [], onOpenCandidate }) => {
  const [q, setQ] = useState('');

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return resumes
      .filter((r) => [r.name, r.email, r.title].some((v) => String(v || '').toLowerCase().includes(needle)))
      .slice(0, 6);
  }, [q, resumes]);

  const open = (r) => {
    setQ('');
    onOpenCandidate?.(r);
  };

  return (
    <nav aria-label="Main" className="rc-nav" style={{ borderBottom: `1px solid ${t.line}`, background: t.navBg, color: t.text }}>
      <button type="button" className="rc-btn" onClick={() => onSelect('overview')} aria-label="Zepul home" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10, background: 'transparent', color: t.text, padding: 0 }}>
        <ZepulMark t={t} />
        <b style={{ fontSize: 18, letterSpacing: '0.1em' }}>ZEPUL</b>
      </button>
      <span className="rc-hide-sm" style={{ height: 24, padding: '0 10px', marginRight: 14, borderRadius: 12, background: t.roleBg, color: t.role, ...MONO, fontSize: 10.5, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        RECRUITER · ZEUS SCREEN
      </span>

      <div className="rc-nav-items" role="tablist" aria-label="Sections">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button
              key={it.key}
              type="button"
              role="tab"
              aria-selected={on}
              className="rc-btn rc-nav-item"
              onClick={() => onSelect(it.key)}
              style={{ color: on ? t.text : t.muted, background: on ? t.accentSoft : 'transparent', fontWeight: on ? 600 : 400 }}
            >
              {it.label}
              {it.badge ? (
                <span style={{ minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9, background: t.accent, color: t.onAccent, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {it.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <span className="rc-nav-end">
        <span className="rc-search">
          <label className="rc-search-box" style={{ border: `1px solid ${t.line}`, background: t.panel, color: t.faint }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input
              type="search"
              aria-label="Search candidates"
              placeholder="Search candidates"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches[0]) open(matches[0]);
                if (e.key === 'Escape') setQ('');
              }}
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: t.text }}
            />
          </label>
          {q.trim() && (
            <div className="rc-search-pop" style={{ background: t.panel, border: `1px solid ${t.line}` }}>
              {matches.length ? (
                matches.map((r) => (
                  <button key={r._id} type="button" className="rc-btn" onClick={() => open(r)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', color: t.text, borderTop: `1px solid ${t.line}` }}>
                    <b style={{ display: 'block', fontSize: 13.5 }}>{r.name || 'Unnamed candidate'}</b>
                    <span style={{ fontSize: 12, color: t.faint }}>{r.jobId?.jobtitle || r.email || ''}</span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '10px 14px', fontSize: 13, color: t.muted }}>No candidates match.</div>
              )}
            </div>
          )}
        </span>
        <button type="button" className="rc-btn" onClick={() => onSelect('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: t.muted, background: 'transparent', padding: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#7C5CFF', color: '#FFFFFF', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials(userName)}
          </span>
          <span className="rc-hide-sm">{userName}</span>
        </button>
      </span>
    </nav>
  );
};

export default RecNav;
