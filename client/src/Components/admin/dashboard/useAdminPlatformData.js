import { useCallback, useEffect, useState } from 'react';
import { API, readAuth, getJson } from '../../dashboard/dashboardUtils';

export {
  isJobOpen,
  isJobUrgent,
  sumField,
  formatDelta,
  jobCompanyName,
  relativeTime,
} from '../../dashboard/dashboardUtils';

const EMPTY = {
  counts: { total: 0, managers: 0, recruiters: 0, accountManagers: 0, changes: {} },
  users: [],
  jobs: [],
  companies: [],
  candidates: [],
};

/**
 * One fetch of every platform-wide dataset the admin console renders, so the
 * eleven sections share a single round-trip instead of refetching per tab.
 */
export const useAdminPlatformData = () => {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { token, userId: adminId } = readAuth();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');

    // Each dataset resolves independently — a single failing endpoint should not
    // blank the whole console.
    const [counts, users, jobs, companies, candidates] = await Promise.all([
      getJson(`${API}/api/admin/user-counts`, token).then((r) => r?.data).catch(() => null),
      getJson(`${API}/api/admin/users?limit=1000`, token).then((r) => r?.data?.users).catch(() => null),
      adminId
        ? getJson(`${API}/api/admin/get-jobs/${adminId}`, token).then((r) => r?.jobs).catch(() => null)
        : Promise.resolve(null),
      getJson(`${API}/api/company/getcompany`, token).then((r) => r?.companies).catch(() => null),
      getJson(`${API}/api/admin/candidates`, token).catch(() => null),
    ]);

    setData({
      counts: counts || EMPTY.counts,
      users: Array.isArray(users) ? users : [],
      jobs: Array.isArray(jobs) ? jobs : [],
      companies: Array.isArray(companies) ? companies : [],
      candidates: Array.isArray(candidates) ? candidates : [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, refresh: load };
};
