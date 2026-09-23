import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminJobCard from './AdminJobCard';
import AdminJobDetails from './AdminJobDetails';
import AdminCandidateList from './AdminCandidateList';
import AdminCreateJob from './AdminCreateJob';
import AdminJobSidebar from './AdminJobSidebar';
import { Card, PageHead, PrimaryButton, GhostButton, LoadingRow } from './AdminUI';

const AdminJobs = () => {
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
  const [showCreateJob, setShowCreateJob] = useState(false);

  // Fetch jobs on component mount and when page/filter changes
  useEffect(() => {
    fetchJobs();
    fetchJobCounts();
  }, [currentPage, activeFilter]);

  // Make fetchJobs available globally for other components
  useEffect(() => {
    window.refreshAdminJobs = () => {
      fetchJobs();
      fetchJobCounts();
    };
    return () => {
      delete window.refreshAdminJobs;
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
      const adminId = userInfo?.data?.user?._id;
      if (!adminId) {
        console.error('No adminId found in user info');
        return;
      }

      // Use the admin jobs endpoint
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/get-jobs/${adminId}`, {
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
      const adminId = userInfo?.data?.user?._id;
      if (!adminId) {
        console.error('No adminId found in user info');
        return;
      }

      // Fetch all jobs to calculate counts (all jobs in database)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/get-jobs/${adminId}`, {
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
    navigate(`/admin/jobs/${job._id}`);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setShowCandidateList(false);
  };

  const handleShowCandidates = () => {
    setShowCandidateList(true);
  };

  const handleBackToJobDetails = () => {
    setShowCandidateList(false);
  };

  const handleJobUpdated = (updatedJob) => {
    // Update the selected job with the new data
    setSelectedJob(updatedJob);
    
    // Refresh the jobs list to reflect changes
    fetchJobs();
    fetchJobCounts();
  };

  if (showCreateJob) {
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA]">
        <AdminCreateJob onBack={() => setShowCreateJob(false)} />
      </div>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <div className="p-5 md:p-7 max-w-[1500px] relative">
      <PageHead
        eyebrow="Platform"
        title="All Jobs"
        sub="Every requirement raised across Zepul — by admins, managers and account managers"
        action={<PrimaryButton onClick={() => setShowCreateJob(true)}>+ Create Job</PrimaryButton>}
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
        <LoadingRow label="Loading jobs…" />
      ) : jobs.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">
          {activeFilter === 'all'
            ? 'No jobs found in the system. Create your first job.'
            : `No ${activeFilter} jobs found.`}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {jobs.map((job) => (
            <AdminJobCard key={job._id || job.id} job={job} onClick={handleJobClick} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
      <AdminJobSidebar open={!!selectedJob} onClose={handleBack}>
        {selectedJob && !showCandidateList && (
          <AdminJobDetails job={selectedJob} onBack={handleBack} onShowCandidates={handleShowCandidates} onJobUpdated={handleJobUpdated} />
        )}
        {selectedJob && showCandidateList && (
          <AdminCandidateList job={selectedJob} onBack={handleBackToJobDetails} />
        )}
      </AdminJobSidebar>
    </div>
  );
};

export default AdminJobs; 