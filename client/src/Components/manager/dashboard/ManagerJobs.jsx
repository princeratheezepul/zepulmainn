import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobDetails from '../../recruiter/dashboard/JobDetails.jsx';
import CandidateList from '../../recruiter/dashboard/CandidateList.jsx';
import CreateJobManager from '../../recruiter/dashboard/CreateJobManager.jsx';
import CreateJobOptions from '../../recruiter/dashboard/CreateJobOptions.jsx';
import CreateJobFromJD from '../../recruiter/dashboard/CreateJobFromJD.jsx';
import JobSidebar from '../../recruiter/dashboard/JobSidebar.jsx';
import EditJobPanel from '../../recruiter/dashboard/EditJobPanel.jsx';
import JobChatAgent from '../../../Pages/JobChatAgent.jsx';
import DescribeJob from '../../../Pages/DescribeJob.jsx';
import ManagerJobCard from './ManagerJobCard.jsx';
import { Card, PageHead, PrimaryButton, GhostButton, LoadingRow } from '../../dashboard/DashboardUI';

/**
 * The manager's requirements list. Forked from the shared recruiter Jobs screen so
 * the manager console can carry the platform design without changing how the
 * ProRecruiter dashboard — the shared screen's other consumer — looks. All the
 * create / edit / detail flows are the same components.
 */
const ManagerJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobCounts, setJobCounts] = useState({ all: 0, opened: 0, urgent: 0, closed: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCandidateList, setShowCandidateList] = useState(false);
  // null = jobs list. 'choose' = pick a creation method, then one of
  // 'manual' | 'chat' | 'voice' for the flow the user picked.
  const [createJobMode, setCreateJobMode] = useState(null);
  const [showEditJob, setShowEditJob] = useState(false);

  // Fetch jobs on component mount and when page/filter changes
  useEffect(() => {
    fetchJobs();
    fetchJobCounts();
  }, [currentPage, activeFilter]);

  // Make fetchJobs available globally for other components
  useEffect(() => {
    window.refreshJobs = () => {
      fetchJobs();
      fetchJobCounts();
    };
    return () => {
      delete window.refreshJobs;
    };
  }, [currentPage, activeFilter]);

  const fetchJobs = async () => {
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

      // Use the manager jobs endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/get-jobs/${managerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let filteredJobs = data.jobs || [];
        
        // Sort jobs by most recent first
        filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Apply client-side filtering based on activeFilter
        if (activeFilter !== 'all') {
          filteredJobs = filteredJobs.filter(job => {
            // Check if hiring deadline has passed
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            
            switch (activeFilter) {
              case 'opened':
                return !job.isClosed && !isDeadlinePassed;
              case 'urgent':
                return job.priority && job.priority.includes('High') && !job.isClosed && !isDeadlinePassed;
              case 'closed':
                return job.isClosed || isDeadlinePassed;
              default:
                return true;
            }
          });
        }

        // Apply pagination
        const itemsPerPage = 10;
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
        
        setJobs(paginatedJobs);
        setTotalJobs(filteredJobs.length);
        setTotalPages(Math.ceil(filteredJobs.length / itemsPerPage));
      } else {
        console.error('Failed to fetch jobs');
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCounts = async () => {
    try {
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

      // Fetch all jobs to calculate counts
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
        
        const counts = {
          all: allJobs.length,
          opened: allJobs.filter(job => {
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            return !job.isClosed && !isDeadlinePassed;
          }).length,
          urgent: allJobs.filter(job => {
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            return job.priority && job.priority.includes('High') && !job.isClosed && !isDeadlinePassed;
          }).length,
          closed: allJobs.filter(job => {
            const isDeadlinePassed = job.hiringDeadline ? new Date(job.hiringDeadline) < new Date() : false;
            return job.isClosed || isDeadlinePassed;
          }).length
        };
        
        setJobCounts(counts);
      } else {
        console.error('Failed to fetch job counts');
      }
    } catch (error) {
      console.error('Error fetching job counts:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getFilterCounts = () => {
    return jobCounts;
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  // The applicants count on a card skips job details and opens that job's candidate list.
  const handleShowJobCandidates = (job) => {
    navigate(`/manager/jobs/${job._id || job.id}/candidates`);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setShowCandidateList(false);
    setShowEditJob(false);
  };

  const handleShowCandidates = () => {
    setShowCandidateList(true);
    setShowEditJob(false);
  };

  const handleBackToJobDetails = () => {
    setShowCandidateList(false);
    setShowEditJob(false);
  };

  const handleShowEditJob = () => {
    setShowEditJob(true);
    setShowCandidateList(false);
  };

  const handleBackFromEditJob = () => {
    setShowEditJob(false);
  };

  const handleJobUpdated = (updatedJob) => {
    // Update the selected job with the new data
    setSelectedJob(updatedJob);
    
    // Refresh the jobs list to reflect changes
    fetchJobs();
    fetchJobCounts();
  };

  // Leaving any of the create-job flows drops back to the refreshed jobs list.
  const closeCreateJob = () => {
    setCreateJobMode(null);
    fetchJobs();
    fetchJobCounts();
  };

  if (createJobMode) {
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA]">
        {createJobMode === 'choose' && (
          <CreateJobOptions
            onSelect={setCreateJobMode}
            onBack={() => setCreateJobMode(null)}
          />
        )}
        {createJobMode === 'manual' && (
          <CreateJobManager
            onBack={() => setCreateJobMode('choose')}
            onCreated={closeCreateJob}
          />
        )}
        {createJobMode === 'chat' && (
          <div className="min-h-screen flex items-center justify-center p-4">
            <JobChatAgent
              onBack={() => setCreateJobMode('choose')}
              onComplete={closeCreateJob}
            />
          </div>
        )}
        {createJobMode === 'voice' && (
          <DescribeJob onBack={() => setCreateJobMode('choose')} onDone={closeCreateJob} />
        )}
        {createJobMode === 'upload' && (
          <CreateJobFromJD
            onBack={() => setCreateJobMode('choose')}
            onCreated={closeCreateJob}
          />
        )}
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="p-5 md:p-7 max-w-[1500px] relative">
      <PageHead
        eyebrow="Requirements"
        title="Jobs & Requirements"
        sub="Create, publish and monitor Zepul-managed hiring requirements"
        action={<PrimaryButton onClick={() => setCreateJobMode('choose')}>+ Create Job</PrimaryButton>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all', label: 'All Jobs', count: filterCounts.all },
          { key: 'opened', label: 'Open', count: filterCounts.opened },
          { key: 'urgent', label: 'Urgent', count: filterCounts.urgent },
          { key: 'closed', label: 'Closed', count: filterCounts.closed },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => handleFilterChange(f.key)}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border ${
              activeFilter === f.key
                ? 'bg-[#eaf0ff] text-[#024bff] border-[#c7d5ff]'
                : 'bg-white text-[#778092] border-[#e7ebf2] hover:bg-[#f6f8fb]'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingRow label="Loading requirements…" />
      ) : jobs.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">
          {activeFilter === 'all'
            ? 'No requirements yet. Create your first job.'
            : `No ${activeFilter} requirements found.`}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {jobs.map((job) => (
            <ManagerJobCard
              key={job._id || job.id}
              job={job}
              onClick={handleJobClick}
              onShowCandidates={handleShowJobCandidates}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-5">
          <GhostButton onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}>
            Previous
          </GhostButton>
          <span className="px-3 text-xs text-[#778092]">
            Page {currentPage} of {totalPages}
          </span>
          <GhostButton onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}>
            Next
          </GhostButton>
        </div>
      )}

      {/* Sidebar for Job Details */}
      <JobSidebar open={!!selectedJob} onClose={handleBack}>
        {selectedJob && !showCandidateList && !showEditJob && (
          <JobDetails
            job={selectedJob}
            onBack={handleBack}
            onShowCandidates={handleShowCandidates}
            onShowEditJob={handleShowEditJob}
            onJobUpdated={handleJobUpdated}
          />
        )}
        {selectedJob && showCandidateList && (
          <CandidateList job={selectedJob} onBack={handleBackToJobDetails} />
        )}
        {selectedJob && showEditJob && (
          <EditJobPanel job={selectedJob} onBack={handleBackFromEditJob} onJobUpdated={handleJobUpdated} />
        )}
      </JobSidebar>
    </div>
  );
};

export default ManagerJobs;
