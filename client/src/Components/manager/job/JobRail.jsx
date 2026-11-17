import React from 'react';

const MONO = { fontFamily: 'var(--zcc-mono)' };

/**
 * The 11-step hiring progress for one job. `steps` comes from jobProgress();
 * reached steps are clickable through `onStep(n)`.
 */
const JobRail = ({ t, title, steps, current, onStep }) => {
  const done = current - 1;
  const youBg = t.warnSoft;
  return (
    <aside aria-label="Hiring progress" style={{ width: '100%', background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16, padding: 16, color: t.text }}>
      <div style={{ display: 'flex', gap: 10, ...MONO, fontSize: 11, letterSpacing: '0.12em', color: t.faint }}>
        <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{title}</span>
        <span style={{ marginLeft: 'auto', color: t.text, flexShrink: 0 }}>{done} / {steps.length}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: t.track, marginTop: 10, overflow: 'hidden' }}>
        <i style={{ display: 'block', height: '100%', width: `${((done / steps.length) * 100).toFixed(1)}%`, background: t.accent, transition: 'width .6s ease' }} />
      </div>
      <ol style={{ listStyle: 'none', margin: '14px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {steps.map((s, i) => {
          const n = i + 1;
          const isDone = n < current;
          const now = n === current;
          const you = s.who === 'YOU';
          // Every step past the brief opens its page, even before it is reached.
          const clickable = n > 1 && onStep;
          return (
            <li key={s.title}>
              <button
                type="button"
                className="zcc-btn"
                disabled={!clickable}
                onClick={() => clickable && onStep(n)}
                aria-current={now ? 'step' : undefined}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 12, textAlign: 'left',
                  background: now ? t.accentSoft : 'transparent', border: `1px solid ${now ? t.accent : 'transparent'}`,
                  opacity: n > current ? 0.55 : 1, color: t.text, cursor: clickable ? 'pointer' : 'default',
                }}
              >
                <span
                  className={now ? 'zjr-pulse' : ''}
                  style={{
                    flex: 'none', width: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', ...MONO, fontSize: 11,
                    background: isDone ? t.accent : now ? (you ? t.warn : t.accent) : t.track,
                    color: isDone || now ? (now && you ? '#1A1200' : t.onAccent) : t.muted,
                  }}
                >
                  {s.skipped ? '–' : isDone ? '✓' : String(n).padStart(2, '0')}
                </span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <b style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</b>
                  <span style={{ fontSize: 11.5, color: t.muted }}>{s.sub}</span>
                </span>
                <span style={{ ...MONO, fontSize: 10, letterSpacing: '0.08em', padding: '3px 6px', borderRadius: 5, background: you ? youBg : t.track, color: you ? t.warn : t.muted }}>
                  {s.who}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
};

export default JobRail;
