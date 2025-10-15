import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';
import AddRecruiterForm from './AddRecruiterModal';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';
import toast from 'react-hot-toast';

const TalentScoutPage = () => {
  const { apiCall } = useMarketplaceAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruiters, setRecruiters] = useState([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch talent scouts on component mount
  useEffect(() => {
    fetchTalentScouts();
  }, []);

  const fetchTalentScouts = async () => {
    setIsLoading(true);
    try {
      const response = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/talent-scouts`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch talent scouts');
      }

      const data = await response.json();
      console.log('Talent scouts data:', data);

      if (data.success && data.data.talentScouts) {
        setRecruiters(data.data.talentScouts);
        setFilteredRecruiters(data.data.talentScouts);
      }
    } catch (error) {
      console.error('Error fetching talent scouts:', error);
      toast.error('Failed to load talent scouts');
      setRecruiters([]);
      setFilteredRecruiters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recruiters based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRecruiters(recruiters);
    } else {
      const filtered = recruiters.filter(recruiter =>
        recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recruiter.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecruiters(filtered);
    }
  }, [searchQuery, recruiters]);

  const handleAddRecruiter = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRecruiterSubmit = async (recruiterData) => {
    console.log('New recruiter data:', recruiterData);
    
    // Refresh the talent scouts list after successful creation
    await fetchTalentScouts();
    
    // Success toast is already shown in the form component
    console.log('Talent scouts list refreshed');
  };

  const handleDeleteRecruiter = async (recruiterId) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this talent scout? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiCall(
        `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/talent-scouts/${recruiterId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete talent scout');
      }

      // Remove from local state
      setRecruiters(prev => prev.filter(r => r._id !== recruiterId));
      setFilteredRecruiters(prev => prev.filter(r => r._id !== recruiterId));
      
      toast.success('Talent scout deleted successfully');
      console.log('Talent scout deleted:', recruiterId);
    } catch (error) {
      console.error('Error deleting talent scout:', error);
      toast.error(error.message || 'Failed to delete talent scout');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'disabled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show Add Recruiter Form if modal is open
  if (isModalOpen) {
    return (
      <AddRecruiterForm
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleRecruiterSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">JOB DETAILS</div>
          <h1 className="text-3xl font-bold text-gray-900">My Talent Scouts</h1>
        </div>
        <button
          onClick={handleAddRecruiter}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Talent Scout
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {/* Recruiters Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading talent scouts...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecruiters.map((recruiter) => (
                  <tr key={recruiter._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {recruiter.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recruiter.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(recruiter.status)}`}>
                      {recruiter.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteRecruiter(recruiter._id)}
                      className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete Talent Scout"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecruiters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No talent scouts found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first talent scout.'}
            </p>
          </div>
        )}

      </div>

      {/* Mobile Cards View */}
      {!isLoading && (
        <div className="block sm:hidden space-y-4">
          {filteredRecruiters.map((recruiter) => (
            <div key={recruiter._id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{recruiter.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{recruiter.email}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(recruiter.status)}`}>
                {recruiter.status}
              </span>
            </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={() => handleDeleteRecruiter(recruiter._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                  title="Delete Talent Scout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default TalentScoutPage;
