import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config/config';

const MarketplaceAuthContext = createContext();

export const useMarketplaceAuth = () => {
  const context = useContext(MarketplaceAuthContext);
  if (!context) {
    throw new Error('useMarketplaceAuth must be used within a MarketplaceAuthProvider');
  }
  return context;
};

export const MarketplaceAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('marketplace_token');
    const storedUser = localStorage.getItem('marketplace_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/marketplace/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const { user: userData, token: userToken } = data.data;
      
      // Store in localStorage
      localStorage.setItem('marketplace_token', userToken);
      localStorage.setItem('marketplace_user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(userToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('marketplace_token');
    localStorage.removeItem('marketplace_user');
    setUser(null);
    setToken(null);
    navigate('/marketplace/login');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchUserProfile = async () => {
    if (!token) {
      console.log('No token available for profile fetch');
      return null;
    }
    
    try {
      console.log('Fetching profile with token:', token.substring(0, 20) + '...');
      const response = await fetch(`${config.backendUrl}/api/marketplace/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Profile response status:', response.status);
      const data = await response.json();
      console.log('Profile response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      const userData = data.data.user;
      console.log('Extracted user data:', userData);
      
      // Update stored user data
      localStorage.setItem('marketplace_user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Fetch profile error:', error);
      return null;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!token) {
      console.log('No token available for profile update');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Updating profile:', profileData);
      const response = await fetch(`${config.backendUrl}/api/marketplace/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      console.log('Update profile response status:', response.status);
      const data = await response.json();
      console.log('Update profile response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const userData = data.data.user;
      console.log('Profile updated successfully:', userData);
      
      // Update stored user data
      localStorage.setItem('marketplace_user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const saveBankDetails = async (bankData) => {
    if (!token) {
      console.log('No token available for saving bank details');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Saving bank details:', bankData);
      const response = await fetch(`${config.backendUrl}/api/marketplace/bank-details`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bankData),
      });

      console.log('Save bank details response status:', response.status);
      const data = await response.json();
      console.log('Save bank details response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save bank details');
      }

      const { user: updatedUser, bankDetails } = data.data;
      console.log('Bank details saved successfully:', bankDetails);
      
      // Update stored user data
      localStorage.setItem('marketplace_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser, bankDetails };
    } catch (error) {
      console.error('Save bank details error:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchBankDetails = async () => {
    if (!token) {
      console.log('No token available for fetching bank details');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Fetching bank details');
      const response = await fetch(`${config.backendUrl}/api/marketplace/bank-details`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Fetch bank details response status:', response.status);
      const data = await response.json();
      console.log('Fetch bank details response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bank details');
      }

      const { bankDetails } = data.data;
      console.log('Bank details fetched successfully:', bankDetails);
      
      return { success: true, bankDetails };
    } catch (error) {
      console.error('Fetch bank details error:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteBankDetails = async (bankDetailId) => {
    if (!token) {
      console.log('No token available for deleting bank details');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Deleting bank details:', bankDetailId);
      const response = await fetch(`${config.backendUrl}/api/marketplace/bank-details/${bankDetailId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      console.log('Delete bank details response status:', response.status);
      const data = await response.json();
      console.log('Delete bank details response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete bank details');
      }

      console.log('Bank details deleted successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Delete bank details error:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchJobs = async (page = 1, limit = 10) => {
    if (!token) {
      console.log('No token available for fetching jobs');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Fetching jobs for page:', page, 'limit:', limit);
      const response = await fetch(`${config.backendUrl}/api/marketplace/jobs?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Fetch jobs response status:', response.status);
      const data = await response.json();
      console.log('Fetch jobs response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      const { jobs, pagination } = data.data;
      console.log(`Fetched ${jobs.length} jobs successfully for page ${pagination.currentPage}`);
      
      return { success: true, jobs, pagination };
    } catch (error) {
      console.error('Fetch jobs error:', error);
      return { success: false, error: error.message };
    }
  };

  const searchJobs = async (query, page = 1, limit = 10) => {
    if (!token) {
      console.log('No token available for searching jobs');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Searching jobs with query:', query, 'page:', page, 'limit:', limit);
      const response = await fetch(`${config.backendUrl}/api/marketplace/jobs/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Search jobs response status:', response.status);
      const data = await response.json();
      console.log('Search jobs response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search jobs');
      }

      const { jobs, pagination, searchQuery } = data.data;
      console.log(`Found ${jobs.length} jobs for query "${searchQuery}" on page ${pagination.currentPage}`);
      
      return { success: true, jobs, pagination, searchQuery };
    } catch (error) {
      console.error('Search jobs error:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchBookmarkedJobs = async (limit = 8) => {
    if (!token) {
      console.log('No token available for fetching bookmarked jobs');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Fetching bookmarked jobs with limit:', limit);
      const response = await fetch(`${config.backendUrl}/api/marketplace/bookmarked-jobs?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Fetch bookmarked jobs response status:', response.status);
      const data = await response.json();
      console.log('Fetch bookmarked jobs response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookmarked jobs');
      }

      const { jobs, total } = data.data;
      console.log(`Fetched ${total} bookmarked jobs successfully`);
      
      return { success: true, jobs, total };
    } catch (error) {
      console.error('Fetch bookmarked jobs error:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchPickedJobs = async (limit = 10) => {
    if (!token) {
      console.log('No token available for fetching picked jobs');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Fetching picked jobs with limit:', limit);
      const response = await fetch(`${config.backendUrl}/api/marketplace/picked-jobs?limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Fetch picked jobs response status:', response.status);
      const data = await response.json();
      console.log('Fetch picked jobs response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch picked jobs');
      }

      const { jobs, total } = data.data;
      console.log(`Fetched ${total} picked jobs successfully`);
      
      return { success: true, jobs, total };
    } catch (error) {
      console.error('Fetch picked jobs error:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchJobDetails = async (jobId) => {
    if (!token) {
      console.log('No token available for fetching job details');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Fetching job details for job:', jobId);
      const response = await fetch(`${config.backendUrl}/api/marketplace/jobs/${jobId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      console.log('Fetch job details response status:', response.status);
      const data = await response.json();
      console.log('Fetch job details response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job details');
      }

      const { job } = data.data;
      console.log(`Fetched job details successfully for: ${job.title}`);
      
      return { success: true, job };
    } catch (error) {
      console.error('Fetch job details error:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleJobBookmark = async (jobId) => {
    if (!token) {
      console.log('No token available for bookmarking job');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Toggling bookmark for job:', jobId);
      const response = await fetch(`${config.backendUrl}/api/marketplace/bookmark`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId }),
      });

      console.log('Toggle bookmark response status:', response.status);
      const data = await response.json();
      console.log('Toggle bookmark response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle bookmark');
      }

      const { isBookmarked, bookmarkedJobs } = data.data;
      console.log(`Bookmark toggled successfully. Is bookmarked: ${isBookmarked}`);
      
      // Update user's bookmarked jobs in local storage and state
      if (user) {
        const updatedUser = { ...user, bookmarkedJobs };
        localStorage.setItem('marketplace_user', JSON.stringify(updatedUser));
        // Don't update state immediately to prevent re-renders
        // setUser(updatedUser);
      }
      
      return { success: true, isBookmarked, bookmarkedJobs };
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      return { success: false, error: error.message };
    }
  };

  const pickJob = async (jobId) => {
    if (!token) {
      console.log('No token available for picking job');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Picking job:', jobId);
      const response = await fetch(`${config.backendUrl}/api/marketplace/pick-job`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId }),
      });

      console.log('Pick job response status:', response.status);
      const data = await response.json();
      console.log('Pick job response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to pick job');
      }

      const { user: updatedUser, pickedJobs } = data.data;
      console.log(`Job picked successfully. Total picked jobs: ${pickedJobs.length}`);
      
      // Update user's picked jobs in local storage and state
      localStorage.setItem('marketplace_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser, pickedJobs };
    } catch (error) {
      console.error('Pick job error:', error);
      return { success: false, error: error.message };
    }
  };

  const withdrawJob = async (jobId) => {
    if (!token) {
      console.log('No token available for withdrawing job');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('Withdrawing job:', jobId);
      const response = await fetch(`${config.backendUrl}/api/marketplace/withdraw-job`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobId }),
      });

      console.log('Withdraw job response status:', response.status);
      const data = await response.json();
      console.log('Withdraw job response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to withdraw job');
      }

      const { user: updatedUser, pickedJobs } = data.data;
      console.log(`Job withdrawn successfully. Total picked jobs: ${pickedJobs.length}`);
      
      // Update user's picked jobs in local storage and state
      localStorage.setItem('marketplace_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser, pickedJobs };
    } catch (error) {
      console.error('Withdraw job error:', error);
      return { success: false, error: error.message };
    }
  };

  // Generic API call method for marketplace
  const apiCall = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (response.status === 401) {
      // Token expired, try to refresh
      console.log('Token expired, attempting to refresh...');
      const refreshResult = await refreshToken();
      if (refreshResult.success) {
        // Retry the original request with new token
        const retryOptions = {
          ...defaultOptions,
          headers: {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${refreshResult.token}`,
          },
          ...options,
        };
        return await fetch(url, retryOptions);
      } else {
        // Refresh failed, redirect to login
        logout();
        throw new Error('Session expired. Please login again');
      }
    }

    return response;
  };

  // Helper method to refresh token (placeholder - implement based on your backend)
  const refreshToken = async () => {
    try {
      // This would need to be implemented based on your backend's refresh token endpoint
      // For now, return failure to trigger logout
      return { success: false };
    } catch (error) {
      console.error('Token refresh failed:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders,
    fetchUserProfile,
    updateUserProfile,
    saveBankDetails,
    fetchBankDetails,
    deleteBankDetails,
    fetchJobs,
    searchJobs,
    fetchBookmarkedJobs,
    fetchPickedJobs,
    fetchJobDetails,
    toggleJobBookmark,
    pickJob,
    withdrawJob,
    apiCall,
  };

  return (
    <MarketplaceAuthContext.Provider value={value}>
      {children}
    </MarketplaceAuthContext.Provider>
  );
};
