import React, { useState } from 'react';
import toast from 'react-hot-toast';
import EditJobFields from '../../manager/dashboard/EditJobFields.jsx';
import { jobToEditForm, editFormToPayload, validateEditForm } from '../../../utils/jobEditForm';

const EditJobPanel = ({ job, onBack, onJobUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => jobToEditForm(job));

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.data?.accessToken;

  const handleSave = async (e) => {
    e.preventDefault();
    const problems = validateEditForm(form);
    if (problems.length) {
      toast.error(problems[0]);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/jobs/updatejob/${job._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editFormToPayload(form)),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update job');
      toast.success('Job updated successfully');
      (data.warnings || []).forEach((w) => toast(w, { icon: '⚠️' }));
      if (onJobUpdated) onJobUpdated(data.job);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline mb-2 flex items-center gap-1 cursor-pointer"
        >
          ← Back to Job Details
        </button>
        <div className="text-xs text-blue-600 font-semibold">EDIT JOB</div>
        <div className="text-2xl font-bold text-gray-900">Edit Job Details</div>
      </div>

      <form onSubmit={handleSave} className="flex-1 overflow-y-auto pb-6">
        <EditJobFields form={form} setForm={setForm} />

        {/* Save Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPanel;
