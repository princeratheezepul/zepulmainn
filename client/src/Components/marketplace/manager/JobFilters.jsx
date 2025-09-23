import React from 'react';

const JobFilters = ({ filters, onFilterChange }) => {
  const filterSections = [
    {
      title: 'Location',
      key: 'location',
      options: [
        { key: 'inOffice', label: 'In-office' },
        { key: 'hybrid', label: 'Hybrid' },
        { key: 'remote', label: 'Remote' }
      ]
    },
    {
      title: 'Industry',
      key: 'industry',
      options: [
        { key: 'informationTechnology', label: 'Information Technology' },
        { key: 'telecommunications', label: 'Telecommunications' },
        { key: 'ecommerce', label: 'E-commerce' },
        { key: 'educationEdtech', label: 'Education & EdTech' },
        { key: 'consultingServices', label: 'Consulting Services' }
      ]
    },
    {
      title: 'Job Type',
      key: 'jobType',
      options: [
        { key: 'fulltime', label: 'Full-time' },
        { key: 'partTime', label: 'Part-Time' },
        { key: 'internship', label: 'Internship' },
        { key: 'freelance', label: 'Freelance' },
        { key: 'contract', label: 'Contract' }
      ]
    },
    {
      title: 'Work Experience',
      key: 'workExperience',
      options: [
        { key: 'entryLevel', label: 'Entry Level' },
        { key: 'junior', label: 'Junior' },
        { key: 'midLevel', label: 'Mid-level' },
        { key: 'senior', label: 'Senior' }
      ]
    },
    {
      title: 'Salary Range',
      key: 'salaryRange',
      options: [
        { key: '0-3lpa', label: '0-3 LPA' },
        { key: '3-6lpa', label: '3-6 LPA' },
        { key: '6-8lpa', label: '6-8 LPA' },
        { key: '12-24lpa', label: '12-24 LPA' }
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

export default JobFilters;
