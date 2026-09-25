import React, { useState } from 'react';
import toast from 'react-hot-toast';

// `onBack` cancels out of the form; `onCreated` (optional) runs instead of
// `onBack` once a job is actually created, so callers can route the two
// outcomes differently. Falls back to `onBack` when not supplied.
// `initialValues` (optional) seeds the fields — used by the Upload JD flow to
// drop the parsed posting in for review before it is created.
// `extraPayload` is merged into the create request — the marketplace uses it to
// publish the job to ProRecruiters in the same call that creates it.
export default function CreateJobManager({ onBack, onCreated, initialValues, extraPayload }) {
  const seed = initialValues || {};
  const seedText = (value) => (value === undefined || value === null ? "" : String(value));
  const seedList = (value) => (Array.isArray(value) ? value : []);

  const [jobTitle, setJobTitle] = useState(seedText(seed.jobtitle));
  const [company, setCompany] = useState(seedText(seed.company));
  const [location, setLocation] = useState(seedText(seed.location));
  const [type, setType] = useState(seedText(seed.type));
  const [employmentType, setEmploymentType] = useState(seedText(seed.employmentType));
  const [openings, setOpenings] = useState(seedText(seed.openpositions));
  const [description, setDescription] = useState(seedText(seed.description));
  const [skills, setSkills] = useState(seedList(seed.skills));
  const [skillInput, setSkillInput] = useState("");
  const [keyResponsibilities, setKeyResponsibilities] = useState(seedList(seed.keyResponsibilities));
  const [keyRespInput, setKeyRespInput] = useState("");
  const [preferredQualifications, setPreferredQualifications] = useState(seedList(seed.preferredQualifications));
  const [prefQualInput, setPrefQualInput] = useState("");
  const [resumeAnalysisPoints, setResumeAnalysisPoints] = useState(seedList(seed.resumeAnalysisPoints));
  const [resumePointInput, setResumePointInput] = useState("");
  const [hiringDeadline, setHiringDeadline] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [priority, setPriority] = useState("");
  const [salaryMin, setSalaryMin] = useState(seed.salary?.min ? String(seed.salary.min) : "");
  const [salaryMax, setSalaryMax] = useState(seed.salary?.max ? String(seed.salary.max) : "");
  const [experience, setExperience] = useState(seed.experience ? String(seed.experience) : "");
  const [cvStrengthCutoff, setCvStrengthCutoff] = useState(seedText(seed.cvStrengthCutoff));
  const [isLoading, setIsLoading] = useState(false);

  // Add point handlers
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const handleRemoveSkill = (idx) => setSkills(skills.filter((_, i) => i !== idx));

  const handleAddKeyResp = () => {
    if (keyRespInput.trim()) {
      setKeyResponsibilities([...keyResponsibilities, keyRespInput.trim()]);
      setKeyRespInput("");
    }
  };
  const handleRemoveKeyResp = (idx) => setKeyResponsibilities(keyResponsibilities.filter((_, i) => i !== idx));

  const handleAddPrefQual = () => {
    if (prefQualInput.trim()) {
      setPreferredQualifications([...preferredQualifications, prefQualInput.trim()]);
      setPrefQualInput("");
    }
  };
  const handleRemovePrefQual = (idx) => setPreferredQualifications(preferredQualifications.filter((_, i) => i !== idx));
  const handleAddResumePoint = () => {
    if (resumePointInput.trim()) {
      setResumeAnalysisPoints([...resumeAnalysisPoints, resumePointInput.trim()]);
      setResumePointInput("");
    }
  };
  const handleRemoveResumePoint = (idx) => setResumeAnalysisPoints(resumeAnalysisPoints.filter((_, i) => i !== idx));

  // Priority handler
  const handlePriorityChange = (level) => {
    setPriority(level);
  };

  // Create job handler
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        toast.error("No authentication token found");
        return;
      }
      const managerId = userInfo?.data?.user?._id;
      if (!managerId) {
        toast.error("No managerId found in user info");
        return;
      }
      // Validate required fields
      if (!jobTitle.trim()) {
        toast.error("Job title is required");
        setIsLoading(false);
        return;
      }
      if (!type) {
        toast.error("Job type is required");
        setIsLoading(false);
        return;
      }
      if (!employmentType) {
        toast.error("Employment type is required");
        setIsLoading(false);
        return;
      }
      if (!openings || openings <= 0) {
        toast.error("Number of openings is required and must be greater than 0");
        setIsLoading(false);
        return;
      }
      // Validate hiring deadline
      if (hiringDeadline) {
        const deadlineDate = new Date(hiringDeadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        if (deadlineDate <= today) {
          toast.error("Hiring deadline must be greater than today's date");
          setIsLoading(false);
          return;
        }
      }
      // Compose salary object
      const salary = {
        min: salaryMin ? Number(salaryMin) : 0,
        max: salaryMax ? Number(salaryMax) : 0
      };
      // Compose payload
      const payload = {
        jobtitle: jobTitle,
        description,
        location,
        type,
        employmentType,
        openpositions: Number(openings),
        salary,
        skills,
        experience: experience ? Number(experience) : 0,
        cvStrengthCutoff: cvStrengthCutoff === "" ? null : Number(cvStrengthCutoff),
        keyResponsibilities,
        preferredQualifications,
        priority: priority ? [priority] : [],
        company: company, // Include company name
        hiringDeadline: hiringDeadline || null,
        internalNotes: internalNotes || "",
        resumeAnalysisPoints,
        managerId, // <-- Ensure managerId is included
        ...(extraPayload || {}),
      };
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/create-job`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userInfo.data.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Job created successfully!");
        if (typeof window.refreshJobs === 'function') {
          window.refreshJobs();
        }
        (typeof onCreated === 'function' ? onCreated : onBack)(data?.job);
      } else {
        toast.error(data.message || "Failed to create job");
      }
    } catch (err) {
      toast.error("Failed to create job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="flex items-center px-8 pt-8">
        <button onClick={onBack} className="mr-4 text-2xl text-gray-500 hover:text-blue-600 font-bold">←</button>
        <div className="text-3xl font-bold">Create Job</div>
      </div>
      <form id="create-job-form" className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 pt-8 w-full flex-1" onSubmit={handleCreateJob}>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-500 text-sm mb-1">Job Title</label>
            <input type="text" placeholder="Frontend Developer" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Company</label>
            <input type="text" placeholder="Company" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Location</label>
            <input type="text" placeholder="Hyderabad" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={type} onChange={e => setType(e.target.value)} required>
              <option value="">Select Type</option>
              <option value="remote">Remote</option>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Employment Type</label>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={employmentType} onChange={e => setEmploymentType(e.target.value)} required>
              <option value="">Select Employment Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Openings</label>
            <input type="number" placeholder="Number of positions" className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base" value={openings} onChange={e => setOpenings(e.target.value)} min="1" required />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Job Description</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 bg-white text-base min-h-[100px]" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {/* Required Skills & Expertise */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Required Skills & Expertise</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Add a skill point" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddSkill}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {skills.map((skill, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{skill}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemoveSkill(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Key Responsibilities */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Key Responsibilities</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Add a responsibility" value={keyRespInput} onChange={e => setKeyRespInput(e.target.value)} />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddKeyResp}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {keyResponsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{resp}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemoveKeyResp(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Preferred Qualifications */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Preferred Qualifications (Nice to Have)</label>
            <div className="flex gap-2 mb-2">
              <input type="text" className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Add a qualification" value={prefQualInput} onChange={e => setPrefQualInput(e.target.value)} />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddPrefQual}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {preferredQualifications.map((qual, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{qual}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemovePrefQual(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Resume Analysis Points */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Resume Analysis Points (Optional)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base"
                placeholder="Add a resume analysis point"
                value={resumePointInput}
                onChange={e => setResumePointInput(e.target.value)}
              />
              <button type="button" className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={handleAddResumePoint}>+</button>
            </div>
            <ul className="list-disc pl-6">
              {resumeAnalysisPoints.map((point, idx) => (
                <li key={idx} className="flex items-center justify-between mb-1">
                  <span>{point}</span>
                  <button type="button" className="text-red-400 ml-2" onClick={() => handleRemoveResumePoint(idx)}>×</button>
                </li>
              ))}
            </ul>
          </div>
          {/* Salary */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Salary Min</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Min" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} min={0} />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Salary Max</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Max" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} min={0} />
            </div>
          </div>
          {/* Experience */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Experience (years)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" placeholder="Years" value={experience} onChange={e => setExperience(e.target.value)} min={0} />
          </div>
          {/* CV Strength Cutoff */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">CV Strength Cutoff</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base"
              placeholder="e.g. 70"
              value={cvStrengthCutoff}
              onChange={e => setCvStrengthCutoff(e.target.value)}
              min={0}
              max={100}
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum CV match score (0–100) a candidate must reach for this role. Leave blank for no cutoff.
            </p>
          </div>
          {/* Hiring Deadline */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Hiring Deadline</label>
            <input 
              type="date" 
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base" 
              value={hiringDeadline} 
              onChange={e => setHiringDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Set minimum date to today
            />
            <p className="text-xs text-gray-500 mt-1">Deadline must be after today's date</p>
          </div>
          {/* Internal Notes */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Internal Notes</label>
            <textarea className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 bg-white text-base min-h-[60px]" value={internalNotes} onChange={e => setInternalNotes(e.target.value)} />
          </div>
          {/* Priority */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Priority</label>
            <div className="flex flex-col gap-2 mt-2">
              {['Low', 'Medium', 'High'].map((level) => (
                <label key={level} className="flex items-center gap-2">
                  <input type="radio" name="priority" className="form-radio accent-blue-600" checked={priority === level} onChange={() => handlePriorityChange(level)} /> {level}
                </label>
              ))}
            </div>
          </div>
        </div>
      </form>
      <div className="px-8 pt-4 pb-8">
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
            "Create"
          )}
        </button>
      </div>
    </div>
  );
} 
