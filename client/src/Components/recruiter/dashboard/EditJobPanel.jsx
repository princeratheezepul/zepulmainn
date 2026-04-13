import React, { useState } from 'react';
import toast from 'react-hot-toast';

const EditJobPanel = ({ job, onBack, onJobUpdated }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    jobtitle: job.jobtitle || '',
    description: job.description || '',
    location: job.location || '',
    salary: job.salary || '',
    openpositions: job.openpositions || '',
    experience: job.experience || '',
    employmentType: job.employmentType || '',
    hiringDeadline: job.hiringDeadline ? job.hiringDeadline.split('T')[0] : '',
    keyResponsibilities: job.keyResponsibilities || '',
    preferredQualifications: job.preferredQualifications || '',
    internalNotes: job.internalNotes || '',
    skills: job.skills || [],
    priority: job.priority && job.priority.length > 0 ? job.priority[0] : 'High',
  });
  const [newSkill, setNewSkill] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.data?.accessToken;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.jobtitle.trim()) {
      toast.error('Job title is required');
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
          body: JSON.stringify({
            jobtitle: form.jobtitle,
            description: form.description,
            location: form.location,
            salary: form.salary,
            openpositions: form.openpositions,
            experience: form.experience,
            employmentType: form.employmentType,
            hiringDeadline: form.hiringDeadline || null,
            keyResponsibilities: form.keyResponsibilities,
            preferredQualifications: form.preferredQualifications,
            internalNotes: form.internalNotes,
            skills: form.skills,
            priority: [form.priority],
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update job');
      toast.success('Job updated successfully');
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

      <form onSubmit={handleSave} className="space-y-5 flex-1 overflow-y-auto pb-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
          <input
            name="jobtitle"
            value={form.jobtitle}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        {/* Location & Employment Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. London, UK"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <select
              name="employmentType"
              value={form.employmentType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
        </div>

        {/* Salary & Open Positions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. £60,000 - £80,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Open Positions</label>
            <input
              name="openpositions"
              value={form.openpositions}
              onChange={handleChange}
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 3"
            />
          </div>
        </div>

        {/* Experience & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 3+ years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Hiring Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Deadline</label>
          <input
            name="hiringDeadline"
            value={form.hiringDeadline}
            onChange={handleChange}
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Job description..."
          />
        </div>

        {/* Key Responsibilities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities</label>
          <textarea
            name="keyResponsibilities"
            value={form.keyResponsibilities}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="List key responsibilities..."
          />
        </div>

        {/* Preferred Qualifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Qualifications</label>
          <textarea
            name="preferredQualifications"
            value={form.preferredQualifications}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Preferred qualifications..."
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Skills / Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
              >
                {skill}
                <button
                  type="button"
                  className="ml-1 text-blue-400 hover:text-red-500 cursor-pointer text-xs leading-none"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-300 cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
          <textarea
            name="internalNotes"
            value={form.internalNotes}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Internal notes visible only to your team..."
          />
        </div>

        {/* Save Button */}
        <div className="pt-2">
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
