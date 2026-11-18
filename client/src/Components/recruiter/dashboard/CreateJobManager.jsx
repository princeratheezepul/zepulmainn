import React, { useState } from 'react';
import toast from 'react-hot-toast';
import EditJobFields from '../../manager/dashboard/EditJobFields';
import { jobToEditForm, editFormToPayload, validateEditForm } from '../../../utils/jobEditForm';

// The manual "create job" form. It asks for everything the Zeus chat intake
// captures (the same fields as Edit job), so a job created by hand is as
// complete as one briefed by chat or voice.
//
// `onBack` cancels out of the form; `onCreated` (optional) runs instead of
// `onBack` once a job is actually created, so callers can route the two
// outcomes differently. Falls back to `onBack` when not supplied.
// `initialValues` (optional) seeds the fields — used by the Upload JD flow to
// drop the parsed posting in for review before it is created.
// `extraPayload` is merged into the create request — the marketplace uses it to
// publish the job to ProRecruiters in the same call that creates it.
export default function CreateJobManager({ onBack, onCreated, initialValues, extraPayload }) {
  const [form, setForm] = useState(() => {
    const seed = initialValues || {};
    return {
      ...jobToEditForm(seed),
      company: seed.company ? String(seed.company) : '',
      // A new job has no saved priority; default to Medium rather than High.
      priority: Array.isArray(seed.priority) && seed.priority.length ? seed.priority[0] : (typeof seed.priority === 'string' && seed.priority) || 'Medium',
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const problems = () => {
    const errors = [];
    if (!form.jobtitle.trim()) errors.push('Job title is required');
    if (!form.type) errors.push('Work model is required');
    if (!form.employmentType) errors.push('Employment type is required');
    const openings = Number(form.openpositions);
    if (!form.openpositions || !Number.isFinite(openings) || openings <= 0) errors.push('Open positions must be at least 1');
    if (form.hiringDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(form.hiringDeadline) <= today) errors.push("Hiring deadline must be after today");
    }
    if (form.codingRequired && !form.codingStack.length) errors.push('Add the coding test languages / stack, or turn the coding test off');
    return [...errors, ...validateEditForm(form).filter((e) => !errors.includes(e))];
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const errs = problems();
    if (errs.length) { toast.error(errs[0]); return; }

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const token = userInfo?.data?.accessToken;
    const managerId = userInfo?.data?.user?._id;
    if (!token || !managerId) { toast.error('Please sign in again'); return; }

    setIsLoading(true);
    try {
      const payload = {
        ...editFormToPayload(form),
        company: form.company.trim(),
        managerId,
        ...(extraPayload || {}),
      };
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/create-job`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Failed to create job');
      toast.success('Job created successfully!');
      (data.warnings || []).forEach((w) => toast(w, { icon: '⚠️' }));
      if (typeof window.refreshJobs === 'function') window.refreshJobs();
      (typeof onCreated === 'function' ? onCreated : onBack)(data?.job);
    } catch (err) {
      toast.error(err.message || 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="flex items-center px-8 pt-8 max-w-4xl w-full mx-auto">
        <button type="button" onClick={onBack} className="mr-4 text-2xl text-gray-500 hover:text-blue-600 font-bold cursor-pointer" aria-label="Back">←</button>
        <div>
          <div className="text-3xl font-bold">Create Job</div>
          <div className="text-sm text-gray-500 mt-1">Fill in the brief Zeus uses to source, screen and interview. Fields marked * are required.</div>
        </div>
      </div>
      <form id="create-job-form" className="px-8 pt-8 pb-4 max-w-4xl w-full mx-auto flex-1" onSubmit={handleCreateJob} noValidate>
        <EditJobFields form={form} setForm={setForm} creating />
      </form>
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <div className="px-8 py-4 max-w-4xl w-full mx-auto flex gap-3">
          <button type="button" onClick={onBack} className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            form="create-job-form"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-lg font-semibold text-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </div>
            ) : (
              'Create job'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
