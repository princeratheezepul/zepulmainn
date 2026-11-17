import React, { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import ZepDB from '../Components/recruiter/dashboard/ZepDB';
import { useRecruiterPlatformData } from '../Components/recruiter/dashboard/useRecruiterPlatformData';
import { readAuth, isJobOpen } from '../Components/dashboard/dashboardUtils';
import { useControlCentreTheme, shellProps } from '../Components/manager/dashboard/controlCentreTheme';
import '../Components/manager/dashboard/ControlCentreTheme.css';
import '../Components/recruiter/console/RecruiterConsole.css';
import RecNav from '../Components/recruiter/console/RecNav';
import RecOverview from '../Components/recruiter/console/RecOverview';
import RecAssignedJobs from '../Components/recruiter/console/RecAssignedJobs';
import RecPipeline from '../Components/recruiter/console/RecPipeline';
import RecProfile from '../Components/recruiter/console/RecProfile';
import RecScorecard from '../Components/recruiter/console/RecScorecard';
import { canPick } from '../Components/recruiter/console/recruiterModel';

/**
 * Recruiter console. Sections live in the URL (`?tab=` and `?job=`) so a
 * refresh, or coming back from a candidate page, lands where the recruiter was.
 */
const TABS = ['overview', 'jobs', 'pipeline', 'zepdb', 'profile'];

// Other screens navigate here with state.activeComponent using the old tab names.
const LEGACY_TABS = {
  Dashboard: 'overview',
  Jobs: 'jobs',
  'Assigned Jobs': 'jobs',
  Candidates: 'pipeline',
  'Candidate Pipeline': 'pipeline',
  ZepDB: 'zepdb',
  Profile: 'profile',
};

const RecruiterDashboard = () => {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const platform = useRecruiterPlatformData();
  const [themeName, theme, setTheme] = useControlCentreTheme();
  const { user } = readAuth();
  // License Partner recruiters don't get ZepDB, Zepul's own talent pool.
  const hasZepDB = !user?.licensePartnerId;
  const userName = user?.fullname || user?.username || 'Recruiter';

  const requested = params.get('tab');
  const tab = TABS.includes(requested) && (requested !== 'zepdb' || hasZepDB) ? requested : 'overview';
  const jobId = params.get('job') || '';
  const candidateId = params.get('candidate') || '';

  const go = useCallback((next, job) => {
    const p = {};
    if (next && next !== 'overview') p.tab = next;
    if (job) p.job = String(job);
    else if (jobId && (next === 'jobs' || next === 'pipeline')) p.job = jobId;
    setParams(p);
    window.scrollTo({ top: 0 });
  }, [jobId, setParams]);

  const selectJob = useCallback((id) => {
    const p = Object.fromEntries(params.entries());
    p.job = String(id);
    setParams(p, { replace: true });
  }, [params, setParams]);

  // Opening a candidate keeps the tab and job, so Back lands where they were.
  const openCandidate = useCallback((id) => {
    const p = Object.fromEntries(params.entries());
    p.candidate = String(id);
    setParams(p);
    window.scrollTo({ top: 0 });
  }, [params, setParams]);
  // From nav search: land on that candidate's job in the pipeline, scorecard open.
  const openFromSearch = useCallback((r) => {
    const job = r.jobId?._id || r.jobId;
    setParams({ tab: 'pipeline', ...(job ? { job: String(job) } : {}), candidate: String(r._id) });
    window.scrollTo({ top: 0 });
  }, [setParams]);
  const closeCandidate = useCallback(() => {
    const p = Object.fromEntries(params.entries());
    delete p.candidate;
    setParams(p);
  }, [params, setParams]);

  useEffect(() => {
    const legacy = LEGACY_TABS[location.state?.activeComponent];
    if (legacy) go(legacy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const items = useMemo(() => {
    const openJobs = platform.jobs.filter(isJobOpen).length;
    const toPick = platform.resumes.filter(canPick).length;
    return [
      { key: 'overview', label: 'Overview' },
      { key: 'jobs', label: 'Assigned jobs', badge: openJobs || null },
      { key: 'pipeline', label: 'Candidate pipeline', badge: toPick || null },
      ...(hasZepDB ? [{ key: 'zepdb', label: 'ZepDB' }] : []),
      { key: 'profile', label: 'Profile' },
    ];
  }, [platform.jobs, platform.resumes, hasZepDB]);

  const shell = shellProps(theme, 'rc');
  const section = () => {
    if (candidateId) {
      return <RecScorecard t={theme} id={candidateId} platform={platform} onBack={closeCandidate} />;
    }
    switch (tab) {
      case 'jobs':
        return <RecAssignedJobs t={theme} platform={platform} selectedId={jobId} onSelectJob={selectJob} onGo={go} />;
      case 'pipeline':
        return <RecPipeline t={theme} platform={platform} selectedId={jobId} onSelectJob={selectJob} onOpenCandidate={openCandidate} />;
      case 'zepdb':
        return <ZepDB />;
      case 'profile':
        return <RecProfile t={theme} themeName={themeName} onTheme={setTheme} platform={platform} />;
      default:
        return <RecOverview t={theme} platform={platform} userName={userName} onGo={go} />;
    }
  };

  return (
    <div {...shell} style={{ ...shell.style, background: `${theme.glow}, ${theme.bg}` }}>
      <RecNav t={theme} items={items} active={tab} onSelect={(k) => go(k)} userName={userName} resumes={platform.resumes} onOpenCandidate={openFromSearch} />
      {platform.error && !platform.loading && (
        <div role="alert" style={{ maxWidth: 1360, margin: '16px auto 0', padding: '0 24px' }}>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: theme.warnSoft, color: theme.warn, fontSize: 13.5 }}>{platform.error}</div>
        </div>
      )}
      {section()}
    </div>
  );
};

export default RecruiterDashboard;
