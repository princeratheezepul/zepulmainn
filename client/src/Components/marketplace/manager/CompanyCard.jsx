import React from 'react';

const CompanyCard = ({ company, onViewJobs }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2.5 hover:shadow-md transition-shadow relative">
      <div className="flex items-start space-x-4">
        {/* Company Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">{company.name?.charAt(0)?.toUpperCase() || 'C'}</span>
          </div>
        </div>

        {/* Company Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">
                {company.name}
              </h5>
              
              {/* Location */}
              <div className="flex items-center text-gray-600 mb-2">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{company.location}</span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                {company.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-white text-gray-900 rounded-xl border border-gray-300 px-3 py-1 text-xs">
                  {company.industry}
                </span>
                <span className="bg-white text-gray-900 rounded-xl border border-gray-300 px-3 py-1 text-xs">
                  {company.activeJobs} Active Jobs
                </span>
                <span className="bg-white text-gray-900 rounded-xl border border-gray-300 px-3 py-1 text-xs">
                  {company.hiresMade} Hires Made
                </span>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex flex-col items-end space-y-4">
              {/* Menu Button */}
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Jobs Button - Bottom Right */}
      <div className="absolute bottom-6 right-6 text-sm">
        <button style={{ borderRadius: "10px" }}
          className="px-4 py-1 border-1 border-blue-500 font-semibold text-blue-500 rounded-lg hover:bg-blue-700 hover:text-white transition-colors cursor-pointer"
          onClick={() => onViewJobs && onViewJobs(company)}>
          View Jobs
        </button>        
      </div>
    </div>
  );
};

export default CompanyCard;