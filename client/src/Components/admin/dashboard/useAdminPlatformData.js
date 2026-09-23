import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_BACKEND_URL;

const readAuth = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo'));
    return { token: info?.data?.accessToken || null, adminId: info?.data?.user?._id || null };
  } catch {
    return { token: null, adminId: null };
  }
};

const getJson = async (url, token) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

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
    const { token, adminId } = readAuth();
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

/** A job is "open" until it is closed or its hiring deadline has passed. */
export const isJobOpen = (job) => {
  if (job?.isClosed) return false;
  if (job?.hiringDeadline && new Date(job.hiringDeadline) < new Date()) return false;
  return true;
};

export const isJobUrgent = (job) =>
  isJobOpen(job) && Array.isArray(job?.priority) && job.priority.includes('High');

export const sumField = (rows, field) =>
  rows.reduce((total, row) => total + (Number(row?.[field]) || 0), 0);

export const formatDelta = (change) => {
  if (!change || !change.count) return '';
  const sign = change.count > 0 ? '+' : '';
  return `${sign}${change.count} (${sign}${change.percentage}%)`;
};

export const jobCompanyName = (job) =>
  job?.company ||
  job?.companyName ||
  job?.companyId?.name ||
  job?.managerId?.fullname ||
  job?.adminId?.fullname ||
  'Zepul';

export const relativeTime = (value) => {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '—';
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(value).toLocaleDateString();
};
