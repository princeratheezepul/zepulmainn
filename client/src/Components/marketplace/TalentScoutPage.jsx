import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Trash2, MoreVertical } from 'lucide-react';
import AddRecruiterForm from './AddRecruiterModal';

const TalentScoutPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruiters, setRecruiters] = useState([
    {
      id: 1,
      name: "Manager Fixed test",
      email: "maangerfixedtest@gmail.com",
      location: "N/A",
      status: "disabled"
    },
    {
      id: 2,
      name: "Recruiter Fixed",
      email: "recruiterfixed@gmail.com",
      location: "N/A",
      status: "active"
    },
    {
      id: 3,
      name: "John Smith",
      email: "john.smith@example.com",
      location: "Remote",
      status: "active"
    },
    {
      id: 4,
      name: "Drisha Chitale",
      email: "drishyachitale@use.startmail.com",
      location: "Remote",
      status: "active"
    },
    {
      id: 5,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      location: "On-Site",
      status: "active"
    },
    {
      id: 6,
      name: "Mike Wilson",
      email: "mike.wilson@example.com",
      location: "Remote",
      status: "disabled"
    },
    {
      id: 7,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      location: "On-Site",
      status: "active"
    },
    {
      id: 8,
      name: "Recruiter Userdff",
      email: "testrec@gmail.com",
      location: "On-Site",
      status: "active"
    }
  ]);

  const [filteredRecruiters, setFilteredRecruiters] = useState(recruiters);

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

  const handleRecruiterSubmit = (recruiterData) => {
    // TODO: Implement API call to add recruiter
    console.log('New recruiter data:', recruiterData);
    
    // For now, just add to local state
    const newRecruiter = {
      id: recruiters.length + 1,
      name: `${recruiterData.firstName} ${recruiterData.lastName}`,
      email: recruiterData.email,
      status: 'active'
    };
    
    setRecruiters(prev => [...prev, newRecruiter]);
    
    // You can add success toast here
    console.log('Recruiter added successfully!');
  };

  const handleViewDetails = (recruiterId) => {
    // TODO: Implement view details functionality
    console.log('View details for recruiter:', recruiterId);
  };

  const handleDeleteRecruiter = (recruiterId) => {
    // TODO: Implement delete recruiter functionality
    console.log('Delete recruiter:', recruiterId);
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
          <h1 className="text-3xl font-bold text-gray-900">My Recruiters</h1>
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
                <tr key={recruiter.id} className="hover:bg-gray-50 transition-colors duration-150">
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewDetails(recruiter.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        title="View Details"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecruiter(recruiter.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredRecruiters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recruiters found</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first recruiter.'}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Cards View */}
      <div className="block sm:hidden space-y-4">
        {filteredRecruiters.map((recruiter) => (
          <div key={recruiter.id} className="bg-white rounded-lg border border-gray-200 p-4">
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewDetails(recruiter.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title="View Details"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRecruiter(recruiter.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TalentScoutPage;
