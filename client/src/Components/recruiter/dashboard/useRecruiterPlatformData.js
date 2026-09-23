import { useCallback, useEffect, useState } from 'react';
import { API, readAuth, getJson } from '../../dashboard/dashboardUtils';

export {
  isJobOpen,
  isJobUrgent,
  jobCompanyName,
  relativeTime,
  greeting,
  initialsOf,
  hasCvStrength,
  codingTestSent,
  hasCodingTest,
  hasAiInterview,
  hasScorecard,
  atClientReview,
  sharedOnward,
  isSelected,
  pipelineStages,
  statusTone,
} from '../../dashboard/dashboardUtils';

const EMPTY = {
  jobs: [],
  resumes: [],
  stats: { offersMade: 0, offersAccepted: 0, totalHires: 0 },
};

/**
 * Everything the recruiter console renders, fetched once and shared across
 * sections. Each request resolves independently so one failing endpoint does not
 * blank the dashboard.
 */
export const useRecruiterPlatformData = () => {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { token } = readAuth();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    const [jobs, resumes, stats] = await Promise.all([
      getJson(`${API}/api/recruiter/assigned-jobs`, token).then((r) => r?.jobs).catch(() => null),
      getJson(`${API}/api/resumes/recruiter`, token).then((r) => r?.data || r).catch(() => null),
      getJson(`${API}/api/recruiter/stats`, token).then((r) => r?.stats).catch(() => null),
    ]);

    setData({
      jobs: Array.isArray(jobs) ? jobs : [],
      resumes: Array.isArray(resumes) ? resumes : [],
      stats: stats || EMPTY.stats,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, refresh: load };
};
