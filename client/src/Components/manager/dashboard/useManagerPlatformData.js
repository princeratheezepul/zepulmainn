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

/* ---- Pipeline derivation -------------------------------------------------
 * The automated workflow is recorded across several resume fields rather than a
 * single stage column, so each stage is derived from the evidence it leaves
 * behind: an ATS score, a finished coding test, an evaluated interview, a
 * transcript score, and finally a status that means the client has it.
 */

export const hasCvStrength = (r) => r?.ats_score != null;

export const hasCodingTest = (r) => ['completed', 'evaluated'].includes(r?.oa?.status);

export const hasAiInterview = (r) =>
  Boolean(r?.interviewEvaluation?.evaluatedAt || r?.interviewEvaluation?.evaluationResults?.length);

export const hasScorecard = (r) => Number(r?.score || r?.totalscore || 0) > 0;

export const atClientReview = (r) => ['shortlisted', 'offered', 'hired'].includes(r?.status);

export const pipelineStages = (resumes) => [
  { label: 'Resumes', value: resumes.length },
  { label: 'CV Strength', value: resumes.filter(hasCvStrength).length },
  { label: 'Coding Test', value: resumes.filter(hasCodingTest).length },
  { label: 'AI Interview', value: resumes.filter(hasAiInterview).length },
  { label: 'Scorecards', value: resumes.filter(hasScorecard).length },
  { label: 'Client Review', value: resumes.filter(atClientReview).length },
];

const STATUS_TONE = {
  hired: 'green',
  offered: 'green',
  shortlisted: 'green',
  rejected: 'red',
  screening: 'amber',
  scheduled: 'amber',
  submitted: 'grey',
  applied: 'grey',
};

export const statusTone = (status) => STATUS_TONE[status] || 'grey';
