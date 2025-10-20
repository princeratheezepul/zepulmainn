import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/marketplace/Sidebar';
import Header from '../Components/marketplace/Header';
import HomePage from '../Components/marketplace/HomePage';
import JobsPage from '../Components/marketplace/JobsPage';
import WalletPage from '../Components/marketplace/WalletPage';
import SearchResults from '../Components/marketplace/SearchResults';
import ProfilePage from '../Components/marketplace/ProfilePage';
import BankDetailsSetup from '../Components/marketplace/BankDetailsSetup';
import TalentScoutPage from '../Components/marketplace/TalentScoutPage';
import PartnerLeadDashboard from '../Components/marketplace/PartnerLeadDashboard';
import JobDetailsForm from '../Components/marketplace/manager/JobDetailsForm';
import { useMarketplaceAuth } from '../context/MarketplaceAuthContext';

const MarketplaceJobs = () => {
  const { user, logout, fetchUserProfile, saveBankDetails, createMarketplaceJob } = useMarketplaceAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeJobsTab, setActiveJobsTab] = useState('Picked Jobs');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [jobsRefreshKey, setJobsRefreshKey] = useState(0);

  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoadingProfile(true);
      console.log('Loading user profile...');
      
      // First check if we already have user data from login
      if (user && user.accountDetails !== undefined) {
        console.log('Using existing user data:', user);
        const hasAccountDetails = user.accountDetails && user.accountDetails.length > 0;
        console.log('Has account details:', hasAccountDetails);
        setShowBankSetup(!hasAccountDetails);
        setIsLoadingProfile(false);
        return;
      }
      
      try {
        const userData = await fetchUserProfile();
        console.log('Fetched user data:', userData);
        
        if (userData) {
          // Check if accountDetails is empty
          const hasAccountDetails = userData.accountDetails && userData.accountDetails.length > 0;
          console.log('Has account details:', hasAccountDetails);
          setShowBankSetup(!hasAccountDetails);
        } else {
          console.log('No user data received');
          setShowBankSetup(false);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setShowBankSetup(false);
      }
      
      setIsLoadingProfile(false);
    };

    // Only run once on mount
    loadUserProfile();
  }, []); // Empty dependency array

  const handleBankSetupComplete = async (bankData) => {
    console.log('Bank setup completed:', bankData);
    
    try {
      const result = await saveBankDetails(bankData);
      
      if (result.success) {
        console.log('Bank details saved successfully');
        setShowBankSetup(false);
        // User data is automatically updated in the context
      } else {
        console.error('Failed to save bank details:', result.error);
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Error saving bank details:', error);
      // You could show an error message to the user here
    }
  };

  const handleBankSetupBack = () => {
    // Go back to login or handle as needed
    logout();
  };

  // Handle search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query && query.trim() !== '') {
      setIsSearching(true);
      setActiveSidebarItem('Home'); // Reset to home when searching
    } else {
      setIsSearching(false);
    }
  };

  // Handle back to home from search
  const handleBackToHome = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Handle view all picks - navigate to Jobs page with Picked Jobs tab
  const handleViewAllPicks = () => {
    setActiveSidebarItem('Jobs');
    setActiveJobsTab('Picked Jobs');
  };

  const handleOpenCreateJob = () => {
    setActiveSidebarItem('Jobs');
    setActiveJobsTab('Picked Jobs');
    setShowCreateJobModal(true);
  };

  const handleCloseCreateJob = () => {
    setShowCreateJobModal(false);
  };

  const handleSaveMarketplaceJob = async (jobData) => {
    const payload = {
      ...jobData,
      createdByMPUser: true
    };

    const result = await createMarketplaceJob(payload);
    if (!result.success) {
      throw new Error(result.error || 'Failed to create job');
    }

    setJobsRefreshKey((prev) => prev + 1);
    return result.job;
  };

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show bank setup if accountDetails is empty
  if (showBankSetup) {
    return (
      <BankDetailsSetup 
        onComplete={handleBankSetupComplete}
        onBack={handleBankSetupBack}
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          activeSidebarItem={activeSidebarItem}
          setActiveSidebarItem={setActiveSidebarItem}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-14' : 'lg:ml-40'
        }`}>
          {!showCreateJobModal && (
            <Header 
              searchQuery={searchQuery}
              setSearchQuery={handleSearch}
              setIsSidebarOpen={setIsSidebarOpen}
              setIsProfileOpen={setIsProfileOpen}
              user={user}
              logout={logout}
            />
          )}

          <div>
            {showCreateJobModal ? (
              <div className="px-3 py-3">
                <JobDetailsForm
                  onClose={handleCloseCreateJob}
                  onSave={handleSaveMarketplaceJob}
                  companyData={null}
                />
              </div>
            ) : isSearching ? (
              <SearchResults 
                searchQuery={searchQuery}
                onBackToHome={handleBackToHome}
              />
            ) : (
              <div className="px-3 py-3">
                {activeSidebarItem === 'Dashboard' ? (
                  <PartnerLeadDashboard user={user} />
                ) : activeSidebarItem === 'Home' ? (
                  <HomePage 
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    onViewAllPicks={handleViewAllPicks}
                  />
                ) : activeSidebarItem === 'Jobs' ? (
                  <JobsPage 
                    activeJobsTab={activeJobsTab}
                    setActiveJobsTab={setActiveJobsTab}
                    onCreateJob={handleOpenCreateJob}
                    refreshKey={jobsRefreshKey}
                  />
                ) : activeSidebarItem === 'Wallet' ? (
                  <WalletPage />
                ) : activeSidebarItem === 'Talent Scout' ? (
                  <TalentScoutPage />
                ) : (
                  <PartnerLeadDashboard user={user} />
                )}
              </div>
            )}
          </div>
        </div>

        <ProfilePage 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          logout={logout}
        />
      </div>
    </>
  );
};

export default MarketplaceJobs;
