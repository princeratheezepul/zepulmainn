import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Bookmark, Briefcase, Info, Calendar } from 'lucide-react';
import JobCard from './JobCard';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';

const SearchResults = ({ searchQuery, onBackToHome }) => {
  const { searchJobs, toggleJobBookmark } = useMarketplaceAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    jobsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [bookmarkingJobs, setBookmarkingJobs] = useState(new Set());

  // Search filters state with default values
  const [filters, setFilters] = useState({
    location: 'Any',
    datePosted: 'All Time',
    experience: 'Any Experience',
    employmentType: 'Any'
  });

  // Filtered jobs state
  const [filteredJobs, setFilteredJobs] = useState([]);

  // Filter jobs based on current filters
  const applyFilters = (jobsToFilter) => {
    console.log('Applying filters to', jobsToFilter.length, 'jobs');
    console.log('Current filters:', filters);
    
    return jobsToFilter.filter(job => {
      let passes = true;
      
      // Location filter - use 'type' field (remote, onsite, hybrid)
      if (filters.location !== 'Any') {
        const jobType = job.type;
        const filterLocation = filters.location;
        
        console.log(`Location check: filter="${filterLocation}" vs job.type="${jobType}"`);
        
        if (filterLocation === 'Remote' && jobType !== 'remote') {
          console.log('Failed location filter: Remote');
          passes = false;
        }
        if (filterLocation === 'Onsite' && jobType !== 'onsite') {
          console.log('Failed location filter: Onsite');
          passes = false;
        }
        if (filterLocation === 'Hybrid' && jobType !== 'hybrid') {
          console.log('Failed location filter: Hybrid');
          passes = false;
        }
      }

      // Date posted filter - use 'createdAt' field
      if (filters.datePosted !== 'All Time') {
        if (!job.createdAt) {
          console.log('Failed date filter: No createdAt');
          passes = false;
        } else {
          const jobDate = new Date(job.createdAt);
          const now = new Date();
          const diffInHours = (now - jobDate) / (1000 * 60 * 60);
          
          console.log(`Date check: filter="${filters.datePosted}" vs diffInHours=${diffInHours}`);
          
          if (filters.datePosted === 'Less than 24 hour' && diffInHours > 24) {
            console.log('Failed date filter: Less than 24 hour');
            passes = false;
          }
          if (filters.datePosted === 'Last 3 days' && diffInHours > 72) {
            console.log('Failed date filter: Last 3 days');
            passes = false;
          }
          if (filters.datePosted === 'Last 7 days' && diffInHours > 168) {
            console.log('Failed date filter: Last 7 days');
            passes = false;
          }
        }
      }

      // Experience filter - use 'experience' field (number)
      if (filters.experience !== 'Any Experience') {
        const jobExperience = job.experience;
        
        console.log(`Experience check: filter="${filters.experience}" vs job.experience=${jobExperience}`);
        
        if (filters.experience === 'No Experience' && jobExperience !== 0) {
          console.log('Failed experience filter: No Experience');
          passes = false;
        }
      }

      // Employment type filter - use 'employmentType' field
      if (filters.employmentType !== 'Any') {
        const jobEmploymentType = job.employmentType;
        const filterType = filters.employmentType;
        
        console.log(`Employment type check: filter="${filterType}" vs job.employmentType="${jobEmploymentType}"`);
        
        if (filterType === 'Full-time' && jobEmploymentType !== 'Full-time') {
          console.log('Failed employment type filter: Full-time');
          passes = false;
        }
        if (filterType === 'Contract' && jobEmploymentType !== 'Contract') {
          console.log('Failed employment type filter: Contract');
          passes = false;
        }
        if (filterType === 'Part-time' && jobEmploymentType !== 'Part-time') {
          console.log('Failed employment type filter: Part-time');
          passes = false;
        }
      }

      console.log(`Job ${job._id} passes filters:`, passes);
      return passes;
    });
  };

  // Load search results
  const loadSearchResults = async (page = 1) => {
    if (!searchQuery || searchQuery.trim() === '') {
      setJobs([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchJobs(searchQuery, page, 10);
      
      if (result.success) {
        setJobs(result.jobs);
        setPagination(result.pagination);
        // Apply filters to the new jobs
        const filtered = applyFilters(result.jobs);
        setFilteredJobs(filtered);
        console.log('Search results loaded successfully:', result.jobs.length, 'Filtered:', filtered.length, 'Page:', page);
        console.log('Sample job data:', result.jobs[0]);
        console.log('Current filters:', filters);
      } else {
        setError(result.error);
        console.error('Failed to load search results:', result.error);
      }
    } catch (error) {
      setError('Failed to load search results');
      console.error('Error loading search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load search results on component mount and when search query changes
  useEffect(() => {
    loadSearchResults(1);
  }, [searchQuery]);

  // Re-apply filters when filter state changes
  useEffect(() => {
    if (jobs.length > 0) {
      const filtered = applyFilters(jobs);
      setFilteredJobs(filtered);
      console.log('Filters applied:', filters, 'Filtered jobs:', filtered.length);
      console.log('Sample job being filtered:', jobs[0]);
    }
  }, [filters, jobs]);

  // Handle bookmark toggle locally
  const handleBookmarkToggle = async (jobId) => {
    // Prevent multiple simultaneous bookmark operations on the same job
    if (bookmarkingJobs.has(jobId)) {
      console.log('SearchResults: Bookmark operation already in progress for job:', jobId);
      return;
    }

    console.log('SearchResults: Toggling bookmark for job:', jobId);
    setBookmarkingJobs(prev => new Set(prev).add(jobId));

    try {
      const result = await toggleJobBookmark(jobId);
      
      if (result.success) {
        // Update the job's bookmark status in the local state
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job._id === jobId 
              ? { ...job, isBookmarked: result.isBookmarked }
              : job
          )
        );
        // Also update filtered jobs
        setFilteredJobs(prevFiltered => 
          prevFiltered.map(job => 
            job._id === jobId 
              ? { ...job, isBookmarked: result.isBookmarked }
              : job
          )
        );
        console.log('SearchResults: Bookmark toggled successfully for job:', jobId, 'New status:', result.isBookmarked);
      } else {
        console.error('SearchResults: Failed to toggle bookmark:', result.error);
      }
    } catch (error) {
      console.error('SearchResults: Error toggling bookmark:', error);
    } finally {
      setBookmarkingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    loadSearchResults(newPage);
  };

  if (!searchQuery || searchQuery.trim() === '') {
    return (
      <div className="flex-1 ml-64 p-6">
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-gray-600 mb-4">No search query</div>
          <div className="text-gray-500 mb-6">Enter a search term to find jobs</div>
          <div
            onClick={onBackToHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Search Results Header */}
      <div className="px-3 py-1">
        <div className="mb-1">
          <div className="text-2xl font-bold text-gray-900">
            {filteredJobs.length} Jobs Found for "{searchQuery}"
            {filteredJobs.length !== pagination.totalJobs && (
              <span className="text-lg font-normal text-gray-500 ml-2">
                (filtered from {pagination.totalJobs} total)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Filters Sidebar */}
        <div className="w-60 bg-white border border-gray-200  rounded-lg px-3 py-3 m-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-gray-900">Filters</div>
            <Info className="h-4 w-4 text-gray-400" />
          </div>

          {/* Location Filter */}
          <div className="mb-2 border-b border-gray-200">
            <div className="font-medium text-gray-700 mb-1.5">Location</div>
            <div className="grid space-y-4 mb-3">
              {['Any', 'Remote', 'Onsite', 'Hybrid'].map((option) => (
                <label key={option} className="flex items-center mb-0">
                  <input
                    type="radio"
                    name="location"
                    value={option}
                    checked={filters.location === option}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="mr-3"
                  />
                  <span className="text-sm ml-2 text-gray-600">{option}</span>
                </label>
              ))}
            </div>
          </div>

          

          {/* Date Posted Filter */}
          <div className="mb-2 border-b border-gray-200">
            <div className="font-medium text-gray-700 mb-1.5">Date of Posting</div>
            <div className="grid space-y-4 mb-3">
              {['All Time', 'Less than 24 hour', 'Last 3 days', 'Last 7 days'].map((period) => (
                <label key={period} className="flex items-center mb-0">
                  <input
                    type="radio"
                    name="datePosted"
                    value={period}
                    checked={filters.datePosted === period}
                    onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.value }))}
                    className="mr-3"
                  />
                  <span className="text-sm ml-2 text-gray-600">{period}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Work Experience Filter */}
          <div className="mb-2 border-b border-gray-200">
            <div className="font-medium text-gray-700 mb-1.5">Work Experience</div>
            <div className="grid space-y-4 mb-3">
              {['No Experience', 'Any Experience'].map((exp) => (
                <label key={exp} className="flex items-center mb-0">
                  <input
                    type="radio"
                    name="experience"
                    value={exp}
                    checked={filters.experience === exp}
                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                    className="mr-3"
                  />
                  <span className="text-sm ml-2 text-gray-600">{exp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type Filter */}
          <div className="mb-2 border-gray-200">
            <div className="font-medium text-gray-700 mb-1.5">Type of Employment</div>
            <div className="grid space-y-4 mb-3">
              {['Any', 'Full-time', 'Contract', 'Part-time'].map((type) => (
                <label key={type} className="flex items-center mb-0">
                  <input
                    type="radio"
                    name="employmentType"
                    value={type}
                    checked={filters.employmentType === type}
                    onChange={(e) => setFilters(prev => ({ ...prev, employmentType: type }))}
                    className="mr-3"
                  />
                  <span className="text-sm ml-2 text-gray-600">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 px-1 py-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <div
                onClick={() => loadSearchResults(pagination.currentPage)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl font-semibold text-gray-600 mb-2">No jobs found matching your filters</div>
              <div className="text-gray-500 mb-4">Try adjusting your search terms or filters</div>
              <div
                onClick={onBackToHome}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onBookmarkToggle={handleBookmarkToggle}
                  isBookmarking={bookmarkingJobs.has(job._id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <div
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </div>
              
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <div
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
