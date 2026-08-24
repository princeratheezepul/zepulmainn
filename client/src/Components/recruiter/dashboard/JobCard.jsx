import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Calendar, Users } from 'lucide-react';

const JobCard = ({ job, onClick, onShowCandidates }) => {
  const navigate = useNavigate();
  // Function to truncate description to 3 lines
  const truncateDescription = (text, maxLines = 3) => {
    if (!text) return '';
    const lines = text.split('\n');
    const truncatedLines = lines.slice(0, maxLines);
    const result = truncatedLines.join('\n');
    return result + (lines.length > maxLines ? '...' : '');
  };

  // Function to get company display info
  const getCompanyDisplay = () => {
    if (job.company) {
      // If job has company name, show it
      return {
        type: 'letter',
        content: job.company.charAt(0)?.toUpperCase() || 'C',
        name: job.company
      };
    } else if (job.companyId) {
      // If company has a logo, show it, otherwise show first letter
      return {
        type: 'logo',
        content: job.companyLogo || job.companyName?.charAt(0)?.toUpperCase() || 'C',
        name: job.companyName || 'Company'
      };
    } else {
      // Admin created job
      return {
        type: 'letter',
        content: 'A',
        name: 'Admin'
      };
    }
  };

  // Function to check if hiring deadline has passed
  const isDeadlinePassed = () => {
    if (job.hiringDeadline) {
      const deadlineDate = new Date(job.hiringDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      return deadlineDate < today;
    }
    return false;
  };

  // Function to determine job status badge
  const getJobStatus = () => {
    // Check if job is closed
    if (job.isClosed) {
      return { text: 'Close', className: 'bg-gray-200 text-gray-700' };
    }
    
    // Check if hiring deadline has passed
    if (job.hiringDeadline) {
      const deadlineDate = new Date(job.hiringDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
      
      if (deadlineDate < today) {
        return { text: 'Close', className: 'bg-red-100 text-red-700' };
      }
    }
    
    // Check if priority is high (urgent)
    if (job.priority && job.priority.includes('High')) {
      return { text: 'Urgent', className: 'bg-yellow-100 text-yellow-700' };
    }
    
    // Check if job was created within 7 days (new)
    const createdAt = new Date(job.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) {
      return { text: 'New', className: 'bg-green-100 text-green-700' };
    }
    
    return null; // No status badge
  };

  const companyInfo = getCompanyDisplay();
  const jobStatus = getJobStatus();

  return (
    <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100 mb-1.5 flex flex-col relative cursor-pointer" onClick={() => onClick(job)}>
      <div className="absolute top-2 right-3">
        {jobStatus && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${jobStatus.className}`}>
            {jobStatus.text}
          </span>
        )}
      </div>
      <div className="pr-14">
        <div className="text-sm font-bold text-gray-800 leading-tight">{job.jobtitle}</div>
        <p className="text-gray-600 mt-0.5 text-xs leading-snug max-w-2xl whitespace-pre-line" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {truncateDescription(job.description)}
        </p>
      </div>
      <div className="mt-1.5 flex justify-between items-center gap-3">
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            {companyInfo.type === 'logo' && job.companyLogo ? (
              <img src={job.companyLogo} alt={companyInfo.name} className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-semibold">
                {companyInfo.content}
              </div>
            )}
            <span className="font-medium text-gray-700">{companyInfo.name}</span>
          </div>
          <div className="flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5">
            <MapPin size={12} className="text-gray-400" />
            <span>{job.type} - {job.location}</span>
          </div>
          <div className="flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5">
            <Briefcase size={12} className="text-gray-400" />
            <span>{job.employmentType || 'Full-time'} • {job.openpositions || 1} opening{job.openpositions !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1 border border-gray-200 rounded px-1.5 py-0.5">
            <Calendar size={12} className="text-gray-400" />
            <span>Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }) : 'N/A'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Opens this job's candidate list directly, when the parent wires it up. */}
          <div
            className={`flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 font-medium px-2 py-1 rounded-md ${onShowCandidates ? 'cursor-pointer hover:bg-gray-200 hover:text-gray-900' : ''}`}
            onClick={onShowCandidates ? (e) => { e.stopPropagation(); onShowCandidates(job); } : undefined}
            role={onShowCandidates ? 'button' : undefined}
            title={onShowCandidates ? 'View candidate list' : undefined}
          >
            <Users size={14} className="text-gray-500"/>
            <span>{job.totalApplication_number || 0} Applicants Submitted</span>
          </div>
          {/* Assigned Recruiters */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-blue-50 font-medium px-2 py-1 rounded-md">
            <Users size={14} className="text-blue-500"/>
            <span>{job.assignedRecruiters?.length || 0} Recruiter{(job.assignedRecruiters?.length || 0) !== 1 ? 's' : ''} Assigned</span>
          </div>
          {!job.isClosed && !isDeadlinePassed() && (
            <button 
              className="bg-blue-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-blue-700 transition-colors text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/manager/jobs/${job._id || job.id}`);
              }}
            >
              View Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard; 