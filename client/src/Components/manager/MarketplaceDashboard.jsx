import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../utils/authUtils';
import {
  TopNavigation,
  Sidebar,
  MetricsCards,
  CompanyStatisticsChart,
  MostPickedJobRoles,
  CandidateStatusBreakdown,
  PerformanceTable,
  CompaniesPage,
  JobsPage,
  Profile,
  Notification
} from '../marketplace/manager';
import PaymentOverview from '../marketplace/manager/PaymentOverview';
import SearchResults from '../marketplace/manager/SearchResults';
import JobDetailsForm from '../marketplace/manager/JobDetailsForm';

const MarketplaceDashboard = ({ onBack }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedCompanyForJob, setSelectedCompanyForJob] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setActiveTab('search');
  };

  const handleTabChange = (tab) => {
    // Close profile and notification components when navigating to main tabs
    setShowProfile(false);
    setShowNotification(false);
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    try {
      // Call the logout utility function with user type for proper redirection
      await logoutUser(navigate, user?.type || 'manager');
      
      // Update the auth context
      logout();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if server logout fails, clear client state and redirect
      logout();
      navigate('/manager/login');
    }
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
    // If showing notification, render it
    if (showNotification) {
      return (
        <Notification 
          onClose={() => setShowNotification(false)} 
          onNavigateToProfile={() => {
            setShowNotification(false);
            setShowProfile(true);
          }}
          onLogout={handleLogout}
        />
      );
    }

    // If showing profile, render it
    if (showProfile) {
      return (
        <Profile 
          onClose={() => setShowProfile(false)} 
          onNavigateToNotification={() => {
            setShowProfile(false);
            setShowNotification(true);
          }}
          onLogout={handleLogout}
        />
      );
    }

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
            <div className="flex items-center justify-between mx-3 my-2">
              <div>
                <div className="text-xl font-bold text-gray-900">Manager Overview</div>
              </div>
            </div>

            <MetricsCards />

            {/* Charts Section */}
            <div className="mx-3 my-2">
              <CompanyStatisticsChart />
            </div>            

            {/* Bottom Charts */}
            <div className="mx-3 my-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
              <MostPickedJobRoles />
              <CandidateStatusBreakdown />
            </div>

            <PerformanceTable />
          </>
        );
      case 'jobs':
        if (selectedCompany) {
          return <div className=""><JobsPage company={selectedCompany} onBack={() => setSelectedCompany(null)} /></div>;
        }
        return <CompaniesPage onViewJobs={setSelectedCompany} />;
      case 'payments':
        return <PaymentOverview />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <TopNavigation 
          onSearch={handleSearch} 
          onCreateJob={handleCreateJobClick} 
          onProfileClick={() => setShowProfile(true)}
        />
        
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDashboard;