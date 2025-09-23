import React from 'react';

const CandidateFilters = ({ filters, onFilterChange }) => {
  const filterSections = [
    {
      title: 'Location',
      key: 'location',
      options: [
        { key: 'remote', label: 'Remote job' },
        { key: 'exactLocation', label: 'Exact Location' },
        { key: 'hybrid', label: 'Hybrid' }
      ]
    },
    {
      title: 'Job Role',
      key: 'jobRole',
      options: [
        { key: 'itIndustry', label: 'IT industry' },
        { key: 'marketing', label: 'Marketing' },
        { key: 'sales', label: 'Sales' },
        { key: 'nonIt', label: 'Non-IT' }
      ]
    },
    {
      title: 'Work Experience',
      key: 'workExperience',
      options: [
        { key: 'noExperience', label: 'No experience' },
        { key: '0-2Years', label: '0 - 2 Years' },
        { key: '2-5Years', label: '2 - 5 Years' },
        { key: '6-8Years', label: '6 - 8 Years' }
      ]
    },
    {
      title: 'Skills',
      key: 'skills',
      options: [
        { key: 'java', label: 'Java' },
        { key: 'springBoot', label: 'Spring Boot' },
        { key: 'microservice', label: 'Microservice' },
        { key: 'python', label: 'Python' },
        { key: 'html', label: 'HTML' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-lg font-semibold text-gray-900">Filters</h5>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </div>

      {filterSections.map((section) => (
        <div key={section.key} className="space-y-4 mb-3 space-y-4 mb-3 border-b border-gray-200 pb-2 mb-2 last:border-b-0">
          <h5 className="text-sm font-medium text-gray-700">{section.title}</h5>
          <div className="grid flex items-center">
            {section.options.map((option) => (
              <label key={option.key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters[section.key]?.[option.key] || false}
                  onChange={(e) => onFilterChange(section.key, option.key, e.target.checked)}
                  className="mx-2 mt-2 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

               
      ))}
    </div>
  );
};

export default CandidateFilters;
