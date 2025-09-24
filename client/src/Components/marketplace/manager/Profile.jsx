import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { useAuth } from '../../../context/AuthContext';
import SettingsSidebar from './SettingsSidebar';

const Profile = ({ onClose, onNavigateToNotification, onLogout }) => {
  const { get } = useApi();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    userRole: 'Manager'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    } else {
      setLoading(false);
      setError('User not authenticated. Please login again.');
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for user:', user);
      
      // Use the manager profile endpoint
      const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/manager/profile`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile data');
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      
      // Map the response data to our component state
      const userData = data.user || data.manager || data;
      setProfileData({
        firstName: userData.firstName || userData.firstname || userData.fullname?.split(' ')[0] || '',
        lastName: userData.lastName || userData.lastname || userData.fullname?.split(' ').slice(1).join(' ') || '',
        email: userData.email || '',
        phone: userData.phone || userData.phoneNumber || '',
        dateOfBirth: userData.dateOfBirth || userData.DOB || userData.dob || '',
        userRole: userData.role || userData.userRole || 'Manager'
      });
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <SettingsSidebar 
        activeTab="profile"
        onNavigateToProfile={() => {}} // Already on profile
        onNavigateToNotification={onNavigateToNotification}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-gray-900">Profile</div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2.5">
          {/* Personal Information Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="mb-6">
              <div className="text-2xl font-semibold text-gray-900">Personal Information</div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading profile data...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading profile</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Fields */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-400 space-x-2">
                <User className="w-4 h-4 mr-2" />
                <span className="text-gray-400">First Name</span>
              </div>
              <p className="text-gray-900 font-medium mb-1">{profileData.firstName}</p>
            </div>              

            {/* Last Name */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400 flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="text-gray-400">Last Name</span>
              </div>
              <p className="text-gray-900 font-medium mb-1">{profileData.lastName}</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-gray-400">Email Id</span>
              </div>
              <p className="text-gray-900 font-medium mb-1">{profileData.email}</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-gray-400">Phone</span>
              </div>
              <p className="text-gray-900 font-medium mb-1">{profileData.phone}</p>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-gray-400">D.O.B (Date of Birth)</span>
              </div>
              <p className="text-gray-900 font-medium mb-1">{profileData.dateOfBirth}</p>
            </div>

            {/* User Role */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-gray-400">User Role</span>
              </div>
              <p className="text-gray-900 font-medium mb-1">{profileData.userRole}</p>
            </div>
          </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
