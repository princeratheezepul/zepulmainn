import React from 'react';
import CandidateListHeader from './CandidateListHeader';
import CandidateTable from './CandidateTable';

const CandidateListPage = ({ onBack }) => {
  return (
    <div className="bg-white h-screen flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
        {/* Job Overview Section */}
        <div className="bg-white rounded-lg p-8 mb-8 max-w-6xl mx-auto">
          {/* Job Title and New Tag */}
          <div className="flex items-center space-x-4 mb-6">
            <h1 className="text-4xl font-bold text-gray-900">Product Designer</h1>
            <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">New</span>
          </div>

          {/* Job Metrics */}
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Swingz Telecom</span>
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              22 Candidates Submitted
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              82% Placement Success
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              2 Red Flag Candidates
            </span>
          </div>
        </div>

        {/* Candidate List Section */}
        <div className="bg-white rounded-lg p-8 max-w-6xl mx-auto">
          <CandidateListHeader />
          <CandidateTable />
        </div>
      </div>
    </div>
  );
};

export default CandidateListPage;
