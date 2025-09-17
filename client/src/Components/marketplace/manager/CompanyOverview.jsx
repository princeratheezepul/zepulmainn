import React from 'react';

const CompanyOverview = ({ company }) => {
  return (
    <div className="bg-gray-100 rounded-lg border border-gray-200 p-8 mb-8">
      {/* Company Header with Logo and Tags */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-3xl">{company.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{company.name}</h1>
            <p className="text-gray-700 text-lg leading-relaxed">
              {company.description}
            </p>
          </div>
        </div>
        
        {/* Tags on the right - Horizontal */}
        <div className="flex gap-3">
          <span className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-full border border-gray-300">
            {company.industry}
          </span>
          <span className="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-full border border-gray-300">
            {company.hiresMade} Hires Made
          </span>
          <span className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full">
            {company.activeJobs} Active Jobs
          </span>
        </div>
      </div>

      {/* Company Details */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
          <span className="text-gray-700 underline">{company.website}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-gray-700">{company.headquarters}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-gray-700">{company.offices}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;
