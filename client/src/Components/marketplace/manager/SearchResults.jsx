import React, { useState } from 'react';
import FiltersSidebar from './FiltersSidebar';
import JobFilters from './JobFilters';
import CandidateFilters from './CandidateFilters';
import CompanyListings from './CompanyListings';
import JobListings from './JobListings';
import CandidateListings from './CandidateListings';

const SearchResults = ({ searchQuery, onBack }) => {
  const [activeTab, setActiveTab] = useState('Companies');
  const [sortBy, setSortBy] = useState('Relevance');
  const [filters, setFilters] = useState({
    // Company filters
    companyCategory: {
      hiring: false,
      licensed: true
    },
    location: {
      gurugram: false,
      bangalore: true,
      pune: false,
      hyderabad: false,
      noida: false
    },
    industry: {
      informationTechnology: false,
      telecommunications: false,
      ecommerce: false,
      educationEdtech: false,
      consultingServices: false
    },
    companyType: {
      private: false,
      startup: false,
      public: false
    },
    // Job filters
    jobLocation: {
      inOffice: false,
      hybrid: true,
      remote: false
    },
    jobIndustry: {
      informationTechnology: true,
      telecommunications: false,
      ecommerce: false,
      educationEdtech: false,
      consultingServices: false
    },
    jobType: {
      fulltime: true,
      partTime: false,
      internship: false,
      freelance: false,
      contract: false
    },
    workExperience: {
      entryLevel: false,
      junior: false,
      midLevel: true,
      senior: false
    },
    salaryRange: {
      '0-3lpa': false,
      '3-6lpa': false,
      '6-8lpa': true,
      '12-24lpa': false
    },
    // Candidate filters
    candidateLocation: {
      remote: false,
      exactLocation: true,
      hybrid: false
    },
    jobRole: {
      itIndustry: true,
      marketing: false,
      sales: false,
      nonIt: false
    },
    candidateWorkExperience: {
      noExperience: false,
      '0-2Years': false,
      '2-5Years': true,
      '6-8Years': false
    },
    skills: {
      java: true,
      springBoot: true,
      microservice: true,
      python: false,
      html: false
    }
  });

  const handleFilterChange = (category, filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [filterName]: value
      }
    }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const tabs = ['Companies', 'Jobs', 'Candidates'];
  const sortOptions = ['Relevance', 'Name A-Z', 'Name Z-A', 'Location', 'Industry'];

  const renderFilters = () => {
    switch (activeTab) {
      case 'Jobs':
        return <JobFilters filters={filters} onFilterChange={handleFilterChange} />;
      case 'Candidates':
        return <CandidateFilters filters={filters} onFilterChange={handleFilterChange} />;
      default:
        return <FiltersSidebar filters={filters} onFilterChange={handleFilterChange} />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Jobs':
        return (
          <JobListings
            searchQuery={searchQuery}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
          />
        );
      case 'Candidates':
        return (
          <CandidateListings
            searchQuery={searchQuery}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            sortOptions={sortOptions}
          />
        );
      default:
        return (
          <CompanyListings
            searchQuery={searchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            tabs={tabs}
            sortOptions={sortOptions}
          />
        );
    }
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex-1">
        <div className="flex h-full">
          {/* Filters Sidebar */}
          {/* <div className="w-70 bg-gray-50 border-r border-gray-200 p-6"> */}
          <div className="w-60 bg-white border border-gray-200 rounded-lg px-3 py-3 m-3">
            {renderFilters()}
          </div>

          {/* Main Content */}
          <div className="flex-1 ml-1 mr-2 my-4">
            {/* Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button style={{ borderRadius: "12px" }}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
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
            </div>

            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
