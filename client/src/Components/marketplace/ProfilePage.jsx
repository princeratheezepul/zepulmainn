import React, { useState, useEffect } from 'react';
import { Edit, User, Bell, CreditCard, Search, Grid3X3, ChevronLeft, Save, X } from 'lucide-react';
import NotificationSettings from '../marketplace/NotificationSettings';
import BankDetails from '../marketplace/BankDetails';
import Sidebar from '../marketplace/Sidebar';
import HomePage from '../marketplace/HomePage';
import JobsPage from '../marketplace/JobsPage';
import WalletPage from '../marketplace/WalletPage';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';

const ProfilePage = ({ isOpen, onClose, user, logout }) => {
  const { updateUserProfile } = useMarketplaceAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState('Profile');
  const [activeSidebarItem, setActiveSidebarItem] = useState(null); // No item selected by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeJobsTab, setActiveJobsTab] = useState('Picked Jobs');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  const settingsTabs = [
    { id: 'Profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { id: 'Notification', label: 'Notification', icon: <Bell className="h-4 w-4" /> },
    { id: 'Bank Details', label: 'Bank Details', icon: <CreditCard className="h-4 w-4" /> }
  ];

  const profileData = {
    firstName: user?.firstName || 'User',
    lastName: user?.lastName || '',
    dob: user?.DOB ? new Date(user.DOB).toLocaleDateString('en-GB') : '',
    email: user?.emailid || '',
    phone: user?.phone || '',
    userRole: user?.userRole || ''
  };

  // Initialize edited profile when entering edit mode
  const handleEditProfile = () => {
    setEditedProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      dob: profileData.dob,
      email: profileData.email,
      phone: profileData.phone,
      userRole: profileData.userRole
    });
    setIsEditingProfile(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedProfile({});
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile:', editedProfile);
      
      // Prepare the data for API call
      const updateData = {
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        DOB: editedProfile.dob,
        emailid: editedProfile.email,
        phone: editedProfile.phone,
        userRole: editedProfile.userRole
      };

      // Use the context function to update profile
      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        console.log('Profile updated successfully:', result.user);
        setIsEditingProfile(false);
        setEditedProfile({});
        // Profile updated successfully - no alert needed
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      // You could add a toast notification or error state here instead of alert
      // For now, just log the error
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle sidebar navigation
  const handleSidebarNavigation = (item) => {
    setActiveSidebarItem(item);
  };

  // Handle view all picks - navigate to Jobs page with Picked Jobs tab
  const handleViewAllPicks = () => {
    setActiveSidebarItem('Jobs');
    setActiveJobsTab('Picked Jobs');
  };

  // Reset sidebar selection when profile is opened
  useEffect(() => {
    if (isOpen) {
      setActiveSidebarItem(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 flex z-50">
      {/* Dashboard Sidebar */}
      <Sidebar 
        activeSidebarItem={activeSidebarItem}
        setActiveSidebarItem={handleSidebarNavigation}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Header - Only show when in profile settings */}
        {activeSidebarItem === null && (
          <header className="bg-white border-b border-gray-100">
            <div className="px-6 py-3">
              <div className="flex justify-between items-center">
                {/* Close Profile Button */}
                <button 
                  onClick={onClose}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </button>

                {/* Right side icons */}
                <div className="flex items-center space-x-4">
                  <Grid3X3 className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
                  <div className="relative">
                    <Bell className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => setActiveSidebarItem(null)}
                  >
                    <img
                      src="/api/placeholder/32/32"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      U
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Dashboard Header - Show when sidebar sections are active */}
        {activeSidebarItem !== null && (
          <header className="bg-white border-b border-gray-100">
            <div className="px-6 py-3">
              <div className="flex justify-between items-center">
                {/* Left side - Search bar */}
                <div className="flex-1 max-w-md">
                  <form className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="w-full pl-4 pr-10 py-2 bg-gray-100 border-0 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-gray-100 text-sm"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-1.5 rounded-md hover:bg-gray-900 transition-colors"
                    >
                      <Search className="h-3 w-3" />
                    </button>
                  </form>
                </div>

                {/* Right side icons */}
                <div className="flex items-center space-x-4 ml-6">
                  <Grid3X3 className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
                  <div className="relative">
                    <Bell className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
                    onClick={() => setActiveSidebarItem(null)}
                  >
                    <img
                      src="/api/placeholder/32/32"
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      U
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {activeSidebarItem === null ? (
            // Show Profile Settings when no sidebar item is selected
            <div className="flex h-full">
              {/* Settings Sidebar */}
              <div className="w-64 bg-white bg-gray-50 border-r border-gray-200 p-6">
                <div className="px-3 py-2 text-md font-semibold tracking-wide mb-1">
                  SETTINGS
                </div>
                <nav className="space-y-2">
                  {settingsTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left transition-colors mb-2 ${
                        activeSettingsTab === tab.id
                          ? 'cursor-pointer bg-blue-50 text-blue-600 hover:bg-gray-100'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`} style={{borderRadius:10}}
                    >
                      {tab.icon} 
                      <span className=" font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {activeSettingsTab === 'Profile' && (
                  <div className="overflow-y-auto">
                    {/* <div className="bg-white text-2xl font-bold text-gray-900 mb-3">Profile</div> */}
                    <div class="bg-white border-b border-gray-200 px-4 py-3">
                      <div class="flex items-center justify-between">
                        <div class="text-xl font-bold text-gray-900">Profile</div>                        
                      </div>
                    </div>
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-lg border p-6 m-2 relative">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                        {!isEditingProfile ? (
                          <button 
                            onClick={handleEditProfile}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={handleSaveProfile}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Save className="h-4 w-4" />
                              <span className="text-sm">Save</span>
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              <X className="h-4 w-4" />
                              <span className="text-sm">Cancel</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.firstName || ''}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {profileData.firstName}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="text"
                              value={editedProfile.lastName || ''}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {profileData.lastName}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            D.O.B
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="date"
                              value={editedProfile.dob ? new Date(editedProfile.dob.split('/').reverse().join('-')).toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const date = e.target.value;
                                const formattedDate = date ? new Date(date).toLocaleDateString('en-GB') : '';
                                handleInputChange('dob', formattedDate);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {profileData.dob}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Id
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="email"
                              value={editedProfile.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {profileData.email}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          {isEditingProfile ? (
                            <input
                              type="tel"
                              value={editedProfile.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {profileData.phone}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Role
                          </label>
                          {isEditingProfile ? (
                            <select
                              value={editedProfile.userRole || ''}
                              onChange={(e) => handleInputChange('userRole', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select Role</option>
                              <option value="Recruiter">Recruiter</option>
                              <option value="Manager">Manager</option>
                              <option value="Account Manager">Account Manager</option>
                              <option value="Admin">Admin</option>
                            </select>
                          ) : (
                            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                              {profileData.userRole}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="mt-6 ml-3">
                      <div
                        onClick={() => {
                          onClose();
                          logout();
                        }}
                        className="w-[6rem] cursor-pointer bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Logout
                      </div>
                    </div>
                  </div>
                )}

                {activeSettingsTab === 'Notification' && (
                  <NotificationSettings/>
                )}

                {activeSettingsTab === 'Bank Details' && (
                  <BankDetails/>
                )}
              </div>
            </div>
          ) : activeSidebarItem === 'Home' ? (
            <div className="p-6">
              <HomePage 
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                onViewAllPicks={handleViewAllPicks}
              />
            </div>
          ) : activeSidebarItem === 'Jobs' ? (
            <div className="p-6">
              <JobsPage 
                activeJobsTab={activeJobsTab}
                setActiveJobsTab={setActiveJobsTab}
              />
            </div>
          ) : activeSidebarItem === 'Wallet' ? (
            <div className="p-6">
              <WalletPage />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
