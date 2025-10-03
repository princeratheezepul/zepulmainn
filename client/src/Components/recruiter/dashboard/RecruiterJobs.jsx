import React, { useState, useEffect } from 'react';
import RecruiterJobCard from './RecruiterJobCard';
import JobSidebar from './JobSidebar';
import JobDetailsView from './JobDetailsView';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../../hooks/useApi';

const RecruiterJobs = () => {
  const { get } = useApi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobCounts, setJobCounts] = useState({ all: 0, opened: 0, urgent: 0, closed: 0 });
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const navigate = useNavigate();

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
      if (!userInfo?.data?.user?._id) {
        console.error('No user info found');
        return;
      }

      // Use the recruiter assigned jobs endpoint with useApi hook
      const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/assigned-jobs`);

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
      if (!userInfo?.data?.user?._id) {
        console.error('No user info found');
        return;
      }

      // Fetch assigned jobs to calculate counts with useApi hook
      const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/assigned-jobs`);

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

  const filterCounts = getFilterCounts();

  const handleJobClick = (job) => {
    navigate(`/recruiter/jobs/${job._id || job.id}`);
  };

  return (
    <div className="bg-white py-0 min-h-screen relative">
      {/* Jobs List Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-betweenborder-gray-200 gap-4">
        <div className="flex flex-col justify-center">
          <div className="text-lg font-bold text-black mb-0">Jobs</div>
          <p className="text-xs text-gray-500">Manage and track all your job posting here</p>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex gap-2 flex-wrap">
            <div 
              className={`rounded-lg px-3 py-1 mb-0 text-xs font-semibold border hover:shadow border-black cursor-pointer transition-colors ${
                activeFilter === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All Jobs ({filterCounts.all})
            </div>
            <div 
              className={`rounded-lg px-3 py-1 text-xs font-semibold border hover:shadow border-black cursor-pointer transition-colors ${
                activeFilter === 'opened' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('opened')}
            >
              Opened Jobs ({filterCounts.opened})
            </div>
            <div 
              className={`rounded-lg px-3 py-1 text-xs font-semibold border hover:shadow border-black cursor-pointer transition-colors ${
                activeFilter === 'urgent' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('urgent')}
            >
              Urgent ({filterCounts.urgent})
            </div>
            <div 
              className={`rounded-lg px-3 py-1 text-xs font-semibold border hover:shadow border-black cursor-pointer transition-colors ${
                activeFilter === 'closed' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
              onClick={() => handleFilterChange('closed')}
            >
              Closed Jobs ({filterCounts.closed})
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div>
            {jobs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {activeFilter === 'all' ? 'No jobs found. Create your first job!' : `No ${activeFilter} jobs found.`}
              </div>
            ) : (
              jobs.map((job) => (
                <RecruiterJobCard key={job._id || job.id} job={job} onClick={handleJobClick} />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecruiterJobs; 