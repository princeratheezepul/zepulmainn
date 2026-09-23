/** Helpers shared by the admin and manager dashboards. */

export const API = import.meta.env.VITE_BACKEND_URL;

export const readAuth = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo'));
    return {
      token: info?.data?.accessToken || null,
      userId: info?.data?.user?._id || null,
      user: info?.data?.user || null,
    };
  } catch {
    return { token: null, userId: null, user: null };
  }
};

export const getJson = async (url, token) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
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

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const initialsOf = (name, fallback = 'Zepul') =>
  (name || fallback)
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
