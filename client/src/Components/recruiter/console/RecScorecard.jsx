import React, { useEffect, useState } from 'react';
import ResumeDetailsView from '../dashboard/ResumeDetailsView';

const API = import.meta.env.VITE_BACKEND_URL;

const token = () => {
  try { return JSON.parse(localStorage.getItem('userInfo'))?.data?.accessToken || null; } catch { return null; }
};

const fetchResume = async (id) => {
  const res = await fetch(`${API}/api/resumes/${id}`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error('Could not load this candidate');
  return res.json();
};

/**
 * The candidate scorecard (the same view the per-job candidate list opens),
 * shown inside the recruiter console. Uses the record already loaded for the
 * pipeline when there is one, so it opens instantly; otherwise fetches it.
 */
const RecScorecard = ({ t, id, platform, onBack }) => {
  const known = platform.resumes.find((r) => String(r._id) === String(id)) || null;
  const [resume, setResume] = useState(known);
  const [error, setError] = useState('');

  useEffect(() => {
    if (known) { setResume(known); return; }
    if (platform.loading) return;
    let live = true;
    fetchResume(id)
      .then((r) => live && setResume(r))
      .catch((e) => live && setError(e.message));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, platform.loading, known?._id]);

  const refresh = async (resumeId) => {
    try {
      setResume(await fetchResume(resumeId || id));
      platform.refresh();
    } catch { /* keep what is shown */ }
  };

  if (!resume) {
    return (
      <main className="rc-main">
        <button type="button" className="rc-btn" onClick={onBack} style={{ background: 'transparent', color: t.accent, fontSize: 14, padding: 0 }}>← Back to pipeline</button>
        <p style={{ marginTop: 18, fontSize: 14, color: error ? t.danger : t.muted }}>{error || 'Loading scorecard…'}</p>
      </main>
    );
  }

  return <ResumeDetailsView key={resume._id} resumeData={resume} onBack={onBack} onResumeUpdate={refresh} />;
};

export default RecScorecard;
