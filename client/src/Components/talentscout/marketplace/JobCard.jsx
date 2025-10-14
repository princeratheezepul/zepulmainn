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
    navigate(`/talentscout/marketplace/jobs/${job._id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg border p-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">{job.company?.charAt(0)?.toUpperCase() || 'C'}</span>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{job.title}</div>
            <div className="text-gray-600 font-medium text-md">{job.company}</div>
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

      <div className="mb-1">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          <img src="/money.png" alt="" className="w-3 h-3 mr-1" /> {job.commissionRate || 0}% Commission
        </span>
      </div>

      <div className="text-gray-700 mb-2 leading-relaxed text-sm line-clamp-3">
        {job.description}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center px-2 py-1 bg-white border border-gray-200 rounded-2xl">
            <MapPin className="h-4 w-4 mr-1 text-gray-800" />
            <span className="text-sm text-gray-800 font-medium">{job.location}</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-white border border-gray-200 rounded-2xl">
            <Briefcase className="h-4 w-4 mr-1 text-gray-800" />
            <span className="text-sm text-gray-800 font-medium">{job.type}</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-white border border-gray-200 rounded-2xl">
            {/* <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            </div> */}
            <svg width="15" height="14" viewBox="0 0 15 14" className='mr-1' fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M1.69074 12.4444C1.3513 12.4444 1.06811 12.3247 0.841158 12.0851C0.614211 11.8456 0.500491 11.5464 0.5 11.1876V3.59022C0.5 3.23193 0.613719 2.933 0.841158 2.69345C1.0686 2.45389 1.35154 2.33385 1.69 2.33333H4.92105V1.25611C4.92105 0.898335 5.03477 0.599409 5.26221 0.359335C5.48965 0.119261 5.77284 -0.000516842 6.11179 1.67625e-06H8.1521C8.49105 1.67625e-06 8.77424 0.119779 9.00168 0.359335C9.22912 0.59889 9.3426 0.897816 9.3421 1.25611V2.33333H12.5732C12.9121 2.33333 13.1951 2.45337 13.422 2.69345C13.6489 2.93352 13.7627 3.23245 13.7632 3.59022V6.32722C13.7632 6.43767 13.728 6.52685 13.6578 6.59478C13.5875 6.6627 13.4999 6.69641 13.3947 6.69589C13.2896 6.69537 13.2019 6.6583 13.1317 6.58467C13.0614 6.51104 13.0263 6.41874 13.0263 6.30778V3.59022C13.0263 3.45022 12.9838 3.33537 12.8988 3.24567C12.8139 3.15596 12.7053 3.11111 12.5732 3.11111H1.69C1.55786 3.11111 1.4493 3.15596 1.36432 3.24567C1.27933 3.33537 1.23684 3.45022 1.23684 3.59022V11.1883C1.23684 11.3278 1.27933 11.4424 1.36432 11.5321C1.4493 11.6218 1.55811 11.6667 1.69074 11.6667H6.9901C7.09474 11.6667 7.18242 11.7037 7.25316 11.7779C7.32389 11.852 7.35902 11.9446 7.35852 12.0556C7.35803 12.1665 7.32291 12.2591 7.25316 12.3332C7.1834 12.4074 7.09572 12.4444 6.9901 12.4444H1.69074ZM5.65789 2.33333H8.60526V1.25611C8.60526 1.11663 8.56277 1.00204 8.47779 0.912335C8.39281 0.822631 8.28424 0.777779 8.1521 0.777779H6.11105C5.97891 0.777779 5.87035 0.822631 5.78537 0.912335C5.70039 1.00204 5.65789 1.11663 5.65789 1.25611V2.33333ZM11.5526 14C10.7318 14 10.0355 13.6982 9.46368 13.0947C8.8914 12.4901 8.60526 11.7548 8.60526 10.8889C8.60526 10.023 8.8914 9.28796 9.46368 8.68389C10.036 8.07981 10.7323 7.77778 11.5526 7.77778C12.373 7.77778 13.0695 8.07981 13.6423 8.68389C14.2151 9.28796 14.501 10.023 14.5 10.8889C14.499 11.7548 14.2131 12.4901 13.6423 13.0947C13.0715 13.6993 12.3749 14.001 11.5526 14ZM11.8363 10.7637V8.94444C11.8363 8.86096 11.8088 8.79018 11.7538 8.73211C11.6988 8.67404 11.6317 8.64526 11.5526 8.64578C11.4735 8.6463 11.4065 8.67507 11.3515 8.73211C11.2965 8.78915 11.2692 8.85993 11.2697 8.94444V10.759C11.2697 10.8425 11.2832 10.9203 11.3102 10.9923C11.3377 11.0649 11.3836 11.1349 11.448 11.2023L12.5673 12.3846C12.6223 12.4426 12.6871 12.474 12.7618 12.4787C12.836 12.4839 12.9052 12.4525 12.9696 12.3846C13.0339 12.3166 13.0659 12.2458 13.0654 12.1722C13.0649 12.0986 13.0329 12.0278 12.9696 11.9599L11.8363 10.7637Z" fill="black"/>
            </svg>

            <span className="text-sm text-gray-800 font-medium">{job.experience}</span>
          </div>
          <div className="flex items-center px-3 py-1 bg-white border border-gray-200 rounded-2xl">  
            <Calendar className="h-4 w-4 mr-1 text-gray-800" />
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
