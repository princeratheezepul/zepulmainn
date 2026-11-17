import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { THEMES } from './controlCentreTheme';
import '../../recruiter/console/RecruiterConsole.css';

const MONO = { fontFamily: '"IBM Plex Mono", ui-monospace, monospace' };

const initials = (name = '') =>
  String(name).split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'Z';

const ZepulMark = ({ t }) => (
  <svg width="20" height="28" viewBox="-44 -60 88 120" aria-hidden="true">
    <g fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
      <path d="M-13.5,-13.3 L-37.5,-37 A46,46 0 0,1 37.5,-37 L0,0" stroke={t.text} />
      <path d="M0,0 L-37.5,37 A46,46 0 0,0 37.5,37 L13.5,13.3" stroke={t.accent} />
    </g>
  </svg>
);

/**
 * Top navigation for the manager console (replaces the sidebar).
 * `items`: [{ name, badge? }]. Search jumps to a section, or opens a
 * candidate's job candidate list.
 */
const ManagerNav = ({ t, items, active, onSelect, userName, roleLabel, themeName, onTheme, resumes = [], consoleBase = '/manager' }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    const sections = items
      .filter((i) => (i.label || i.name).toLowerCase().includes(needle))
      .map((i) => ({ key: `s-${i.name}`, title: i.label || i.name, sub: 'Section', go: () => onSelect(i.name) }));
    const people = resumes
      .filter((r) => [r.name, r.email, r.title].some((v) => String(v || '').toLowerCase().includes(needle)))
      .slice(0, 6)
      .map((r) => {
        const jobId = r.jobId?._id || r.jobId;
        return {
          key: `r-${r._id}`,
          title: r.name || 'Unnamed candidate',
          sub: r.jobId?.jobtitle || r.email || 'Candidate',
          go: () => jobId && navigate(`${consoleBase}/jobs/${jobId}/candidates`),
        };
      });
    return [...sections, ...people].slice(0, 8);
  }, [q, items, resumes, onSelect, navigate, consoleBase]);

  const pick = (r) => {
    setQ('');
    r.go();
  };

  return (
    <nav aria-label="Main" className="rc-nav" style={{ borderBottom: `1px solid ${t.line}`, background: t.navBg, color: t.text, fontFamily: '"DM Sans", "Helvetica Neue", sans-serif' }}>
      <button type="button" className="rc-btn" onClick={() => onSelect('Overview')} aria-label="Zepul home" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 10, background: 'transparent', color: t.text, padding: 0 }}>
        <ZepulMark t={t} />
        <b style={{ fontSize: 18, letterSpacing: '0.1em' }}>ZEPUL</b>
      </button>
      <span className="rc-hide-sm" style={{ height: 24, padding: '0 10px', marginRight: 8, borderRadius: 12, background: t.accentSoft, color: t.accent, ...MONO, fontSize: 10.5, letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        {String(roleLabel || 'Manager').toUpperCase()}
      </span>

      <div className="rc-nav-items" role="tablist" aria-label="Sections" style={{ flex: '1 1 auto', minWidth: 0, overflowX: 'auto' }}>
        {items.map((it) => {
          const on = it.name === active;
          return (
            <button
              key={it.name}
              type="button"
              role="tab"
              aria-selected={on}
              className="rc-btn rc-nav-item"
              onClick={() => onSelect(it.name)}
              style={{ color: on ? t.text : t.muted, background: on ? t.accentSoft : 'transparent', fontWeight: on ? 600 : 400, fontSize: 14 }}
            >
              {it.label || it.name}
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
          <label className="rc-search-box" style={{ border: `1px solid ${t.line}`, background: t.panel, color: t.faint, width: 220 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input
              type="search"
              aria-label="Search sections and candidates"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) pick(results[0]);
                if (e.key === 'Escape') setQ('');
              }}
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: t.text }}
            />
          </label>
          {q.trim() && (
            <div className="rc-search-pop" style={{ background: t.panel, border: `1px solid ${t.line}` }}>
              {results.length ? (
                results.map((r) => (
                  <button key={r.key} type="button" className="rc-btn" onClick={() => pick(r)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', color: t.text, borderTop: `1px solid ${t.line}` }}>
                    <b style={{ display: 'block', fontSize: 13.5 }}>{r.title}</b>
                    <span style={{ fontSize: 12, color: t.faint }}>{r.sub}</span>
                  </button>
                ))
              ) : (
                <div style={{ padding: '10px 14px', fontSize: 13, color: t.muted }}>No matches.</div>
              )}
            </div>
          )}
        </span>

        <span role="radiogroup" aria-label="Console theme" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {Object.entries(THEMES).map(([name, th]) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={themeName === name}
              aria-label={`${name} theme`}
              title={`${name.charAt(0).toUpperCase()}${name.slice(1)} theme`}
              onClick={() => onTheme(name)}
              className="rc-btn"
              style={{ width: 16, height: 16, borderRadius: '50%', padding: 0, background: `linear-gradient(135deg, ${th.bg} 50%, ${th.accent} 50%)`, border: `2px solid ${themeName === name ? t.accent : t.line}` }}
            />
          ))}
        </span>

        <button type="button" className="rc-btn" onClick={() => onSelect('Profile')} title="Profile & settings" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: t.muted, background: 'transparent', padding: 0 }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: t.accent, color: t.onAccent, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {initials(userName)}
          </span>
          <span className="rc-hide-sm" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
        </button>
      </span>
    </nav>
  );
};

export default ManagerNav;
