import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserPlus, Trash2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';
import toast from 'react-hot-toast';

const TalentScoutList = ({ job, onClose }) => {
  const { jobId } = useParams();
  const { apiCall } = useMarketplaceAuth();
  
  const [talentScouts, setTalentScouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableTalentScouts, setAvailableTalentScouts] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [addedTalentScouts, setAddedTalentScouts] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [talentScoutToDelete, setTalentScoutToDelete] = useState(null);

  // Fetch talent scouts for this job
  const fetchTalentScouts = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall(
        `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/jobs/${jobId}/talent-scouts`,
        {
          method: 'GET'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch talent scouts');
      }

      const data = await response.json();
      console.log('Job talent scouts data:', data);
      setTalentScouts(data.data?.talentScouts || []);
    } catch (error) {
      console.error('Error fetching talent scouts:', error);
      toast.error('Failed to load talent scouts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchTalentScouts();
    }
  }, [jobId]);

  const handleBackToJobDetails = () => {
    onClose();
  };

  const handleAddTalentScout = async (talentScoutId) => {
    try {
      const response = await apiCall(
        `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/jobs/${jobId}/talent-scouts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ talentScoutId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add talent scout');
      }

      toast.success('Talent scout added successfully');
      
      // Add to the list of added talent scouts
      setAddedTalentScouts(prev => [...prev, talentScoutId]);
      
      // Refresh the talent scouts list
      await fetchTalentScouts();
    } catch (error) {
      console.error('Error adding talent scout:', error);
      toast.error(error.message || 'Failed to add talent scout');
    }
  };

  const handleAddTalentScoutsClick = async () => {
    try {
      setIsLoadingAvailable(true);
      setShowAddModal(true);
      setAddedTalentScouts([]); // Reset added talent scouts when opening modal
      
      // Fetch all talent scouts from the manager's recruiterList
      const response = await apiCall(
        `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/talent-scouts`,
        {
          method: 'GET'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch available talent scouts');
      }

      const data = await response.json();
      const allTalentScouts = data.data?.talentScouts || [];
      
      // Filter out talent scouts who are already assigned to this job
      const assignedTalentScoutIds = talentScouts.map(ts => ts._id);
      const available = allTalentScouts.filter(
        ts => !assignedTalentScoutIds.includes(ts._id)
      );
      
      setAvailableTalentScouts(available);
    } catch (error) {
      console.error('Error fetching available talent scouts:', error);
      toast.error('Failed to load available talent scouts');
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setAddedTalentScouts([]);
  };

  const handleDeleteClick = (talentScout) => {
    setTalentScoutToDelete(talentScout);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!talentScoutToDelete) return;

    try {
      const response = await apiCall(
        `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/jobs/${jobId}/talent-scouts/${talentScoutToDelete._id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove talent scout');
      }

      toast.success('Talent scout removed successfully');
      
      // Refresh the talent scouts list
      await fetchTalentScouts();
      
      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setTalentScoutToDelete(null);
    } catch (error) {
      console.error('Error removing talent scout:', error);
      toast.error(error.message || 'Failed to remove talent scout');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setTalentScoutToDelete(null);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Talent Scout List</h1>
          <p className="text-lg text-gray-600">
            Managing talent scouts for {job?.title || 'Job Position'}
          </p>
        </div>

        {/* Navigation and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          {/* Back Link */}
          <button
            type="button"
            onClick={handleBackToJobDetails}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to job details
          </button>

          {/* Add Talent Scouts Button */}
          <button
            type="button"
            onClick={handleAddTalentScoutsClick}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Talent Scouts
          </button>
        </div>

        {/* Talent Scout Table */}
        {talentScouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No talent scouts found</div>
            <div className="text-gray-400 text-sm">
              No talent scouts have been assigned to this job yet.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Talent Scout
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {talentScouts.map((talentScout) => (
                    <tr key={talentScout._id} className="hover:bg-gray-50 transition-colors">
                      {/* Talent Scout */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-800">
                                {getInitials(talentScout.firstName, talentScout.lastName)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {talentScout.firstName} {talentScout.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {talentScout.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {talentScout.status || 'Active'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(talentScout);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Talent Scouts Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Add Talent Scouts</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {isLoadingAvailable ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading talent scouts...</span>
                </div>
              ) : availableTalentScouts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No available talent scouts</div>
                  <div className="text-gray-400 text-sm">
                    All your talent scouts are already assigned to this job or you don't have any talent scouts in your recruiter list yet.
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableTalentScouts.map((talentScout) => {
                      const isAdded = addedTalentScouts.includes(talentScout._id);
                      return (
                        <tr key={talentScout._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {talentScout.firstName} {talentScout.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {talentScout.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              type="button"
                              onClick={() => handleAddTalentScout(talentScout._id)}
                              disabled={isAdded}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                isAdded 
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAdded ? 'Added' : 'Add'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirm Delete</h2>
              <p className="text-gray-600">
                Are you sure you want to remove <span className="font-semibold">{talentScoutToDelete?.firstName} {talentScoutToDelete?.lastName}</span> from this job?
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentScoutList;
