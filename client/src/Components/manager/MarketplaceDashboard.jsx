import React, { useState } from 'react';
import {
  TopNavigation,
  Sidebar,
  MetricsCards,
  CompanyStatisticsChart,
  MostPickedJobRoles,
  CandidateStatusBreakdown,
  PerformanceTable,
  CompaniesPage,
  JobsPage
} from '../marketplace/manager';
import SearchResults from '../marketplace/manager/SearchResults';
import JobDetailsForm from '../marketplace/manager/JobDetailsForm';

const MarketplaceDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedCompanyForJob, setSelectedCompanyForJob] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleBackFromSearch = () => {
    setSearchQuery(null);
    setActiveTab('home');
  };

  const handleCreateJob = async (jobData) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    
    if (!userInfo?.data?.accessToken) {
      throw new Error('No authentication token found');
    }

    // Add companyId to the job data
    const jobDataWithCompany = {
      ...jobData,
      companyId: selectedCompanyForJob?.id
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/create-marketplace-job`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userInfo.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobDataWithCompany)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Job created successfully:', data.job);
      return data.job;
    } else {
      throw new Error(data.message || 'Failed to create job');
    }
  };

  const handleCloseCreateJob = () => {
    setShowCreateJob(false);
    setSelectedCompanyForJob(null);
  };

  const handleCreateJobClick = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        console.error('No authentication token found');
        return;
      }

      // Fetch user's companies
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-companies`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.companies.length > 0) {
          // If user has companies, use the first one or show selection
          // For now, we'll use the first company
          setSelectedCompanyForJob(data.companies[0]);
          setShowCreateJob(true);
        } else {
          // No companies found, show message or redirect to create company
          alert('Please create a company first before creating jobs.');
        }
      } else {
        console.error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const renderContent = () => {
    // If showing create job form, render it
    if (showCreateJob) {
      return (
        <JobDetailsForm 
          onClose={handleCloseCreateJob}
          onSave={handleCreateJob}
          companyData={selectedCompanyForJob}
        />
      );
    }

    // If search is active, show search results
    if (searchQuery) {
      return <SearchResults searchQuery={searchQuery} onBack={handleBackFromSearch} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 mx-8">
              <div>
                <div className="text-xl font-semibold text-gray-900">Manager Overview</div>
              </div>
            </div>

            <MetricsCards />

            {/* Charts Section */}
            <div className="mb-8">
              <CompanyStatisticsChart />
            </div>

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MostPickedJobRoles />
              <CandidateStatusBreakdown />
            </div>

            <PerformanceTable />
          </>
        );
      case 'jobs':
        if (selectedCompany) {
          return <div className="h-screen"><JobsPage company={selectedCompany} onBack={() => setSelectedCompany(null)} /></div>;
        }
        return <CompaniesPage onViewJobs={setSelectedCompany} />;
      case 'payments':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>
            <p className="text-gray-600">Payments page coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <TopNavigation onSearch={handleSearch} onCreateJob={handleCreateJobClick} />
        
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;