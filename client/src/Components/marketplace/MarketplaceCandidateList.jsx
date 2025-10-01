import React, { useState, useEffect } from 'react';
import { FileText, X, ArrowLeft, Upload } from 'lucide-react';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';
import ResumeDetailsView from '../recruiter/dashboard/ResumeDetailsView';
import MarketplaceResumeUpload from './MarketplaceResumeUpload';
import toast from 'react-hot-toast';

const statusColors = {
  scheduled: 'bg-yellow-100 text-yellow-800',
  screening: 'bg-blue-100 text-blue-800',
  submitted: 'bg-purple-100 text-purple-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  offered: 'bg-indigo-100 text-indigo-800',
  hired: 'bg-emerald-100 text-emerald-800',
};

const MarketplaceCandidateList = ({ job, onBack }) => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [notes, setNotes] = useState('');
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [isRefreshingResume, setIsRefreshingResume] = useState(false);
  const [resumeUpdateKey, setResumeUpdateKey] = useState(0);
  const { apiCall } = useMarketplaceAuth();

  useEffect(() => {
    fetchCandidates();
  }, [job._id]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/jobs/${job._id}/candidates`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const result = await response.json();
      setCandidates(result.data.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSidebar = (candidate) => {
    setSelectedCandidate(candidate);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedCandidate(null);
    setNotes('');
  };

  const handleSaveNotes = async () => {
    if (!selectedCandidate || !notes.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      // Here you would typically save the notes to the backend
      // For now, we'll just show a success message
      toast.success('Note saved successfully');
      setNotes('');
      handleCloseSidebar();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save note');
    }
  };

  const handleCandidateClick = async (candidate) => {
    try {
      // Fetch the full resume data for this candidate
      const response = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/${candidate._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch resume details');
      }

      const result = await response.json();
      setSelectedResume(result.data);
    } catch (error) {
      console.error('Error fetching resume details:', error);
      toast.error('Failed to load resume details');
    }
  };

  // Handle resume update after evaluation
  const handleResumeUpdate = async (resumeId) => {
    try {
      console.log('Fetching updated resume data for ID:', resumeId);
      
      // Set loading state
      setIsRefreshingResume(true);
      
      // Re-fetch the resume data to get updated evaluation results
      const response = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/${resumeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch updated resume details');
      }

      const result = await response.json();
      console.log('Updated resume data received:', result.data);
      console.log('Interview evaluation:', result.data.interviewEvaluation);
      
      // Update the resume data and increment the key to force complete remount
      setSelectedResume(result.data);
      setResumeUpdateKey(prev => prev + 1);
      setIsRefreshingResume(false);
      console.log('Resume data updated after evaluation with new key');
    } catch (error) {
      console.error('Error updating resume data:', error);
      toast.error('Failed to refresh resume data');
      setIsRefreshingResume(false);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: candidates.length,
      submitted: 0,
      screening: 0,
      scheduled: 0,
      shortlisted: 0,
      rejected: 0,
    };

    candidates.forEach(candidate => {
      if (counts.hasOwnProperty(candidate.status)) {
        counts[candidate.status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // If resume upload is shown, show the upload component
  if (showResumeUpload) {
    return (
      <MarketplaceResumeUpload 
        job={job} 
        onBack={() => {
          setShowResumeUpload(false);
          fetchCandidates(); // Refresh candidates after upload
        }} 
      />
    );
  }

  // Show loading state while refreshing resume data
  if (isRefreshingResume) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Updating candidate information...</p>
        </div>
      </div>
    );
  }

  // If a resume is selected, show the resume details view
  if (selectedResume) {
    return (
      <ResumeDetailsView 
        key={`resume-${selectedResume._id}-${resumeUpdateKey}`}
        resumeData={selectedResume} 
        onBack={() => {
          setSelectedResume(null);
          setResumeUpdateKey(0);
        }} 
        isMarketplace={true}
        marketplaceJobDetails={job}
        onResumeUpdate={handleResumeUpdate}
      />
    );
  }

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-3xl font-bold text-gray-900">Candidate List</div>
            <p className="text-gray-600 mt-1">Managing candidates for {job.title || job.jobtitle}</p>
          </div>
          <button onClick={onBack} className="text-blue-600 hover:underline flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to job details
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-semibold">
              All ({statusCounts.all})
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">
              Submitted ({statusCounts.submitted})
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">
              Screening ({statusCounts.screening})
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">
              Scheduled ({statusCounts.scheduled})
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">
              Shortlisted ({statusCounts.shortlisted})
            </button>
            <button className="bg-white text-gray-700 px-4 py-2 rounded-md text-sm font-semibold border">
              Rejected ({statusCounts.rejected})
            </button>
          </div>
          
          <button 
            onClick={() => setShowResumeUpload(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Upload size={16} />
            Submit Resume
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No candidates found</div>
            <p className="text-gray-400 mt-2">Candidates will appear here once they apply for this job</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Candidate</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Applied date</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Score</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-500 text-sm">Notes</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr 
                    key={candidate._id || index} 
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
                    onClick={e => {
                      // Prevent click if notes button is clicked
                      if (e.target.closest('.notes-btn')) return;
                      handleCandidateClick(candidate);
                    }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-semibold text-sm">
                            {getInitials(candidate.name)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{candidate.name}</div>
                          <div className="text-sm text-gray-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{candidate.appliedDate}</td>
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {candidate.score ? `${Math.round(candidate.score)}%` : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[candidate.status] || 'bg-gray-100 text-gray-800'}`}>
                        {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => handleOpenSidebar(candidate)} 
                        className="notes-btn text-gray-500 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
                        title="Add notes"
                      >
                        <FileText size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sidebar for adding notes */}
      <div
        className={`fixed inset-0 bg-gray-200 bg-opacity-10 z-40 transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseSidebar}
      ></div>

      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedCandidate && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold text-gray-800">
                  Add Notes for {selectedCandidate.name}
                </div>
                <button onClick={handleCloseSidebar} className="text-gray-500 hover:text-gray-800">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 flex-grow">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-full resize-none text-base p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your note about this candidate..."
              />
            </div>
            <div className="p-6 bg-white border-t border-gray-200">
              <button 
                onClick={handleSaveNotes}
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MarketplaceCandidateList;
