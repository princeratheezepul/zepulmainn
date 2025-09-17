import React from 'react';

const PartnerCard = ({ partner, onViewCandidates }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow relative">
      <div className="flex items-start space-x-4">
        {/* Partner Icon */}
        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Partner Details */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{partner.name}</h3>
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-600 text-sm">{partner.location}</span>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {partner.description}
          </p>

          {/* Metrics Tags */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {partner.candidatesSubmitted} Candidates Submitted
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {partner.placementSuccess}% Placement Success
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {partner.redFlagCandidates} Red Flag Candidates
            </span>
          </div>
        </div>
      </div>

      {/* View Candidate List Button - Bottom Right */}
      <div className="absolute bottom-6 right-6">
        <button 
          onClick={() => onViewCandidates && onViewCandidates(partner)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          View Candidate List
        </button>
      </div>
    </div>
  );
};

export default PartnerCard;
