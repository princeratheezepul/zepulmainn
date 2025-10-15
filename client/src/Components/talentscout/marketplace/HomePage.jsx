import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import { useMarketplaceAuth } from '../../../context/MarketplaceAuthContext';

const HomePage = ({ 
  onViewAllPicks
}) => {
  const { fetchJobs, toggleJobBookmark } = useMarketplaceAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [bookmarkingJobs, setBookmarkingJobs] = useState(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    jobsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Load jobs for a specific page
  const loadJobs = async (page = 1) => {
    setIsLoadingJobs(true);
    setJobsError(null);
    
    try {
      const result = await fetchJobs(page, 10);
      
      if (result.success) {
        setJobs(result.jobs);
        setPagination(result.pagination);
        console.log('Jobs loaded successfully:', result.jobs.length, 'Page:', page);
      } else {
        setJobsError(result.error);
        console.error('Failed to load jobs:', result.error);
      }
    } catch (error) {
      setJobsError('Failed to load jobs');
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Fetch jobs on component mount only
  useEffect(() => {
    loadJobs(1);
  }, []); // Empty dependency array - only run once on mount

  // Handle bookmark toggle locally
  const handleBookmarkToggle = async (jobId) => {
    // Prevent multiple simultaneous bookmark operations on the same job
    if (bookmarkingJobs.has(jobId)) {
      console.log('HomePage: Bookmark operation already in progress for job:', jobId);
      return;
    }

    console.log('HomePage: Toggling bookmark for job:', jobId);
    
    // Add job to bookmarking set
    setBookmarkingJobs(prev => new Set(prev).add(jobId));
    
    try {
      const result = await toggleJobBookmark(jobId);
      console.log('HomePage: Bookmark result:', result);
      if (result.success) {
        // Update the local jobs state without refetching
        setJobs(prevJobs => {
          const updatedJobs = prevJobs.map(job => 
            job._id === jobId 
              ? { ...job, isBookmarked: result.isBookmarked }
              : job
          );
          console.log('HomePage: Updated jobs state:', updatedJobs.find(j => j._id === jobId));
          return updatedJobs;
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      // Remove job from bookmarking set
      setBookmarkingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };


  return (
    <div>
      {/* Hero Section */}
      <div  
        className="rounded-xl px-8 py-[1.2rem] mb-3 text-white border"
        style={{
          background: 'linear-gradient(135deg, #1F1F1F 0%, #0066FE 82%, #0E4598 90.25%)',
          borderColor: '#D0D0D8'
        }}
      >
        <div className="text-2xl font-bold mb-1">Explore the best hiring opportunities</div>
        <div className="text-gray-100 opacity-90 text-sm">Browse through verified jobs from trusted recruiters and companies across industries.</div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {isLoadingJobs ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : jobsError ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">Failed to load jobs</div>
            <div className="text-gray-500">{jobsError}</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 mb-2">No jobs found</div>
            <div className="text-gray-500">Check back later for new opportunities</div>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              onBookmarkToggle={handleBookmarkToggle}
              isBookmarking={bookmarkingJobs.has(job._id)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoadingJobs && !jobsError && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => loadJobs(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pagination.hasPrevPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {pagination.totalJobs} total jobs
            </span>
          </div>
          
          <button
            onClick={() => loadJobs(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              pagination.hasNextPage
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
