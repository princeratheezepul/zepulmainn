import { useCallback, useEffect, useState } from 'react';
import { API, readAuth, getJson } from '../../dashboard/dashboardUtils';

export {
  isJobOpen,
  isJobUrgent,
  sumField,
  jobCompanyName,
  relativeTime,
  greeting,
  initialsOf,
  hasCvStrength,
  hasCodingTest,
  hasAiInterview,
  hasScorecard,
  atClientReview,
  pipelineStages,
  statusTone,
} from '../../dashboard/dashboardUtils';

const EMPTY = {
  jobs: [],
  recruiters: [],
  resumes: [],
  resumeStats: { totalResumes: 0, reviewedResumes: 0, pendingResumes: 0, reviewedPercent: 0, pendingPercent: 0 },
  marketplace: { totalJobs: 0, activeJobs: 0, selectedCandidates: 0, rejectedCandidates: 0 },
  marketplaceJobs: [],
};

/**
 * One pass over everything the manager console renders, shared across sections so
 * switching tabs does not refetch. Each request resolves independently — a single
 * failing endpoint should not blank the whole dashboard.
 */
export const useManagerPlatformData = () => {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { token, userId: managerId } = readAuth();
    if (!token || !managerId) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    const [jobs, recruiters, resumePayload, marketplace, marketplaceJobs] = await Promise.all([
      getJson(`${API}/api/manager/get-jobs/${managerId}`, token).then((r) => r?.jobs).catch(() => null),
      getJson(`${API}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`, token)
        .then((r) => r?.recruiters)
        .catch(() => null),
      getJson(`${API}/api/manager/resumes/manager/${managerId}`, token).catch(() => null),
      getJson(`${API}/api/manager/marketplace-metrics`, token).then((r) => r?.metrics).catch(() => null),
      getJson(`${API}/api/manager/marketplace-jobs`, token)
        .then((r) => r?.jobs || r?.mpJobs || r?.data)
        .catch(() => null),
    ]);

    setData({
      jobs: Array.isArray(jobs) ? jobs : [],
      recruiters: Array.isArray(recruiters) ? recruiters : [],
      resumes: Array.isArray(resumePayload?.resumes) ? resumePayload.resumes : [],
      resumeStats: resumePayload?.data || EMPTY.resumeStats,
      marketplace: marketplace || EMPTY.marketplace,
      marketplaceJobs: Array.isArray(marketplaceJobs) ? marketplaceJobs : [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, refresh: load };
};
