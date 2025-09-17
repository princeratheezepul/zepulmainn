import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Bookmark, Briefcase, Info, Calendar } from 'lucide-react';

const JobCard = ({ job, showSubmitButton = false, onBookmarkToggle, isBookmarking = false }) => {
  const navigate = useNavigate();
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

  // Helper function to get status color
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status.includes('Urgent') || status.includes('High')) return 'bg-red-100 text-red-800';
    if (status.includes('Active') || status.includes('Medium')) return 'bg-yellow-100 text-yellow-800';
    if (status.includes('Completed')) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  // Helper function to get status text
  const getStatusText = (status) => {
    if (!status) return 'Open';
    if (status.includes('Urgent') || status.includes('High')) return 'Urgent';
    if (status.includes('Active') || status.includes('Medium')) return 'Active';
    if (status.includes('Completed')) return 'Completed';
    return 'Open';
  };

  // Handle bookmark click
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (isBookmarking || !onBookmarkToggle) return; // Prevent multiple clicks
    
    console.log('JobCard: Bookmark clicked for job:', job._id, 'Current bookmark status:', job.isBookmarked);
    try {
      await onBookmarkToggle(job._id);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle card click to navigate to job details
  const handleCardClick = () => {
    navigate(`/marketplace/jobs/${job._id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg border p-8 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{job.company?.charAt(0)?.toUpperCase() || 'C'}</span>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900">{job.title}</div>
            <div className="text-gray-600 text-lg">{job.company}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
            {getStatusText(job.status)}
          </span>
          <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-800 flex items-center">
            {formatDate(job.postedDate)}
            <Info className="h-3 w-3 ml-1" />
          </span>
          <div 
            onClick={handleBookmarkClick}
            className={`w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
              isBookmarking ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Bookmark 
              className={`h-4 w-4 ${
                job.isBookmarked 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-600'
              }`} 
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          <img src="/money.png" alt="" className="w-3 h-3 mr-1" /> {job.commissionRate || 0}% Commission
        </span>
      </div>

      <div className="text-gray-700 mb-6 leading-relaxed text-sm line-clamp-3">
        {job.description}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg">
            <MapPin className="h-4 w-4 mr-2 text-gray-800" />
            <span className="text-sm text-gray-800 font-medium">{job.location}</span>
          </div>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg">
            <Briefcase className="h-4 w-4 mr-2 text-gray-800" />
            <span className="text-sm text-gray-800 font-medium">{job.type}</span>
          </div>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg">
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-800 font-medium">{job.experience}</span>
          </div>
          <div className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg">  
            <Calendar className="h-4 w-4 mr-2 text-gray-800" />
            <span className="text-sm text-gray-800 font-medium">{formatDate(job.postedDate)}</span>
          </div>
        </div>
        {showSubmitButton && (!job.status || !job.status.includes('High')) && (
          <div className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 hover:shadow-md">
            Submit Candidate
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
