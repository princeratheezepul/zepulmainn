import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerNav from './ManagerNav';
import { managerConsole } from './managerConsole';
import { useControlCentreTheme } from './controlCentreTheme';

/**
 * The manager console's top navigation on pages outside the dashboard (job
 * pages, team, settings…). Choosing a section opens it on the dashboard.
 * `active` is the section this page belongs to, highlighted in the bar.
 */
const ManagerConsoleNav = ({ active = null }) => {
  const navigate = useNavigate();
  const [themeName, theme, setThemeName] = useControlCentreTheme();
  const { navItems, consoleBase, roleLabel, managerName } = useMemo(managerConsole, []);
  const [resumes, setResumes] = useState([]);

  // Candidates for the nav search; the dashboard loads these itself.
  useEffect(() => {
    let cancelled = false;
    try {
      const info = JSON.parse(localStorage.getItem('userInfo'));
      const id = info?.data?.user?._id;
      const token = info?.data?.accessToken;
      if (!id || !token) return undefined;
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/manager/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => !cancelled && Array.isArray(d?.resumes) && setResumes(d.resumes))
        .catch(() => {});
    } catch { /* storage blocked */ }
    return () => { cancelled = true; };
  }, []);

  const go = (name) => navigate(name && name !== 'Overview' ? `${consoleBase}/dashboard?tab=${encodeURIComponent(name)}` : `${consoleBase}/dashboard`);

  return (
    <ManagerNav
      t={theme}
      items={navItems.filter((n) => !n.hidden).map((n) => ({ name: n.name, label: n.label }))}
      active={active}
      onSelect={go}
      userName={managerName}
      roleLabel={roleLabel}
      themeName={themeName}
      onTheme={setThemeName}
      resumes={resumes}
      consoleBase={consoleBase}
    />
  );
};

export default ManagerConsoleNav;
