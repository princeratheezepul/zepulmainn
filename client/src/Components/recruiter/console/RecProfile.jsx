import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { logoutUser } from '../../../utils/authUtils';
import { THEMES } from '../../manager/dashboard/controlCentreTheme';
import { initials, jobCompany, jobManagerName } from './recruiterModel';

const MONO = { fontFamily: 'var(--rc-mono)' };
const API = import.meta.env.VITE_BACKEND_URL;

// What the backend lets a recruiter do today (see server routes): upload to
// assigned jobs, send the AI interview to their own candidates, read scores.
const PERMS = [
  ['Upload profiles to assigned jobs', true],
  ['Send AI interview links to candidates you uploaded', true],
  ['See CV strength and Zeus verdicts', true],
  ['Create jobs', false],
  ['Shortlist and reveal phone numbers', false],
];

const RecProfile = ({ t, themeName, onTheme, platform }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { get, put } = useApi();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullname: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    let live = true;
    get(`${API}/api/recruiter/profile`)
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        setProfile(d.recruiter);
        setForm({ fullname: d.recruiter?.fullname || '', phone: d.recruiter?.phone || '' });
      })
      .catch((e) => toast.error(e.message || 'Could not load your profile'));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Company and manager fall back to the assigned jobs when the account does not record them.
  const company = useMemo(
    () => profile?.assignedCompany || platform.jobs.map(jobCompany).find(Boolean) || '',
    [profile, platform.jobs]
  );
  const manager = useMemo(
    () => profile?.manager || platform.jobs.map(jobManagerName).find(Boolean) || '',
    [profile, platform.jobs]
  );

  const save = async () => {
    setSaving(true);
    try {
      // Only these two: the server leaves fields it isn't sent untouched.
      await put(`${API}/api/recruiter/profile`, { fullname: form.fullname.trim(), phone: form.phone.trim() });
      try {
        const info = JSON.parse(localStorage.getItem('userInfo'));
        if (info?.data?.user) {
          info.data.user.fullname = form.fullname.trim();
          localStorage.setItem('userInfo', JSON.stringify(info));
        }
      } catch { /* non-fatal */ }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      toast.error(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (pw.newPassword !== pw.confirm) return toast.error('New passwords do not match');
    if (pw.newPassword === pw.oldPassword) return toast.error('Pick a password different from the current one');
    setPwSaving(true);
    try {
      await put(`${API}/api/recruiter/change-password`, { oldPassword: pw.oldPassword, newPassword: pw.newPassword });
      toast.success('Password updated');
      setPw({ oldPassword: '', newPassword: '', confirm: '' });
      setPwOpen(false);
    } catch (err) {
      toast.error(err.message || 'Could not update the password');
    } finally {
      setPwSaving(false);
    }
  };

  const signOut = async () => {
    try { await logoutUser(navigate, 'recruiter'); } finally { logout(); }
  };

  const panel = { borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, padding: '18px 20px' };
  const input = (ro) => ({ height: 42, padding: '0 12px', borderRadius: 10, border: `1px solid ${t.line}`, background: ro ? 'transparent' : t.panel2, color: ro ? t.muted : t.text, font: 'inherit', fontSize: 14.5, fontWeight: 400, width: '100%' });
  const name = profile?.fullname || form.fullname || '';
  const fields = [
    ['Full name', 'fullname', false],
    ['Work email', null, true, profile?.email || ''],
    ['Phone', 'phone', false],
    ['Company', null, true, company || '—'],
  ];

  return (
    <main className="rc-main">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
        <span style={{ width: 72, height: 72, borderRadius: '50%', background: '#7C5CFF', color: '#FFFFFF', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials(name)}</span>
        <div style={{ minWidth: 0 }}>
          <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>PROFILE</span>
          <h1 className="rc-title" style={{ marginTop: 6 }}>{name || 'Your profile'}</h1>
          <p style={{ marginTop: 4, fontSize: 14, color: t.muted }}>
            {['Recruiter', company, manager && `reports to ${manager}`].filter(Boolean).join(' · ')}
          </p>
        </div>
        <button type="button" className="rc-btn rc-cta" onClick={signOut} style={{ marginLeft: 'auto', height: 42, padding: '0 16px', borderRadius: 11, border: `1px solid ${t.line}`, background: t.panel, color: t.text, fontSize: 14 }}>Sign out</button>
      </div>

      <div className="rc-profile">
        <section style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <b style={{ fontSize: 16 }}>Your details</b>
          {fields.map(([label, key, ro, value]) => (
            <label key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: t.muted }}>
              {label}
              <input
                type={key === 'phone' ? 'tel' : 'text'}
                value={key ? form[key] : value}
                readOnly={ro}
                onChange={key ? (e) => setForm((f) => ({ ...f, [key]: e.target.value })) : undefined}
                style={input(ro)}
              />
            </label>
          ))}
          <button type="button" className="rc-btn" onClick={save} disabled={saving || !profile} style={{ alignSelf: 'flex-start', height: 40, padding: '0 16px', borderRadius: 10, background: t.accent, color: t.onAccent, fontWeight: 700, fontSize: 14 }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <section style={panel}>
            <b style={{ fontSize: 16 }}>What you can do</b>
            <p style={{ marginTop: 4, fontSize: 13, color: t.muted }}>Set by your manager{manager ? `, ${manager}` : ''}. Ask them to change these.</p>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10 }}>
              {PERMS.map(([l, on]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderTop: `1px solid ${t.line}`, fontSize: 14 }}>
                  <span aria-hidden="true" style={{ width: 20, height: 20, borderRadius: '50%', background: on ? t.okSoft : t.panel2, color: on ? t.ok : t.faint, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on ? '✓' : '–'}</span>
                  <span style={{ color: on ? t.text : t.faint }}>{l}<span className="sr-only">{on ? ' (allowed)' : ' (not allowed)'}</span></span>
                </div>
              ))}
            </div>
          </section>

          <section style={panel}>
            <b style={{ fontSize: 16 }}>Appearance</b>
            <p style={{ marginTop: 4, fontSize: 13, color: t.muted }}>Applies on this browser.</p>
            <div role="radiogroup" aria-label="Theme" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              {Object.entries(THEMES).map(([key, th]) => {
                const on = key === themeName;
                return (
                  <button key={key} type="button" role="radio" aria-checked={on} className="rc-btn" onClick={() => onTheme(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px', borderRadius: 10, border: `1px solid ${on ? t.accent : t.line}`, background: on ? t.accentSoft : 'transparent', color: t.text, fontSize: 13.5, textTransform: 'capitalize' }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: `linear-gradient(135deg, ${th.bg} 50%, ${th.accent} 50%)`, border: `1px solid ${t.line}` }} />
                    {key}
                  </button>
                );
              })}
            </div>
          </section>

          <section style={panel}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <span style={{ flex: 1, minWidth: 200 }}>
                <b style={{ display: 'block', fontSize: 16 }}>Password &amp; sign-in</b>
                <span style={{ fontSize: 13, color: t.muted }}>{profile?.email ? `Signed in as ${profile.email}` : ' '}</span>
              </span>
              <button type="button" className="rc-btn" onClick={() => setPwOpen((o) => !o)} aria-expanded={pwOpen} style={{ height: 38, padding: '0 14px', borderRadius: 10, border: `1px solid ${t.line}`, background: 'transparent', color: t.text, fontSize: 13.5 }}>
                {pwOpen ? 'Cancel' : 'Change password'}
              </button>
            </div>
            {pwOpen && (
              <form onSubmit={changePassword} className="rc-in" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                {[['Current password', 'oldPassword', 'current-password'], ['New password', 'newPassword', 'new-password'], ['Confirm new password', 'confirm', 'new-password']].map(([l, k, ac]) => (
                  <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: t.muted }}>
                    {l}
                    <input type="password" autoComplete={ac} value={pw[k]} onChange={(e) => setPw((p) => ({ ...p, [k]: e.target.value }))} required style={input(false)} />
                  </label>
                ))}
                <button type="submit" className="rc-btn" disabled={pwSaving} style={{ alignSelf: 'flex-start', height: 40, padding: '0 16px', borderRadius: 10, background: t.accent, color: t.onAccent, fontWeight: 700, fontSize: 14 }}>
                  {pwSaving ? 'Updating…' : 'Update password'}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default RecProfile;
