import { useCallback, useEffect, useState } from 'react';

/**
 * Themes for the manager console (control centre). The overview, the sidebar,
 * the top bar and every manager section read the same choice, so switching it
 * in one place re-themes the whole console.
 */
export const THEMES = {
  midnight: { dark: true, bg: '#070B16', glow: 'radial-gradient(1200px 700px at 60% -10%, #14254F 0%, rgba(7,11,22,0) 70%)', panel: '#0D1426', panel2: '#111A31', line: 'rgba(255,255,255,0.08)', lineStrong: 'rgba(255,255,255,0.14)', text: '#E8ECF6', muted: '#97A1B7', faint: '#66718C', accent: '#4F86FF', accentSoft: 'rgba(79,134,255,0.16)', onAccent: '#FFFFFF', ok: '#3DDC97', warn: '#F5B83D', danger: '#FF8A8A', orbA: '#C9E8FF', orbB: '#3B82F6', orbC: '#1E3A8A', track: 'rgba(255,255,255,0.08)', navBg: 'rgba(7,11,22,0.72)', okSoft: 'rgba(61,220,151,0.12)', warnSoft: 'rgba(245,184,61,0.14)', role: '#C4B5FF', roleSoft: 'rgba(124,92,255,0.16)', roleBg: 'rgba(124,92,255,0.18)' },
  daylight: { dark: false, bg: '#F3F5FA', glow: 'radial-gradient(1200px 600px at 60% -10%, #E0E9FF 0%, rgba(243,245,250,0) 70%)', panel: '#FFFFFF', panel2: '#F7F9FD', line: '#E3E8F1', lineStrong: '#D3DAE6', text: '#0B1020', muted: '#545D72', faint: '#8A93A8', accent: '#1D5CFF', accentSoft: 'rgba(29,92,255,0.10)', onAccent: '#FFFFFF', ok: '#0F8A45', warn: '#B45309', danger: '#C53030', orbA: '#DCEBFF', orbB: '#3B82F6', orbC: '#1D4ED8', track: '#E8ECF4', navBg: 'rgba(255,255,255,0.82)', okSoft: '#DCFCE7', warnSoft: '#FEF3C7', role: '#6D28D9', roleSoft: '#F3EEFF', roleBg: '#F3EEFF' },
  iris: { dark: false, bg: '#F4F3FF', glow: 'radial-gradient(1100px 600px at 70% -10%, #E2E0FF 0%, rgba(244,243,255,0) 70%)', panel: '#FFFFFF', panel2: '#F8F7FF', line: '#E6E4F5', lineStrong: '#D6D3EC', text: '#121331', muted: '#555672', faint: '#8D8EA8', accent: '#5B5BF7', accentSoft: 'rgba(91,91,247,0.10)', onAccent: '#FFFFFF', ok: '#4D7A00', warn: '#C2410C', danger: '#C53030', orbA: '#EAF9B8', orbB: '#7C7CFF', orbC: '#3B3BC9', track: '#ECEBF7', navBg: 'rgba(255,255,255,0.82)', okSoft: '#EEF9C9', warnSoft: '#FFEDD5', role: '#5B5BF7', roleSoft: '#EEEDFF', roleBg: '#EEEDFF' },
  mint: { dark: true, bg: '#111417', glow: 'radial-gradient(1100px 600px at 60% -10%, #123B2E 0%, rgba(17,20,23,0) 70%)', panel: '#181C20', panel2: '#1D2227', line: 'rgba(255,255,255,0.08)', lineStrong: 'rgba(255,255,255,0.14)', text: '#EEF2EF', muted: '#A0ABA5', faint: '#6B7871', accent: '#34D399', accentSoft: 'rgba(52,211,153,0.14)', onAccent: '#06281C', ok: '#34D399', warn: '#FBBF24', danger: '#FF8A8A', orbA: '#D1FAE5', orbB: '#34D399', orbC: '#065F46', track: 'rgba(255,255,255,0.08)', navBg: 'rgba(17,20,23,0.72)', okSoft: 'rgba(52,211,153,0.12)', warnSoft: 'rgba(251,191,36,0.14)', role: '#A7F3D0', roleSoft: 'rgba(52,211,153,0.12)', roleBg: 'rgba(52,211,153,0.12)' },
};

export const DEFAULT_THEME = 'midnight';
const STORAGE_KEY = 'zepul.controlCentre.theme';
const CHANGE_EVENT = 'zepul:control-centre-theme';

const readTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEMES[saved] ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

/** `[name, tokens, setName]` — kept in sync across every component using it. */
export const useControlCentreTheme = () => {
  const [name, setNameState] = useState(readTheme);

  useEffect(() => {
    const sync = () => setNameState(readTheme());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setName = useCallback((next) => {
    if (!THEMES[next]) return;
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage blocked */ }
    setNameState(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [name, THEMES[name], setName];
};

/** CSS custom properties consumed by ControlCentreTheme.css. */
export const themeVars = (t) => ({
  '--zcc-bg': t.bg,
  '--zcc-panel': t.panel,
  '--zcc-panel2': t.panel2,
  '--zcc-line': t.line,
  '--zcc-line-strong': t.lineStrong,
  '--zcc-text': t.text,
  '--zcc-muted': t.muted,
  '--zcc-faint': t.faint,
  '--zcc-accent': t.accent,
  '--zcc-accent-soft': t.accentSoft,
  '--zcc-on-accent': t.onAccent,
  '--zcc-ok': t.ok,
  '--zcc-warn': t.warn,
  '--zcc-danger': t.danger,
  '--zcc-track': t.track,
});

/**
 * Props for the element wrapping a themed manager page: the shell class (with
 * `zcc-dark` on dark themes, which turns on the dark remap) and the variables.
 */
export const shellProps = (t, className = '') => ({
  className: `zcc-shell ${t.dark ? 'zcc-dark' : ''} ${className}`.trim(),
  style: { ...themeVars(t), background: t.bg, color: t.text, colorScheme: t.dark ? 'dark' : 'light' },
});

/** Black Zepul logo → white on dark themes, keeping the blue mark blue. */
export const logoFilter = (t) => (t?.dark ? 'invert(1) hue-rotate(180deg)' : 'none');
