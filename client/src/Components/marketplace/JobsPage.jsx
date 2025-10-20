import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import JobCard from './JobCard';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';

const JobsPage = ({ activeJobsTab, setActiveJobsTab, onCreateJob, refreshKey = 0 }) => {
  const { fetchPickedJobs, fetchBookmarkedJobs } = useMarketplaceAuth();
  const [pickedJobs, setPickedJobs] = useState([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const jobsTabs = [
    { id: 'Picked Jobs', label: 'Picked Jobs' },
    { id: 'Saved Jobs', label: 'Saved Jobs' }
  ];

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeJobsTab === 'Picked Jobs') {
          const result = await fetchPickedJobs(50);
          if (result.success) {
            setPickedJobs(result.jobs);
          } else {
            console.error('Failed to fetch picked jobs:', result.error);
            setPickedJobs([]);
          }
        } else if (activeJobsTab === 'Saved Jobs') {
          const result = await fetchBookmarkedJobs(50);
          if (result.success) {
            setBookmarkedJobs(result.jobs);
          } else {
            console.error('Failed to fetch bookmarked jobs:', result.error);
            setBookmarkedJobs([]);
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeJobsTab, fetchPickedJobs, fetchBookmarkedJobs, refreshKey]);

  // Get current jobs based on active tab
  const getCurrentJobs = () => {
    switch (activeJobsTab) {
      case 'Picked Jobs':
        return pickedJobs;
      case 'Saved Jobs':
        return bookmarkedJobs;
      default:
        return [];
    }
  };

  const currentJobs = getCurrentJobs();

  return (
    <div>
      {/* Jobs Page Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-2xl font-bold text-gray-900">
            {activeJobsTab === 'Picked Jobs' && 'Jobs picked by you'}
            {activeJobsTab === 'Saved Jobs' && 'Jobs saved by you'}
          </div>

          <div className="flex items-center gap-2">
            {typeof onCreateJob === 'function' && (
              <button
                type="button"
                onClick={onCreateJob}
                className="px-4 py-1.5 rounded-full border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                Create Job
              </button>
            )}
            {jobsTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveJobsTab(tab.id)}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium text-sm ${
                  activeJobsTab === tab.id
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading jobs...</span>
        </div>
      )}

      {/* Jobs Listings */}
      {!isLoading && (
        <div className="space-y-4">
          {currentJobs.length > 0 ? (
            currentJobs.map((job) => (
              <JobCard key={job._id} job={job} showSubmitButton={true} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {activeJobsTab === 'Picked Jobs' && 'No jobs picked yet'}
                {activeJobsTab === 'Saved Jobs' && 'No jobs saved yet'}
              </div>
              <div className="text-gray-400 text-sm">
                {activeJobsTab === 'Picked Jobs' && 'Start picking jobs to see them here'}
                {activeJobsTab === 'Saved Jobs' && 'Bookmark jobs to save them for later'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
