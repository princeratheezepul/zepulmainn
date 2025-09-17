import React, { useState, useEffect } from 'react';
import CompanyCard from './CompanyCard';
import CreateCompany from './CreateCompany';

const CompaniesPage = ({ onViewJobs }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-companies`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCompanies(data.companies || []);
        } else {
          setError(data.message || 'Failed to fetch companies');
        }
      } else {
        setError('Failed to fetch companies');
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Error fetching companies');
    } finally {
      setLoading(false);
    }
  };

  const filters = ['All', 'Active', 'Inactive'];

  // Filter companies based on active filter
  const filteredCompanies = companies.filter(company => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return company.isActive === true;
    if (activeFilter === 'Inactive') return company.isActive === false;
    return true;
  });

  const handleCreateCompany = (companyData) => {
    console.log('New company created:', companyData);
    // Refresh the companies list after creating a new company
    fetchCompanies();
  };

  const handleCloseCreateCompany = () => {
    setShowCreateCompany(false);
  };

  // If showing create company form, render it
  if (showCreateCompany) {
    return (
      <CreateCompany 
        onClose={handleCloseCreateCompany}
        onSave={handleCreateCompany}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-3xl font-bold text-gray-900">Companies</div>
        <div 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 cursor-pointer"
          onClick={() => setShowCreateCompany(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add company</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-8">
        {filters.map((filter) => (
          <div
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === filter
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {filter}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600">Loading companies...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700">{error}</span>
          </div>
          <button 
            onClick={fetchCompanies}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Companies Grid */}
      {!loading && !error && (
        <div className="space-y-6">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeFilter === 'All' 
                  ? "Get started by creating a new company." 
                  : `No ${activeFilter.toLowerCase()} companies found.`}
              </p>
              {activeFilter === 'All' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateCompany(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Company
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} onViewJobs={onViewJobs} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
