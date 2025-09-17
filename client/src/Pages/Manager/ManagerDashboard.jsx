import React, { useState, useEffect } from "react";
import AddRecruiter from "../../Components/manager/AddRecruiter";
import ManagerAccountSettings from '../../Components/manager/ManagerAccountSettings';
import MarketplaceDashboard from '../../Components/manager/MarketplaceDashboard';
import toast from 'react-hot-toast';
import Jobs from '../../Components/recruiter/dashboard/Jobs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';



const stageLabels = [
  "Applications",
  "Submitted",
  "Screened",
  "Shortlisted",
  "Offered",
  "Hired",
];

const stageColors = [
  "#0A1833", // Applications (dark blue)
  "#0057FF", // Screened (blue)
  "#FF8A00", // Interviewed (orange)
  "#FFD233", // Shortlisted (yellow)
  "#6B7892", // Offered (gray-blue)
  "#f3f4f6",  // Hired (light gray)
];

// This will be replaced with dynamic data fetching



const ArrowSegment = ({ value, color, isFirst, isLast, empty, index }) => {
  let shapeClass = "middle";
  if (isFirst) shapeClass = "first";
  else if (isLast) shapeClass = "last";
  
  // Responsive margins for different positions
  let marginLeft = 0;
  if (isFirst) {
    marginLeft = 0; // Applications - no margin
  } else if (index === 1) {
    marginLeft = -12; // Screened - reduced overlap
  } else if (index === 2) {
    marginLeft = -24; // Interviewed - reduced overlap
  } else if (index === 3) {
    marginLeft = -36; // Shortlisted - reduced overlap
  } else if (index === 4) {
    marginLeft = -48; // Offered - reduced overlap
  } else {
    marginLeft = -60; // Hired - reduced overlap
  }
  
  return (
    <div
      className={`pipeline-segment ${shapeClass} ${empty ? 'empty' : ''} text-xs`}
      style={{ 
        background: empty ? undefined : color, 
        marginLeft: marginLeft, 
        minWidth: 'clamp(50px, 12vw, 80px)', 
        width: 'clamp(3rem, 12vw, 5rem)',
        fontSize: 'clamp(10px, 2vw, 12px)'
      }}
    >
      {value}
    </div>
  );
};

// Job Closed Trend Chart Component
const JobClosedTrendChart = ({ selectedRecruiter }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDataKey, setActiveDataKey] = useState('');

  React.useEffect(() => {
    fetchJobClosedData();
  }, [selectedRecruiter]);

  const fetchJobClosedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If no recruiter is selected, show empty state
      if (!selectedRecruiter) {
        setData([]);
        setLoading(false);
        return;
      }

      // Use the manager-specific API endpoint for monthly stats
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/stats/monthly`,
        {
          method: 'GET',
          credentials: 'include', // Send cookies instead of Authorization header
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        // Set the first month as active by default
        if (result.data.length > 0) {
          setActiveDataKey(result.data[0].name);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching job closed data:', err);
      setError(err.message);
      // Fallback to empty data (same as Candidate Submission)
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const CustomizedAxisTick = ({ x, y, payload, activeDataKey }) => {
    if (payload.value === activeDataKey) {
      return (
        <g transform={`translate(${x},${y})`}>
          <foreignObject x={-25} y={5} width={50} height={25}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              className="bg-black text-white text-center rounded-full leading-6"
            >
              {payload.value}
            </div>
          </foreignObject>
        </g>
      );
    }
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={15} dy={0} textAnchor="middle" fill="#6B7280" fontSize={14}>
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomDot = (props) => {
    const { cx, cy, payload, activeDataKey, data } = props;
    if (payload.name === activeDataKey) {
      // Calculate if this is the last data point to adjust positioning
      const isLastPoint = data && data.length > 0 && payload.name === data[data.length - 1]?.name;
      
      // Adjust x position for last point to prevent cutoff
      let tooltipX = cx + 10;
      if (isLastPoint) {
        tooltipX = cx - 130; // Move tooltip to the left for last point
      }
      
      return (
        <foreignObject x={tooltipX} y={cy - 70} width="120" height="65">
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className="bg-white p-2 rounded-lg shadow-lg border border-gray-200 text-center"
          >
            <p className="text-blue-600 text-2xl font-bold">{payload.uv}</p>
          </div>
        </foreignObject>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading data</p>
          <button 
            onClick={fetchJobClosedData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!selectedRecruiter) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center text-gray-500">
          <p>Select a recruiter to view job closed trend</p>
        </div>
      </div>
    );
  }

  // Calculate max value for Y-axis domain
  const maxValue = Math.max(...data.map(item => item.uv), 10); // Minimum of 10 for better visualization

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 20,
          left: -20,
          bottom: 20,
        }}
        onMouseMove={(e) => {
          if (e.activeLabel) {
            setActiveDataKey(e.activeLabel);
          }
        }}
        onMouseLeave={() => {
          if (data.length > 0) {
            setActiveDataKey(data[0].name);
          }
        }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={<CustomizedAxisTick activeDataKey={activeDataKey} />}
          interval={0}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          domain={[0, maxValue]}
          tick={{ fill: '#6B7280', fontSize: 14 }}
        />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#3B82F6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#chartGradient)"
          dot={(props) => <CustomDot {...props} activeDataKey={activeDataKey} data={data} />}
          activeDot={false}
        />
        {activeDataKey && <ReferenceLine x={activeDataKey} stroke="black" strokeWidth={2.5} />}
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Recruiter Detail Full Page
function RecruiterDetailPage({ recruiterId, onClose, token }) {
  const [recruiter, setRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const managerName = recruiter?.manager || userInfo?.data?.user?.fullname || '';

  React.useEffect(() => {
    if (!recruiterId) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${recruiterId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRecruiter(data.recruiter);
        setForm({ ...data.recruiter });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch recruiter details');
        setLoading(false);
      });
  }, [recruiterId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${recruiterId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to update recruiter');
      }
      const data = await response.json();
      setRecruiter(data.recruiter);
      toast.success('All changes saved');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!recruiterId) return null;
  return (
    <div className="fixed inset-0 z-50 bg-white w-full h-full overflow-y-auto flex flex-col">
      {/* Top bar with close, Add Job, View Performance */}
      <div className="flex items-center justify-between px-8 pt-8 pb-2 border-b border-gray-100">
        <div className="flex-1">
          <button
            className="text-blue-700 text-xs font-semibold focus:outline-none cursor-pointer"
            onClick={onClose}
          >
            &larr; Back
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="border border-gray-300 rounded-full px-6 py-2 text-black hover:bg-gray-100 bg-white cursor-pointer text-sm font-medium"
            style={{ minWidth: 100 }}
            disabled={saving}
          >
            Add Job
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 font-medium shadow-none cursor-pointer text-sm"
            style={{ minWidth: 140 }}
            disabled={saving}
          >
            View Performance
          </button>
        </div>
      </div>
      <div className="w-full max-w-6xl mx-auto flex-1 px-4 md:px-8 py-8">
        <div className="text-blue-700 text-xs font-semibold mb-2">EDIT RECRUITER INFORMATION</div>
        <div className="text-3xl font-bold mb-8 text-gray-900">Basic Information</div>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">{error}</div>
        ) : (
          <form className="space-y-10">
            {/* Basic Info */}
            <div className="space-y-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Full Name :</label>
                <input
                  name="fullname"
                  value={form.fullname || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Email Id :</label>
                <input
                  name="email"
                  value={form.email || ''}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-base cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Phone Number :</label>
                <input
                  name="phone"
                  value={form.phone || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                />
              </div>
            </div>
            {/* Role & Job Details */}
            <div className="text-xl font-semibold mt-4 mb-2">Role & Job Details</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Location :</label>
                <input
                  name="location"
                  value={form.location || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="On-site / Remote / Hybrid"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Assigned Company :</label>
                <input
                  name="assignedCompany"
                  value={form.assignedCompany || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Specialization / Hiring Areas :</label>
                <input
                  name="specialization"
                  value={form.specialization || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="Tech, Design, ..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">TAT Expectations :</label>
                <input
                  name="tatExpectations"
                  value={form.tatExpectations || ''}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-base"
                  placeholder="3-5 days"
                />
              </div>
            </div>
            {/* Confirm & Create */}
            <div className="text-xl font-semibold mt-4 mb-2">Confirm & Create</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Role</label>
                <input
                  name="role"
                  value={form.role || ''}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-base cursor-not-allowed"
                  placeholder="Recruiter"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Manager</label>
                <input
                  name="manager"
                  value={managerName}
                  disabled
                  className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-base cursor-not-allowed"
                  placeholder="Manager Name"
                />
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-12 justify-end">
              <button
                type="button"
                className="border border-gray-300 rounded-lg px-6 py-2 text-gray-700 hover:text-gray-900 bg-white cursor-pointer"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-2 font-semibold shadow-none cursor-pointer"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Recruiter Overview Component
function RecruiterOverview({ recruiter, onClose, showHeader = true, isCompact = false, sectionTitle = "Productivity Metrics" }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real metrics data when component mounts or recruiter changes
  useEffect(() => {
    if (recruiter?._id) {
      fetchMetrics();
    }
  }, [recruiter, sectionTitle]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }
      const managerId = userInfo?.data?.user?._id;
      if (!managerId) {
        console.error('No managerId found in user info');
        return;
      }

      // Fetch jobs for the manager
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/get-jobs/${managerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const allJobs = data.jobs || [];
        
        // Filter jobs assigned to this specific recruiter (including closed jobs for submissions calculation)
        const allAssignedJobs = allJobs.filter(job => {
          // Check if this recruiter is assigned to this job
          const isAssigned = job.assignedRecruiters && 
            job.assignedRecruiters.some(assignedRecruiter => 
              assignedRecruiter._id === recruiter._id || assignedRecruiter === recruiter._id
            );
          
          return isAssigned;
        });

        // Filter jobs assigned to this specific recruiter and not closed (for roles assigned)
        const assignedJobs = allAssignedJobs.filter(job => {
          const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
          const isClosed = job.isClosed || isDeadlinePassed;
          
          return !isClosed;
        });

        // Calculate total submissions for all assigned jobs (including closed)
        let totalSubmissions = 0;
        let totalJobsWithSubmissions = 0;
        let allResumes = [];

        for (const job of allAssignedJobs) {
          try {
            const resumeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/job/${job._id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${userInfo.data.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (resumeResponse.ok) {
              const resumeData = await resumeResponse.json();
              const submissionCount = Array.isArray(resumeData) ? resumeData.length : 0;
              totalSubmissions += submissionCount;
              if (submissionCount > 0) {
                totalJobsWithSubmissions++;
              }
              // Collect all resumes for efficiency metrics calculation
              if (Array.isArray(resumeData)) {
                // Add job creation date to each resume for time calculation
                const resumesWithJobData = resumeData.map(resume => ({
                  ...resume,
                  jobId: resume.jobId || { ...job, createdAt: job.createdAt }
                }));
                allResumes.push(...resumesWithJobData);
              }
            }
          } catch (error) {
            console.error(`Error fetching resumes for job ${job._id}:`, error);
          }
        }

        // Calculate average submissions per role
        const averageSubmissionsPerRole = allAssignedJobs.length > 0 
          ? Math.round(totalSubmissions / allAssignedJobs.length) 
          : 0;

        // Calculate efficiency metrics based on recruiter's resumes
        const recruiterResumes = allResumes.filter(resume => 
          resume.recruiterId === recruiter._id || resume.recruiterId === recruiter._id
        );
        
        // Submissions-to-Interview Ratio: (total resumes except 'submitted' status) / total resumes * 100
        const totalResumes = recruiterResumes.length;
        const nonSubmittedResumes = recruiterResumes.filter(resume => resume.status !== 'submitted').length;
        const submissionsToInterviewRatio = totalResumes > 0 ? Math.round((nonSubmittedResumes / totalResumes) * 100) : 0;
        
        // Interview-to-Offer Ratio: offered / (offered + shortlisted + screening + rejected) * 100
        const offeredResumes = recruiterResumes.filter(resume => resume.status === 'offered').length;
        const shortlistedResumes = recruiterResumes.filter(resume => resume.status === 'shortlisted').length;
        const screeningResumes = recruiterResumes.filter(resume => resume.status === 'screening').length;
        const rejectedResumes = recruiterResumes.filter(resume => resume.status === 'rejected').length;
        const denominator = offeredResumes + shortlistedResumes + screeningResumes + rejectedResumes;
        const interviewToOfferRatio = denominator > 0 ? Math.round((offeredResumes / denominator) * 100) : 0;
        
        // Offer-to-Hire Ratio: hired / (hired + offered) * 100
        const hiredResumes = recruiterResumes.filter(resume => resume.status === 'hired').length;
        const offerToHireDenominator = hiredResumes + offeredResumes;
        const offerToHireRatio = offerToHireDenominator > 0 ? Math.round((hiredResumes / offerToHireDenominator) * 100) : 0;

        // Get Time to Fill from backend API
        let averageTimeToFill = 0;
        try {
          const timeToFillResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiters/stats/${recruiter._id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${userInfo.data.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (timeToFillResponse.ok) {
            const timeToFillData = await timeToFillResponse.json();
            averageTimeToFill = timeToFillData.stats.timeToFill || 0;
          }
        } catch (error) {
          console.error('Error fetching Time to Fill from backend:', error);
        }

        // Calculate Time to Source
        let totalTimeToSourceDays = 0;
        let validJobs = 0;

        for (const job of allAssignedJobs) {
          try {
            // Fetch resumes for this specific job
            const jobResumeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/job/${job._id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${userInfo.data.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (jobResumeResponse.ok) {
              const jobResumes = await jobResumeResponse.json();
              
              // Filter resumes by this recruiter and with shortlistedTime
              const recruiterShortlistedResumes = jobResumes.filter(resume => 
                (resume.recruiterId === recruiter._id || resume.recruiterId === recruiter._id) &&
                resume.shortlistedTime &&
                resume.status === 'shortlisted'
              );
              
              if (recruiterShortlistedResumes.length > 0 && job.createdAt) {
                // Find the minimum shortlistedTime for this job
                const shortlistedTimes = recruiterShortlistedResumes.map(resume => new Date(resume.shortlistedTime));
                const minShortlistedTime = new Date(Math.min(...shortlistedTimes));
                const jobCreatedAt = new Date(job.createdAt);
                
                // Calculate time difference in days
                const timeDifferenceMs = minShortlistedTime - jobCreatedAt;
                const timeDifferenceDays = Math.ceil(timeDifferenceMs / (1000 * 60 * 60 * 24));
                
                if (timeDifferenceDays >= 0) {
                  totalTimeToSourceDays += timeDifferenceDays;
                  validJobs++;
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching resumes for job ${job._id} for time to source calculation:`, error);
          }
        }

        const averageTimeToSource = validJobs > 0 ? Math.round(totalTimeToSourceDays / validJobs) : 0;

        // Calculate metrics based on section title
        let calculatedMetrics = [];
        
        if (sectionTitle === "Productivity Metrics") {
          calculatedMetrics = [
            { title: "Roles Assigned", value: assignedJobs.length.toString() },
            { title: "Submissions Per Role", value: averageSubmissionsPerRole.toString() },
            { title: "Time To Source", value: averageTimeToSource.toString() }
          ];
        } else if (sectionTitle === "Efficiency Metrics") {
          calculatedMetrics = [
            { title: "Time To Fill", value: averageTimeToFill.toString() },
            { title: "Submissions-to-Interview Ratio", value: `${submissionsToInterviewRatio}%` },
            { title: "Interview-to-Offer Ratio", value: `${interviewToOfferRatio}%` },
            { title: "Offer-to-Hire Conversion", value: `${offerToHireRatio}%` }
          ];
        } else if (sectionTitle === "Business Impact Metrics") {
          calculatedMetrics = [
            { title: "Fill Rate", value: "7" }
          ];
        } else {
          // Default metrics
          calculatedMetrics = [
            { title: "Total Jobs", value: "7" },
            { title: "Candidates in Process", value: "37" },
            { title: "Interviews Scheduled", value: "5" },
            { title: "Feedback Pending", value: "178" },
            { title: "Offers Made", value: "28" },
            { title: "Success Ratio", value: "48%" }
          ];
        }
        
        setMetrics(calculatedMetrics);
      } else {
        console.error('Failed to fetch jobs');
        setMetrics(getDefaultMetrics());
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics(getDefaultMetrics());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMetrics = () => {
    if (sectionTitle === "Productivity Metrics") {
      return [
        { title: "Roles Assigned", value: "0" },
        { title: "Submissions Per Role", value: "0" },
        { title: "Time To Source", value: "0" }
      ];
    } else if (sectionTitle === "Efficiency Metrics") {
      return [
        { title: "Time To Fill", value: "0" },
        { title: "Submissions-to-Interview Ratio", value: "0%" },
        { title: "Interview-to-Offer Ratio", value: "0%" },
        { title: "Offer-to-Hire Conversion", value: "0%" }
      ];
    } else if (sectionTitle === "Business Impact Metrics") {
      return [
        { title: "Fill Rate", value: "0" }
      ];
    }
    return [
      { title: "Total Jobs", value: "0" },
      { title: "Candidates in Process", value: "0" },
      { title: "Interviews Scheduled", value: "0" },
      { title: "Feedback Pending", value: "0" },
      { title: "Offers Made", value: "0" },
      { title: "Success Ratio", value: "0%" }
    ];
  };

  return (
    <div className={`${isCompact ? 'p-4' : 'p-6'} bg-gray-50`}>
      {/* Header - only show if showHeader is true */}
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              className="text-blue-700 text-xs font-semibold focus:outline-none cursor-pointer mb-2"
              onClick={onClose}
            >
              &larr; Back to My Recruiters
            </button>
            <div className="text-2xl font-bold text-gray-900">Recruiter Overview</div>
          </div>
        </div>
      )}

      {/* Section Title */}
      <div className="text-xl font-bold text-gray-900 mb-4">{sectionTitle}</div>

      {/* Metric Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="text-gray-500 text-sm font-medium mb-1">{metric.title}</div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Recruiter Performance Component
function RecruiterPerformance({ recruiter, onClose }) {
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchRedFlags();
  }, [recruiter]);

  const fetchRedFlags = async () => {
    try {
      setLoading(true);
      
      if (!recruiter?._id) {
        setRedFlags([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/recruiter/${recruiter._id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const resumes = result.data || [];
          const redFlagsData = calculateRedFlags(resumes);
          setRedFlags(redFlagsData);
        } else {
          setRedFlags([]);
        }
      } else {
        setRedFlags([]);
      }
    } catch (err) {
      console.error('Error fetching red flags:', err);
      setRedFlags([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRedFlags = (resumes) => {
    const flags = [];
    
    // Group resumes by jobId
    const resumesByJob = {};
    resumes.forEach(resume => {
      if (resume.jobId) {
        if (!resumesByJob[resume.jobId]) {
          resumesByJob[resume.jobId] = [];
        }
        resumesByJob[resume.jobId].push(resume);
      }
    });

    // Check each job for high rejection rate
    Object.entries(resumesByJob).forEach(([jobId, jobResumes]) => {
      const totalResumes = jobResumes.length;
      const rejectedResumes = jobResumes.filter(resume => resume.status === 'rejected').length;
      const rejectionRate = (rejectedResumes / totalResumes) * 100;

      if (rejectionRate > 30) {
        // Get job title from the first resume (assuming all resumes for same job have same title)
        const jobTitle = jobResumes[0]?.applicationDetails?.position || 'Unknown Position';
        flags.push({
          type: 'High Rejection Rate',
          jobTitle: jobTitle,
          rejectionCount: rejectedResumes,
          totalCount: totalResumes,
          rejectionRate: rejectionRate.toFixed(1)
        });
      }
    });

    return flags;
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            className="text-blue-700 text-xs font-semibold focus:outline-none cursor-pointer mb-2"
            onClick={onClose}
          >
            &larr; Back to My Recruiters
          </button>
          <div className="text-2xl font-bold text-gray-900">Recruiter Performance</div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Job Closed */}
        <div className="bg-white rounded-2xl shadow p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="font-bold text-gray-900 text-xl">Job Closed</div>
            <div className="bg-black text-white text-base px-5 py-3 rounded">
              Target: 42/50
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="18"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="110"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="18"
                  strokeDasharray="690"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-800">84%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average TAT */}
        <div className="bg-white rounded-2xl shadow p-10">
          <div className="font-bold text-gray-900 text-xl mb-8">Average TAT</div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="400" height="200" viewBox="0 0 400 200">
                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="20"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                  strokeDasharray="440"
                  strokeDashoffset="220"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateY(40px)' }}>
                <span className="text-5xl font-bold text-gray-800">20/30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Submission Trend */}
      <div className="bg-white rounded-2xl shadow p-8 mb-6">
        <div className="font-bold text-gray-900 text-xl mb-6">Candidate Submission Trend</div>
        <JobClosedTrendChart selectedRecruiter={recruiter} />
      </div>

      {/* Red Flags */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="font-semibold text-gray-900 mb-4">Red Flags</div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : redFlags.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-lg font-medium">No Red Flags</div>
            <div className="text-gray-500 text-sm mt-1">All rejection rates are within acceptable limits</div>
          </div>
        ) : (
          <div className="space-y-3">
            {redFlags.map((flag, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                <div className="text-red-500 mr-3 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-red-800">{flag.type}</div>
                  <div className="text-sm text-red-600">
                    {flag.jobTitle} ({flag.rejectionCount} rejection{flag.rejectionCount !== 1 ? 's' : ''} - {flag.rejectionRate}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagerDashboard() {
  // State for scorecard review data
  const [scorecardData, setScorecardData] = useState({
    totalResumes: 0,
    reviewedResumes: 0,
    pendingResumes: 0,
    reviewedPercent: 0,
    pendingPercent: 0
  });
  const [scorecardLoading, setScorecardLoading] = useState(true);
  const [scorecardError, setScorecardError] = useState(null);

  // State for candidate pipeline data
  const [candidatePipelineData, setCandidatePipelineData] = useState([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineError, setPipelineError] = useState(null);

  // State for selected recruiter
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);

  // State for recruiter performance summary data
  const [recruiterPerformanceData, setRecruiterPerformanceData] = useState([]);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState(null);

  // Fetch scorecard data
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    
    if (!managerId || !token) {
      setScorecardLoading(false);
      return;
    }

    const fetchScorecardData = async () => {
      try {
        setScorecardLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/manager/${managerId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch scorecard data');
        }
        
        const data = await response.json();
        if (data.success) {
          setScorecardData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch scorecard data');
        }
      } catch (err) {
        console.error('Error fetching scorecard data:', err);
        setScorecardError(err.message);
      } finally {
        setScorecardLoading(false);
      }
    };

    fetchScorecardData();
  }, []);

  // Fetch candidate pipeline data
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    
    if (!managerId || !token) {
      setPipelineLoading(false);
      return;
    }

    const fetchPipelineData = async () => {
      try {
        setPipelineLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/manager/${managerId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch pipeline data');
        }
        
        const data = await response.json();
        if (data.success) {
          // Process the resumes data to create pipeline
          const processedData = processPipelineData(data.resumes || []);
          setCandidatePipelineData(processedData);
        } else {
          throw new Error(data.message || 'Failed to fetch pipeline data');
        }
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setPipelineError(err.message);
      } finally {
        setPipelineLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  // Fetch recruiter performance summary data
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    
    if (!managerId || !token) {
      setPerformanceLoading(false);
      return;
    }

    const fetchRecruiterPerformanceData = async () => {
      try {
        setPerformanceLoading(true);
        setPerformanceError(null);
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch recruiter performance data');
        }
        
        const data = await response.json();
        if (data.recruiters && Array.isArray(data.recruiters)) {
          // Sort by creation date (most recent first) and take only the first 6
          const sortedRecruiters = data.recruiters
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6)
            .map(recruiter => ({
              name: recruiter.fullname || 'Unknown',
              hires: recruiter.totalHires || 0,
              offers: recruiter.offersMade || 0,
              accepted: recruiter.offersAccepted || 0,
              tat: recruiter.avgTAT || 0
            }));
          
          setRecruiterPerformanceData(sortedRecruiters);
        } else {
          setRecruiterPerformanceData([]);
        }
      } catch (err) {
        console.error('Error fetching recruiter performance data:', err);
        setPerformanceError(err.message);
        setRecruiterPerformanceData([]);
      } finally {
        setPerformanceLoading(false);
      }
    };

    fetchRecruiterPerformanceData();
  }, []);

  // Function to process resume data into pipeline format
  const processPipelineData = (resumes) => {
    const tags = ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Finance', 'Other'];
    // New order: Applications, Submitted, Screened, Shortlisted, Offered, Hired
    const statuses = ['submitted', 'submitted', 'screening', 'shortlisted', 'offered', 'hired'];
    
    return tags.map(tag => {
      const tagResumes = resumes.filter(resume => resume.tag === tag);
      const stages = statuses.map((status, index) => {
        let count = 0;
        
        if (index === 0) {
          // Applications: count all resumes for this tag
          count = tagResumes.length;
        } else if (index === 1) {
          // Submitted: count resumes with 'submitted' status
          count = tagResumes.filter(resume => resume.status === 'submitted').length;
        } else {
          // Other stages: count by specific status
          count = tagResumes.filter(resume => resume.status === status).length;
        }
        
        return count > 0 ? count : null;
      });
      
      return {
        role: tag,
        stages: stages
      };
    });
  };

  // Use dynamic data for the scorecard review component
  const reviewedPercent = scorecardData.reviewedPercent;
  const pendingPercent = scorecardData.pendingPercent;

  // SVG circle parameters
  const size = 192; // px (w-48 h-48)
  const stroke = 14;
  const radius = 86 - stroke / 2; // 86 is half of 172 (inner circle), minus half stroke
  const circumference = 2 * Math.PI * radius;
  const reviewedLength = (circumference * reviewedPercent) / 100;
  const pendingLength = (circumference * pendingPercent) / 100;
  const gapLength = circumference * 0.08; // 8% gap at the bottom
  const offsetReviewed = gapLength / 2;
  const offsetPending = reviewedLength + gapLength / 2;

  const [selectedSidebar, setSelectedSidebar] = useState(0);
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecruiterId, setDetailRecruiterId] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
  const [recruitersLoading, setRecruitersLoading] = useState(true);
  const [recruitersError, setRecruitersError] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [showMarketplaceDashboard, setShowMarketplaceDashboard] = useState(false);

  // Fetch recruiters once for the whole dashboard
  React.useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const managerId = userInfo?.data?.user?._id;
    const token = userInfo?.data?.accessToken;
    if (!managerId || !token) return;
    setRecruitersLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/getrecruiter?creatorId=${managerId}&type=manager`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRecruiters((data.recruiters || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setRecruitersError(null);
      })
      .catch(err => setRecruitersError('Failed to fetch recruiters'))
      .finally(() => setRecruitersLoading(false));
  }, []);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const token = userInfo?.data?.accessToken;

  // Sidebar icons (SVGs)
  const icons = [
    // Dashboard (selected)
   <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.55556 15.5556H10.8889C11.7444 15.5556 12.4444 14.8556 12.4444 14V1.55556C12.4444 0.7 11.7444 0 10.8889 0H1.55556C0.7 0 0 0.7 0 1.55556V14C0 14.8556 0.7 15.5556 1.55556 15.5556ZM1.55556 28H10.8889C11.7444 28 12.4444 27.3 12.4444 26.4444V20.2222C12.4444 19.3667 11.7444 18.6667 10.8889 18.6667H1.55556C0.7 18.6667 0 19.3667 0 20.2222V26.4444C0 27.3 0.7 28 1.55556 28ZM17.1111 28H26.4444C27.3 28 28 27.3 28 26.4444V14C28 13.1444 27.3 12.4444 26.4444 12.4444H17.1111C16.2556 12.4444 15.5556 13.1444 15.5556 14V26.4444C15.5556 27.3 16.2556 28 17.1111 28ZM15.5556 1.55556V7.77778C15.5556 8.63333 16.2556 9.33333 17.1111 9.33333H26.4444C27.3 9.33333 28 8.63333 28 7.77778V1.55556C28 0.7 27.3 0 26.4444 0H17.1111C16.2556 0 15.5556 0.7 15.5556 1.55556Z" fill="black" fill-opacity="0.7"/>
</svg>
,
    // Team
    <svg key="team" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" /><path d="M2 20c0-4 8-4 8 0" stroke="currentColor" /><path d="M14 20c0-4 8-4 8 0" stroke="currentColor" /></svg>,
    // List
<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.4997 19.8327H22.1663M10.4997 13.9993H22.1663M10.4997 8.16602H22.1663M5.83529 19.8327V19.835L5.83301 19.835V19.8327H5.83529ZM5.83529 13.9993V14.0017L5.83301 14.0016V13.9993H5.83529ZM5.83529 8.16602V8.16835L5.83301 8.16829V8.16602H5.83529Z" stroke="black" stroke-opacity="0.7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
,

  ];



  function getStatusColor(status) {
    if (status === "Active") return "text-green-600 font-semibold";
    if (status === "Inactive") return "text-red-600 font-semibold";
    return "text-gray-500";
  }

  // MyRecruiters now receives recruiters as a prop
  function MyRecruiters({ selectedRecruiter, setSelectedRecruiter }) {
    const [showAddRecruiter, setShowAddRecruiter] = useState(false);
    const [showPerformance, setShowPerformance] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [recruiterToDelete, setRecruiterToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const itemsPerPage = 10;

    // Get available years from recruiter data
    const getAvailableYears = () => {
      const years = new Set();
      recruiters.forEach(recruiter => {
        if (recruiter.createdAt) {
          years.add(new Date(recruiter.createdAt).getFullYear().toString());
        }
      });
      return Array.from(years).sort((a, b) => b - a); // Sort in descending order
    };

    const availableYears = getAvailableYears();

    // Set default selected year to the most recent year if available
    React.useEffect(() => {
      if (availableYears.length > 0 && !selectedYear) {
        setSelectedYear(availableYears[0]); // First year is the most recent (descending order)
      }
    }, [availableYears, selectedYear]);

    // Use recruiters, recruitersLoading, recruitersError from parent
    const filteredRecruiters = recruiters.filter(rec => {
      // Search filter
      const matchesSearch = rec.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Year filter
      let matchesYear = true;
      if (selectedYear && selectedYear !== "") {
        const recruiterYear = new Date(rec.createdAt).getFullYear().toString();
        matchesYear = recruiterYear === selectedYear;
      }
      
      return matchesSearch && matchesYear;
    });

    // Pagination
    const totalPages = Math.ceil(filteredRecruiters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRecruiters = filteredRecruiters.slice(startIndex, endIndex);

    // Reset to first page when search or year changes
    React.useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, selectedYear]);

    // Handle delete recruiter
    const handleDeleteClick = (recruiter) => {
      setRecruiterToDelete(recruiter);
      setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
      if (!recruiterToDelete) return;
      
      setDeleting(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/recruiter/${recruiterToDelete._id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          // Remove from local state
          setRecruiters(prev => prev.filter(rec => rec._id !== recruiterToDelete._id));
          setShowDeleteDialog(false);
          setRecruiterToDelete(null);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete recruiter');
        }
      } catch (err) {
        console.error('Error deleting recruiter:', err);
        alert('Failed to delete recruiter. Please try again.');
      } finally {
        setDeleting(false);
      }
    };

    const handleDeleteCancel = () => {
      setShowDeleteDialog(false);
      setRecruiterToDelete(null);
    };

    const handleRowClick = (recruiter) => {
      setSelectedRecruiter(recruiter);
      setShowPerformance(true);
    };

    if (showAddRecruiter) {
      return <AddRecruiter onClose={() => setShowAddRecruiter(false)} />;
    }

    if (showPerformance && selectedRecruiter) {
      return (
        <div className="min-h-screen bg-gray-50">
          {/* First Recruiter Overview */}
          <RecruiterOverview 
            recruiter={selectedRecruiter} 
            onClose={() => {
              setShowPerformance(false);
              setSelectedRecruiter(null);
            }} 
            showHeader={true}
            isCompact={false}
            sectionTitle="Productivity Metrics"
          />
          
          {/* Second Recruiter Overview */}
          <RecruiterOverview 
            recruiter={selectedRecruiter} 
            onClose={() => {
              setShowPerformance(false);
              setSelectedRecruiter(null);
            }} 
            showHeader={false}
            isCompact={true}
            sectionTitle="Efficiency Metrics"
          />
          
          {/* Third Recruiter Overview */}
          <RecruiterOverview 
            recruiter={selectedRecruiter} 
            onClose={() => {
              setShowPerformance(false);
              setSelectedRecruiter(null);
            }} 
            showHeader={false}
            isCompact={true}
            sectionTitle="Business Impact Metrics"
          />
        </div>
      );
    }

    if (recruitersLoading) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading recruiters...</div>
          </div>
        </div>
      );
    }

    if (recruitersError) {
      return (
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error: {recruitersError}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <div className="text-xs text-blue-600 font-semibold tracking-wide mb-1">JOB DETAILS</div>
            <div className="text-2xl font-bold text-gray-900">My Recruiters</div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
           
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-lg font-medium shadow-none cursor-pointer transition-colors" 
              onClick={() => setShowAddRecruiter(true)}
            >
              + Add Recruiter
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex items-center bg-gray-200 rounded-lg px-4 py-2 w-full max-w-2xl">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="bg-transparent outline-none w-full text-gray-700 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-2xl border border-gray-200">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="py-3 px-4 font-medium text-left">Name</th>
                <th className="py-3 px-4 font-medium text-left">Email ID</th>
                <th className="py-3 px-4 font-medium text-left">Location</th>
                <th className="py-3 px-4 font-medium text-center">Status</th>
                <th className="py-3 px-4 font-medium text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecruiters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    {recruiters.length === 0 ? "No recruiters found. Create your first recruiter!" : "No recruiters match your search."}
                  </td>
                </tr>
              ) : (
                currentRecruiters.map((rec, idx) => (
                  <tr 
                    key={rec._id || idx} 
                    className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(rec)}
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900">{rec.fullname || "N/A"}</td>
                    <td className="py-3 px-4 text-gray-700">{rec.email}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{rec.location || "N/A"}</td>
                    <td className={`py-3 px-4 text-center ${getStatusColor(rec.status || "Inactive")}`}>
                      {rec.status || "Inactive"}
                    </td>
                    <td className="py-3 px-4 flex gap-3 items-center" onClick={(e) => e.stopPropagation()}>
                      {/* Action icons: view and delete only */}
                      <button 
                        className="text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                        title="View Details"
                        onClick={e => {
                          e.stopPropagation();
                          setDetailRecruiterId(rec._id);
                          setShowDetailModal(true);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M8 7h8M8 11h8M8 15h4" />
                        </svg>
                      </button>
                      <button 
                        className="text-gray-900 hover:text-red-500 cursor-pointer transition-colors"
                        title="Delete Recruiter"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(rec);
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          <path d="M19 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200">
              <div className="text-lg font-semibold text-gray-900 mb-4">Delete Recruiter</div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{recruiterToDelete?.fullname}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show Marketplace Dashboard if enabled
  if (showMarketplaceDashboard) {
    return (
      <MarketplaceDashboard 
        onBack={() => setShowMarketplaceDashboard(false)} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      {/* Sidebar */}
      <aside className="flex flex-col justify-between items-center bg-white w-20 py-6 sticky top-0 left-0 h-screen z-20">
        <div className="flex flex-col items-center w-full gap-6">
          {/* Logo */}
          <div className="mb-8">
            <img src="/zepul_sidebar_logo.png" alt="Logo" className="h-6 w-6 filter brightness-0" />
          </div>
          <hr className="w-10 border-gray-700 mb-8" />
          {/* Icons */}
          <nav className="flex flex-col items-center justify-center gap-8 w-full">
            {icons.map((icon, idx) => {
              const tooltipLabels = ["Dashboard", "Recruiter", "Jobs"];
              return (
                <div key={idx} className="relative">
                  <button 
                    onClick={() => { setSelectedSidebar(idx); setShowAccountInfo(false); }} 
                    className={`cursor-pointer ${idx === selectedSidebar ? "bg-blue-600 rounded-lg p-2" : "p-2"}`}
                    onMouseEnter={() => setHoveredIcon(idx)}
                    onMouseLeave={() => setHoveredIcon(null)}
                  >
                    <span className={idx === selectedSidebar ? "text-black" : "text-black"}>{icon}</span>
                  </button>
                  {/* Tooltip */}
                  {hoveredIcon === idx && (
                    <div 
                      className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
                      style={{ zIndex: 9999 }}
                    >
                      {tooltipLabels[idx]}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        {/* Avatar */}
        <div className="mb-2">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User Avatar"
            className="w-12 h-12 rounded-full border-2 border-blue-600 object-cover cursor-pointer"
            onClick={() => setShowAccountInfo(true)}
          />
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 ml-20 bg-[#F7F8FA] h-screen">
        {showAccountInfo ? (
          <div className="h-screen flex items-start overflow-y-auto">
            <div className="w-full max-w-[90vw]">
              <ManagerAccountSettings />
            </div>
          </div>
        ) : selectedSidebar === 1 ? (
          <div className="h-screen overflow-y-auto">
            <MyRecruiters selectedRecruiter={selectedRecruiter} setSelectedRecruiter={setSelectedRecruiter} />
          </div>
        ) : selectedSidebar === 2 ? (
          <div className="h-screen overflow-y-auto p-2 md:p-6">
            <Jobs />
          </div>
        ) : (
          <div className="h-screen overflow-y-auto p-2 md:p-4">
            {/* Header */}
            <div className="bg-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-600 font-semibold tracking-wide mb-1">DASHBOARD</div>
                  <div className="text-xl font-bold text-gray-900">Manager Overview</div>
                </div>
                <div className="flex items-center">
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
                    style={{
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      textShadow: '0 0 8px rgba(147, 197, 253, 0.8)'
                    }}
                    onClick={() => {
                      setShowMarketplaceDashboard(true);
                    }}
                  >
                    Marketplace Dashboard
                  </button>
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
            </div>
           
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
              {/* Candidate Pipeline */}
              <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4 mb-3">
                <div className="font-semibold text-gray-900 mb-3 text-xs md:text-sm">Candidate Pipeline</div>
                {pipelineLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">Loading pipeline data...</div>
                  </div>
                ) : pipelineError ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-red-500 text-center">
                      <div className="text-sm">Error loading pipeline data</div>
                      <div className="text-xs mt-1">{pipelineError}</div>
                    </div>
                  </div>
                ) : (
                <div className="w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] table-fixed">
                      <thead>
                        <tr>
                          <th className="w-20 sm:w-24 md:w-32 text-left text-xs text-gray-500 font-medium pb-2"></th>
                          {stageLabels.map((label, idx) => {
                            let transformClass = '';
                            let widthClass = 'w-12 sm:w-16 md:w-20';
                            
                            if (label === 'Screened') {
                              transformClass = 'transform -translate-x-2 sm:-translate-x-3 md:-translate-x-4';
                            } else if (label === 'Shortlisted') {
                              transformClass = 'transform -translate-x-6 sm:-translate-x-8 md:-translate-x-8';
                            } else if (label === 'Offered') {
                              transformClass = 'transform -translate-x-8 sm:-translate-x-12 md:-translate-x-12';
                            } else if (label === 'Hired') {
                              transformClass = 'transform -translate-x-10 sm:-translate-x-16 md:-translate-x-20';
                            }
                            
                            return (
                              <th key={label} className={`${widthClass} text-xs text-gray-500 font-medium pb-2 text-left ${transformClass}`}>
                                {label}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                          {candidatePipelineData.length === 0 ? (
                            <tr>
                              <td colSpan="7" className="py-4 text-center text-gray-500">
                                No pipeline data available
                              </td>
                            </tr>
                          ) : (
                            candidatePipelineData.map((item, idx) => (
                          <tr key={item.role} className="align-middle">
                            <td className="text-xs text-gray-700 font-medium py-1 pr-2">{item.role}</td>
                            {item.stages.map((val, i) => (
                              <td key={i} className="py-1 px-0.5">
                                <ArrowSegment
                                  value={val !== null ? val : ""}
                                  color={stageColors[i]}
                                  isFirst={i === 0}
                                  isLast={i === item.stages.length - 1}
                                  empty={val === null}
                                  index={i}
                                />
                              </td>
                            ))}
                          </tr>
                            ))
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}
              </div>
              {/* Pending Scorecard Review */}
              <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4 flex flex-col items-center w-full max-w-sm mx-auto">
                <div className="font-semibold text-gray-900 mb-3 text-sm md:text-base text-left w-full">Pending Scorecard Review</div>
                {scorecardLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-gray-500">Loading...</div>
                  </div>
                ) : scorecardError ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-red-500 text-center">
                      <div className="text-sm">Error loading data</div>
                      <div className="text-xs mt-1">{scorecardError}</div>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="relative flex items-center justify-center mb-4">
                  <svg
                    width={size * 0.8}
                    height={size * 0.8}
                    viewBox={`0 0 ${size} ${size}`}
                    className="block"
                  >
                    {/* Background Circle */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth={stroke}
                    />
                    {/* Pending Arc (black) */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#0A1833"
                      strokeWidth={stroke}
                      strokeDasharray={`${pendingLength} ${circumference - pendingLength}`}
                      strokeDashoffset={-offsetPending}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                    {/* Reviewed Arc (blue) */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth={stroke}
                      strokeDasharray={`${reviewedLength} ${circumference - reviewedLength}`}
                      strokeDashoffset={-offsetReviewed}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  </svg>
                      <span className="absolute text-2xl font-bold text-gray-800">{pendingPercent}%</span>
                </div>
                <div className="w-full flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <div>
                          <span className="text-gray-700 font-medium text-sm">Pending ({scorecardData.pendingResumes})</span>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-[#0A1833] rounded-full"
                          style={{ width: `${pendingPercent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                          <span className="text-gray-700 font-medium text-sm">Reviewed ({scorecardData.reviewedResumes})</span>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-[#2563EB] rounded-full"
                          style={{ width: `${reviewedPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                      <div className="text-center text-xs text-gray-500 mt-1">
                        Total: {scorecardData.totalResumes}
                </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Recruiter Performance Summary */}
            <div className="bg-[#F7F8FA] rounded-2xl shadow p-2 md:p-3">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-1">
                <div className="font-bold text-gray-900 text-sm md:text-base">Recruiter Performance Summary</div>
              </div>
              <div className="overflow-x-auto">
                {performanceLoading ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : performanceError ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="text-center">
                      <p className="text-red-500 mb-1 text-xs">Error loading performance data</p>
                      <p className="text-xs text-gray-500">{performanceError}</p>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full text-sm text-left">
                    <thead>
                      <tr className="text-gray-500 border-b">
                        <th className="py-1 px-2 font-medium text-xs">Recruiter</th>
                        <th className="py-1 px-2 font-medium text-xs">Total Hires</th>
                        <th className="py-1 px-2 font-medium text-xs">Offers Made</th>
                        <th className="py-1 px-2 font-medium text-xs">Avg TAT (Days)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recruiterPerformanceData.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-2 text-center text-gray-500 text-xs">
                            No recruiter performance data available
                          </td>
                        </tr>
                      ) : (
                        recruiterPerformanceData.map((rec, idx) => (
                          <tr key={idx} className="border-b last:border-b-0">
                            <td className="py-1 px-2 text-gray-900 text-xs">{rec.name}</td>
                            <td className="py-1 px-2 text-xs">{rec.hires}</td>
                            <td className="py-1 px-2 text-xs">{rec.offers}</td>
                            <td className="py-1 px-2 text-xs">{rec.tat}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      {showDetailModal && (
        <RecruiterDetailPage
          recruiterId={detailRecruiterId}
          onClose={() => { setShowDetailModal(false); setDetailRecruiterId(null); }}
          token={token}
        />
      )}
    </div>
  );
} 