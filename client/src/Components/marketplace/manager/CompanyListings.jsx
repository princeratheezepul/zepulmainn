import React from 'react';
import CompanyCard from './CompanyCard';

const CompanyListings = ({ 
  searchQuery, 
  activeTab, 
  onTabChange, 
  sortBy, 
  onSortChange, 
  tabs, 
  sortOptions 
}) => {
  // Mock data for companies
  const companies = [
    {
      id: 1,
      name: 'Swingz Telecom',
      location: 'Bangalore, India',
      description: 'Swingz Telecom is a leading IT services and telecom solutions provider delivering next-gen digital and infrastructure services to enterprises globally. Our expertise lies in helping businesses scale, transform, and secure their operations with cutting-edge technology and agile processes.',
      candidatesSubmitted: 22,
      placementSuccess: 82,
      redFlagCandidates: 2
    },
    {
      id: 2,
      name: 'Swingz Telecom',
      location: 'Bangalore, India',
      description: 'Swingz Telecom is a leading IT services and telecom solutions provider delivering next-gen digital and infrastructure services to enterprises globally. Our expertise lies in helping businesses scale, transform, and secure their operations with cutting-edge technology and agile processes.',
      candidatesSubmitted: 22,
      placementSuccess: 82,
      redFlagCandidates: 2
    },
    {
      id: 3,
      name: 'Swingz Telecom',
      location: 'Bangalore, India',
      description: 'Swingz Telecom is a leading IT services and telecom solutions provider delivering next-gen digital and infrastructure services to enterprises globally. Our expertise lies in helping businesses scale, transform, and secure their operations with cutting-edge technology and agile processes.',
      candidatesSubmitted: 22,
      placementSuccess: 82,
      redFlagCandidates: 2
    },
    {
      id: 4,
      name: 'Swingz Telecom',
      location: 'Bangalore, India',
      description: 'Swingz Telecom is a leading IT services and telecom solutions provider delivering next-gen digital and infrastructure services to enterprises globally. Our expertise lies in helping businesses scale, transform, and secure their operations with cutting-edge technology and agile processes.',
      candidatesSubmitted: 22,
      placementSuccess: 82,
      redFlagCandidates: 2
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold text-gray-900">
          8 Companies Found for "{searchQuery}"
        </div>
      </div>

      {/* Tabs and Sort */}
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button style={{ borderRadius: "12px" }}
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 mx-1 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Company Cards */}
      <div className="space-y-4">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default CompanyListings;
