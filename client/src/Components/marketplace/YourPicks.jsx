import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';

const YourPicks = ({ onViewAll }) => {
  const { fetchPickedJobs } = useMarketplaceAuth();
  const navigate = useNavigate();
  const [pickedJobs, setPickedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch picked jobs on component mount
  useEffect(() => {
    const loadPickedJobs = async () => {
      setIsLoading(true);
      try {
        const result = await fetchPickedJobs(8);
        if (result.success) {
          setPickedJobs(result.jobs);
          console.log('Picked jobs loaded:', result.jobs.length);
        }
      } catch (error) {
        console.error('Error loading picked jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPickedJobs();
  }, []);

  // Handle submit button click - navigate to job details
  const handleSubmit = (jobId) => {
    navigate(`/marketplace/jobs/${jobId}`);
  };

  // Helper function to format date
  const formatDate = (date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffTime = Math.abs(now - jobDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return `${Math.ceil(diffDays / 30)}mo ago`;
  };

  return (
    <div className="w-80 hidden lg:block">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold text-gray-900">Your Picks</div>
          <div 
            onClick={onViewAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            View All
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pickedJobs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No picked jobs yet</div>
              <div className="text-gray-400 text-sm">Pick jobs to see them here</div>
            </div>
          ) : (
            pickedJobs.map((job) => (
              <div key={job._id} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300 max-w-md">
                {/* Header with logo, title and time */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-red-500 to-green-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{job.company?.charAt(0)?.toUpperCase() || 'C'}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-xs leading-tight whitespace-nowrap">{job.title}</div>
                      <div className="text-gray-600 text-sm mt-1">{job.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="text-sm text-gray-400 font-medium whitespace-nowrap">{formatDate(job.postedDate)}</span>
                  </div>
                </div>

              {/* Location and Job Type */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Briefcase className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-sm font-medium">{job.type}</span>
                </div>
              </div>

              {/* Bottom section with submitted count and submit button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{job.totalApplications}</span>
                </div>
                <div 
                  onClick={() => handleSubmit(job._id)}
                  className="px-6 py-2.5 bg-white border-2 border-blue-600 text-blue-600 text-sm font-semibold rounded-full  transition-all duration-200 hover:shadow-md cursor-pointer"
                >
                  Submit
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default YourPicks;
