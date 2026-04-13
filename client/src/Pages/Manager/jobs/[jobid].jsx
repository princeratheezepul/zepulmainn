import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Users, IndianRupee, CalendarDays, Pencil, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import SavedResumes from '../../../Components/manager/dashboard/SavedResumes';
import toast from 'react-hot-toast';

const   ManagerJobDetailPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const { jobid: jobId } = useParams();
  const [resumeCount, setResumeCount] = useState(0);
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editNewSkill, setEditNewSkill] = useState('');

  const fetchJob = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/jobs/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job data');
      }

      const data = await response.json();
      console.log('Fetched job data:', data.job);
      setJobData(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      jobtitle: jobData?.jobtitle || '',
      description: jobData?.description || '',
      location: jobData?.location || '',
      salary: jobData?.salary || '',
      openpositions: jobData?.openpositions || '',
      experience: jobData?.experience || '',
      employmentType: jobData?.employmentType || '',
      hiringDeadline: jobData?.hiringDeadline ? jobData.hiringDeadline.split('T')[0] : '',
      keyResponsibilities: Array.isArray(jobData?.keyResponsibilities)
        ? jobData.keyResponsibilities.join('\n')
        : (jobData?.keyResponsibilities || ''),
      preferredQualifications: Array.isArray(jobData?.preferredQualifications)
        ? jobData.preferredQualifications.join('\n')
        : (jobData?.preferredQualifications || ''),
      internalNotes: jobData?.internalNotes || '',
      skills: jobData?.skills || [],
      priority: (jobData?.priority && jobData.priority.length > 0) ? jobData.priority[0] : 'High',
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditAddSkill = () => {
    const trimmed = editNewSkill.trim();
    if (trimmed && editForm && !editForm.skills.includes(trimmed)) {
      setEditForm((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setEditNewSkill('');
    }
  };

  const handleEditRemoveSkill = (skill) => {
    setEditForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm?.jobtitle?.trim()) { toast.error('Job title is required'); return; }
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.data?.accessToken;
    setEditSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/jobs/updatejob/${jobData._id}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobtitle: editForm.jobtitle,
            description: editForm.description,
            location: editForm.location,
            salary: editForm.salary,
            openpositions: editForm.openpositions,
            experience: editForm.experience,
            employmentType: editForm.employmentType,
            hiringDeadline: editForm.hiringDeadline || null,
            keyResponsibilities: editForm.keyResponsibilities.split('\n').filter(Boolean),
            preferredQualifications: editForm.preferredQualifications.split('\n').filter(Boolean),
            internalNotes: editForm.internalNotes,
            skills: editForm.skills,
            priority: [editForm.priority],
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update job');
      toast.success('Job updated successfully');
      setJobData(data.job);
      setShowEditModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Fetch resume count for this job
  const fetchResumeCount = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/resumes/job/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      setResumeCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      setResumeCount(0);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchResumeCount();
    }
  }, [jobId]);

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Hardcoded data for the static UI
  const job = {
    jobId: jobId, // Add the jobId from URL params
    jobtitle: capitalizeFirstLetter(jobData?.jobtitle),
    company: jobData?.company,
    location: `${capitalizeFirstLetter(jobData?.type)} - ${capitalizeFirstLetter(jobData?.location)}`,
    employmentType: capitalizeFirstLetter(jobData?.employmentType),
    experience: `${jobData?.experience}+ years`,
    salary: `₹${jobData?.salary?.min}–₹${jobData?.salary?.max}`,
    posted: formatDate(jobData?.createdAt),
    isNew: true,
    description: jobData?.description,
    responsibilities: jobData?.keyResponsibilities || [],
    requiredSkills: jobData?.skills || [],
    preferredQualifications: jobData?.preferredQualifications || [],
    stats: {
      total: jobData?.totalApplication_number || 0,
      totalLabel: jobData?.totalApplication_number || 0,
      shortlisted: jobData?.shortlisted_number || 0,
      interviewed: jobData?.interviewed_number || 0,
      secondRound: jobData?.["2ndround_interviewed_number"] || 0
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showSavedResumes) {
    return <SavedResumes onBack={() => setShowSavedResumes(false)} jobId={jobId} jobtitle={job.jobtitle} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center py-0 px-0 bg-gray-50">
        <div className="w-full max-w-6xl bg-gray-50">
          {/* Back Button */}
          <div className="bg-gray-50 w-full px-4 md:px-0 pt-6 pb-2">
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
          {/* Improved Header Row */}
          <div className="bg-gray-50 w-full px-4 md:px-0 pt-2 pb-4">
            <div className="flex items-center justify-between w-full mb-4">
              <div>
                <div className="text-xs text-blue-600 font-semibold mb-1">JOB DETAILS</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{job.jobtitle}</div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2"
                  onClick={() => setShowSavedResumes(true)}
                >
                  <Users size={18} className="text-white" />
                  {resumeCount} Candidate List
                  <svg xmlns='http://www.w3.org/2000/svg' className='inline ml-1' width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
                <button
                  className="border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2"
                  onClick={openEditModal}
                >
                  <Pencil size={16} /> Edit Job
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                  {job.company ? job.company.charAt(0).toUpperCase() : '?'}
                </div>
                {job.company}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <MapPin size={16} className="text-gray-500" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <Briefcase size={16} className="text-gray-500" />
                {job.employmentType}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <Calendar size={16} className="text-gray-500" />
                {job.experience}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <IndianRupee size={16} className="text-gray-500" />
                {job.salary}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <CalendarDays size={16} className="text-gray-500" />
                Posted {job.posted}
              </span>
            </div>
          </div>
          {/* Main Content Row */}
          <div className="flex flex-col lg:flex-row gap-8 w-full mt-8">
            {/* Left: Job Description Card */}
            <div className="flex-1 rounded-xl p-6 md:p-10 mb-6 lg:mb-0 bg-gray-50">
              <div className="text-xl font-bold mb-4">Job Description:</div>
              <p className="text-gray-700 mb-6 whitespace-pre-line">{job.description}</p>
              <div className="text-lg font-semibold mb-2">Key Responsibilities:</div>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                {job.responsibilities.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <div className="text-lg font-semibold mb-2">Required Skills & Experience:</div>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                {job.requiredSkills.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <div className="text-lg font-semibold mb-2">Preferred Qualifications (Nice to Have):</div>
              <ul className="list-disc pl-6 mb-6 text-gray-700">
                {job.preferredQualifications.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            {/* Right: Application Statistics */}
            <div className="w-full lg:w-80 flex-shrink-0 rounded-2xl p-6 flex flex-col items-center bg-gray-50" style={{ minWidth: 320 }}>
              <div className="text-2xl font-bold mb-4 text-black">Application Statistics</div>
              {/* Donut Chart and Legend (replicated from dashboard, now with 4 segments) */}
              <div className="flex flex-col items-center w-full">
                <div className="relative w-72 h-72 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Total Application', value: job.stats.total },
                          { name: 'Shortlisted', value: job.stats.shortlisted },
                          { name: 'Interviewed', value: job.stats.interviewed },
                          { name: '2nd Round Interviewed', value: job.stats.secondRound },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={112}
                        outerRadius={130}
                        fill="#8884d8"
                        paddingAngle={4}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {['#1E75FF', '#0F172A', '#64748B', '#003A8D'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} stroke={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center" style={{padding: '32px 0'}}>
                    <div className="text-5xl font-bold leading-none">{job.stats.total}</div>
                    <div className="text-gray-500 text-lg mt-2">Total Applications</div>
                  </div>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-4 w-full">
                  {[
                    { name: 'Total Application', value: job.stats.total, color: '#1E75FF' },
                    { name: 'Shortlisted', value: job.stats.shortlisted, color: '#0F172A' },
                    { name: 'Interviewed', value: job.stats.interviewed, color: '#64748B' },
                    { name: '2nd Round Interviewed', value: job.stats.secondRound, color: '#003A8D' },
                  ].map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="flex-grow text-base text-gray-700">{entry.name}</span>
                      <span className="bg-gray-800 text-white py-1 px-3 rounded-2xl text-sm font-medium">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <div className="text-xs text-blue-600 font-semibold mb-0.5">EDIT JOB</div>
                <div className="text-xl font-bold text-gray-900">Edit Job Details</div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={24} /></button>
            </div>
            <form onSubmit={handleEditSave} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                <input name="jobtitle" value={editForm.jobtitle} onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Senior Software Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input name="location" value={editForm.location} onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. London, UK" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select name="employmentType" value={editForm.employmentType} onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input name="salary" value={editForm.salary} onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. £60,000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open Positions</label>
                  <input name="openpositions" value={editForm.openpositions} onChange={handleEditChange}
                    type="number" min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                  <input name="experience" value={editForm.experience} onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 3+ years" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select name="priority" value={editForm.priority} onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Deadline</label>
                <input name="hiringDeadline" value={editForm.hiringDeadline} onChange={handleEditChange} type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Job description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Responsibilities <span className="text-gray-400 text-xs">(one per line)</span></label>
                <textarea name="keyResponsibilities" value={editForm.keyResponsibilities} onChange={handleEditChange}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Each responsibility on a new line..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Qualifications <span className="text-gray-400 text-xs">(one per line)</span></label>
                <textarea name="preferredQualifications" value={editForm.preferredQualifications} onChange={handleEditChange}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Each qualification on a new line..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills / Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editForm.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      {skill}
                      <button type="button" className="ml-1 text-blue-400 hover:text-red-500 cursor-pointer" onClick={() => handleEditRemoveSkill(skill)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={editNewSkill} onChange={(e) => setEditNewSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditAddSkill(); } }}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add a skill..." />
                  <button type="button" onClick={handleEditAddSkill}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-300 cursor-pointer">Add</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea name="internalNotes" value={editForm.internalNotes} onChange={handleEditChange}
                  rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Internal notes..." />
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => setShowEditModal(false)}
                className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 cursor-pointer">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerJobDetailPage;