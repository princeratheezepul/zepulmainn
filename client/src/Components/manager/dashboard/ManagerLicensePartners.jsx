import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Card,
  PageHead,
  Section,
  MetricGrid,
  TableCard,
  StatusPill,
  LoadingRow,
  GhostButton,
  PrimaryButton,
} from '../../dashboard/DashboardUI';
import { API, readAuth, relativeTime } from '../../dashboard/dashboardUtils';

/**
 * License Partners: organisations that run their own hiring on Zepul, with
 * their own jobs and recruiters kept apart from Zepul's. This is where they are
 * created; each one gets a set-password email and then signs in through the
 * normal manager login.
 *
 * Only offered to the managers allowed to create them; the endpoints enforce
 * the same thing.
 */
const EMPTY_FORM = { fullname: '', email: '', phone: '' };

const inputClass =
  'w-full px-3 py-[9px] border border-[#e7ebf2] rounded-lg bg-[#f8f9fb] text-xs outline-none focus:border-[#c7d5ff]';

const ManagerLicensePartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { token } = readAuth();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/manager/license-partners`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not load License Partners');
      setPartners(Array.isArray(data.partners) ? data.partners : []);
    } catch (err) {
      setError(err.message);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullname.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      const { token } = readAuth();
      const res = await fetch(`${API}/api/manager/license-partners`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not create the License Partner');
      toast.success(data.message || 'License Partner created');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const sum = (field) => partners.reduce((n, p) => n + (p[field] || 0), 0);
  const activeCount = partners.filter((p) => p.status === 'active').length;

  return (
    <>
      <PageHead
        eyebrow="Partners"
        title="License Partners"
        sub="Organisations running their own jobs and recruiters on Zepul, separate from Zepul's"
        action={
          <div className="flex gap-2">
            <GhostButton onClick={load}>Refresh</GhostButton>
            <PrimaryButton onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cancel' : '+ Add License Partner'}
            </PrimaryButton>
          </div>
        }
      />

      {showForm && (
        <Card className="p-[17px] mb-5">
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
            <label className="text-xs text-[#778092]">
              Full name
              <input
                className={`${inputClass} mt-1`}
                value={form.fullname}
                onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                required
              />
            </label>
            <label className="text-xs text-[#778092]">
              Email
              <input
                type="email"
                className={`${inputClass} mt-1`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="text-xs text-[#778092]">
              Phone (optional)
              <input
                className={`${inputClass} mt-1`}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <div className="md:col-span-3 flex items-center justify-between gap-3">
              <span className="text-xs text-[#778092]">
                They will get an email with a link to set their password.
              </span>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? 'Creating…' : 'Create License Partner'}
              </PrimaryButton>
            </div>
          </form>
        </Card>
      )}

      {error ? (
        <Card className="p-[17px] text-xs text-[#d84c4c]">{error}</Card>
      ) : loading ? (
        <LoadingRow label="Loading License Partners…" />
      ) : (
        <>
          <MetricGrid
            items={[
              { label: 'License Partners', value: partners.length, delta: `${activeCount} active` },
              { label: 'Their Jobs', value: sum('jobs') },
              { label: 'Their Recruiters', value: sum('recruiters') },
            ]}
          />

          <Section>All License Partners</Section>
          <TableCard
            title={`License Partners (${partners.length})`}
            columns={['Partner', 'Email', 'Jobs', 'Recruiters', 'Created', 'Status']}
            rows={partners.map((p) => [
              <b key="n">{p.fullname}</b>,
              p.email || '—',
              p.jobs,
              p.recruiters,
              p.createdAt ? relativeTime(p.createdAt) : '—',
              <StatusPill key="st" tone={p.status === 'active' ? 'green' : 'grey'}>
                {p.status === 'active' ? 'Active' : p.firstPassSet ? 'Disabled' : 'Invite sent'}
              </StatusPill>,
            ])}
            empty="No License Partners yet."
          />
        </>
      )}
    </>
  );
};

export default ManagerLicensePartners;
