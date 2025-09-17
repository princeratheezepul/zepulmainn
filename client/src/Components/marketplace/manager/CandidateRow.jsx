import React from 'react';

const CandidateRow = ({ candidate }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-4 px-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={candidate.avatar} 
              alt={candidate.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium text-gray-900">{candidate.name}</span>
        </div>
      </td>
      <td className="py-4 px-2 text-gray-700">{candidate.email}</td>
      <td className="py-4 px-2 text-gray-700">{candidate.contact}</td>
      <td className="py-4 px-2">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          {candidate.status}
        </span>
      </td>
      <td className="py-4 px-2">
        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
          View Scorecard
        </button>
      </td>
    </tr>
  );
};

export default CandidateRow;
