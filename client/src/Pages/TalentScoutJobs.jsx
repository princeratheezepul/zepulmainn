import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/talentscout/marketplace/Sidebar';
import Header from '../Components/talentscout/marketplace/Header';
import HomePage from '../Components/talentscout/marketplace/HomePage';
import JobsPage from '../Components/talentscout/marketplace/JobsPage';
import SearchResults from '../Components/talentscout/marketplace/SearchResults';
import ProfilePage from '../Components/talentscout/marketplace/ProfilePage';
import { useMarketplaceAuth } from '../context/MarketplaceAuthContext';
import { jobListings, yourPicks, walletData } from '../Data/marketplaceData';

const TalentScoutJobs = () => {
  const { user, logout } = useMarketplaceAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeJobsTab, setActiveJobsTab] = useState('Picked Jobs');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);


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


  // Show normal dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeSidebarItem={activeSidebarItem}
        setActiveSidebarItem={setActiveSidebarItem}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'lg:ml-14' : 'lg:ml-40'
      }`}>
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={handleSearch}
          setIsSidebarOpen={setIsSidebarOpen}
          setIsProfileOpen={setIsProfileOpen}
          user={user}
          logout={logout}
        />

        {/* Main Content */}
        <div>
          {isSearching ? (
            <SearchResults 
              searchQuery={searchQuery}
              onBackToHome={handleBackToHome}
            />
          ) : (
            <div className="px-3 py-3">
              {activeSidebarItem === 'Home' ? (
                <HomePage 
                  onViewAllPicks={handleViewAllPicks}
                />
              ) : activeSidebarItem === 'Jobs' ? (
                <JobsPage 
                  activeJobsTab={activeJobsTab}
                  setActiveJobsTab={setActiveJobsTab}
                />
              ) : (
                <HomePage 
                  onViewAllPicks={handleViewAllPicks}
                />
              )}
            </div>
          )}
        </div>
      </div>


        {/* Profile Page */}
        <ProfilePage 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          logout={logout}
        />
    </div>
  );
};

export default TalentScoutJobs;

