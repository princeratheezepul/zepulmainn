import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  IndianRupee, 
  Users, 
  Bookmark,
  ArrowLeft,
  FileText,
  CalendarDays,
  MoreVertical
} from 'lucide-react';
import { useMarketplaceAuth } from '../context/MarketplaceAuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CommissionCard } from '../Components/marketplace/CommisionCard';
import MarketplaceResumeUpload from '../Components/marketplace/MarketplaceResumeUpload';
import SavedResumes from '../Components/recruiter/dashboard/SavedResumes';
import MarketplaceCandidateList from '../Components/marketplace/MarketplaceCandidateList';
import toast from 'react-hot-toast';

const MarketplaceJobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { fetchJobDetails, toggleJobBookmark, pickJob, withdrawJob, user } = useMarketplaceAuth();
  
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isJobPicked, setIsJobPicked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [showSavedResumes, setShowSavedResumes] = useState(false);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);

  // Fetch resume count for this job (marketplace candidates)
  const fetchResumeCount = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/jobs/${jobId}/candidates`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('marketplace_token')}`
        }
      });
      if (!response.ok) return;
      const data = await response.json();
      setResumeCount(data.data?.totalCount || 0);
    } catch (err) {
      setResumeCount(0);
    }
  };

  useEffect(() => {
    const loadJobDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await fetchJobDetails(jobId);
        
        if (result.success) {
          setJob(result.job);
        } else {
          setError(result.error);
        }
      } catch (error) {
        setError('Failed to load job details');
        console.error('Error loading job details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      loadJobDetails();
      fetchResumeCount();
    }
  }, [jobId, fetchJobDetails]);

  // Check if job is already picked
  useEffect(() => {
    if (user && user.pickedJobs && jobId) {
      // Check if jobId exists in pickedJobs array (handle both string and ObjectId formats)
      const isPicked = user.pickedJobs.some(pickedJob => 
        pickedJob === jobId || pickedJob._id === jobId || pickedJob.toString() === jobId
      );
      setIsJobPicked(isPicked);
    }
  }, [user, jobId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleBookmarkToggle = async () => {
    if (isBookmarking || !job) return;
    
    setIsBookmarking(true);
    try {
      const result = await toggleJobBookmark(job._id);
      if (result.success) {
        setJob(prev => ({ ...prev, isBookmarked: result.isBookmarked }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handlePickJob = async () => {
    if (isPicking || !job) return;
    
    setIsPicking(true);
    try {
      const result = await pickJob(job._id);
      if (result.success) {
        setIsJobPicked(true);
        toast.success('Job picked successfully!');
      } else {
        toast.error(result.error || 'Failed to pick job');
      }
    } catch (error) {
      console.error('Error picking job:', error);
      toast.error('Failed to pick job');
    } finally {
      setIsPicking(false);
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleReport = () => {
    setShowMenu(false);
    toast.success('Report submitted');
  };

  const handleWithdrawJob = async () => {
    if (isWithdrawing || !job) return;
    
    setIsWithdrawing(true);
    setShowMenu(false);
    
    try {
      const result = await withdrawJob(job._id);
      if (result.success) {
        setIsJobPicked(false);
        toast.success('Job withdrawn successfully!');
      } else {
        toast.error(result.error || 'Failed to withdraw job');
      }
    } catch (error) {
      console.error('Error withdrawing job:', error);
      toast.error('Failed to withdraw job');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Function to get company avatar background color
  const getCompanyAvatarColor = (companyName) => {
    const colors = [
      'bg-blue-600',
      'bg-green-600',
      'bg-purple-600',
      'bg-red-600',
      'bg-indigo-600',
      'bg-pink-600',
      'bg-teal-600',
      'bg-orange-600'
    ];
    const index = companyName ? companyName.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Transform job data for ResumeUpload component
  const getJobDetailsForUpload = () => {
    if (!job) return null;
    
    const transformedJob = {
      jobId: jobId,
      jobtitle: job.title || 'Unknown Position', // ResumeUpload expects 'jobtitle' not 'position'
      company: job.company || 'Unknown Company',
      location: job.location || 'Not specified',
      employmentType: job.type || 'Full-time',
      experience: job.experience || 'Not specified',
      salary: job.salary || 'Not disclosed',
      posted: job.postedDate ? formatDate(job.postedDate) : 'Not specified', // Add posted date
      description: job.description || 'No description available',
      // Map to the property names expected by ResumeUpload component
      responsibilities: Array.isArray(job.keyResponsibilities) ? job.keyResponsibilities : [],
      requiredSkills: Array.isArray(job.skills) ? job.skills : [],
      preferredQualifications: Array.isArray(job.preferredQualifications) ? job.preferredQualifications : []
    };
    
    console.log('Transformed job data for ResumeUpload:', transformedJob);
    return transformedJob;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error loading job details</div>
          <div className="text-gray-500 mb-4">{error || 'Job not found'}</div>
          <button
            onClick={() => navigate('/marketplace/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-0 px-0">
      {showResumeUpload ? (
        <div className="w-full max-w-6xl bg-gray-50">
            <MarketplaceResumeUpload 
              onBack={() => {
                setShowResumeUpload(false);
                fetchResumeCount(); // Refresh resume count when going back
              }} 
              jobDetails={getJobDetailsForUpload()} 
            />
        </div>
      ) : showSavedResumes ? (
        <div className="w-full max-w-6xl bg-gray-50">
          <SavedResumes onBack={() => setShowSavedResumes(false)} jobId={jobId} jobtitle={job?.title} />
        </div>
      ) : showCandidateList ? (
        <div className="w-full max-w-6xl bg-gray-50">
          <MarketplaceCandidateList 
            onBack={() => {
              setShowCandidateList(false);
              fetchResumeCount(); // Refresh resume count when going back
            }} 
            job={job} 
          />
        </div>
      ) : (
        <div className="w-full max-w-6xl bg-gray-50">
        {/* Improved Header Row */}
        <div className="bg-gray-50 border-b border-gray-200 w-full px-4 md:px-0 pt-6 pb-2 flex flex-col gap-2">
          {/* Back Button */}
          <div className="mb-2">
            <button
              onClick={() => navigate('/marketplace/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-xs text-blue-600 font-semibold mb-1">JOB DETAILS</div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBookmarkToggle}
                disabled={isBookmarking}
                className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                  job.isBookmarked
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isBookmarking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Bookmark className={`h-4 w-4 mr-2 ${job.isBookmarked ? 'fill-current' : ''}`} />
                {job.isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
              
              {!isJobPicked ? (
                <button 
                  onClick={handlePickJob}
                  disabled={isPicking}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPicking ? 'Picking...' : 'Pick Job'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowResumeUpload(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-base cursor-pointer"
                  >
                    Submit Resume
                  </button>
                  <div className="relative menu-container">
                    <button
                      onClick={handleMenuToggle}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                    
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <div className="py-1">
                          <button
                            onClick={handleReport}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          >
                            Report
                          </button>
                          <button
                            onClick={handleWithdrawJob}
                            disabled={isWithdrawing}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isWithdrawing ? 'Withdrawing...' : 'Withdraw Job'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between w-full gap-2 flex-wrap mt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-sm text-gray-700 font-medium">
                <div className={`w-5 h-5 ${getCompanyAvatarColor(job.company)} text-white rounded-full flex items-center justify-center text-xs font-semibold`}>
                  {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                </div>
                {job.company}
              </span>
              <span className="h-5 w-px bg-gray-200 mx-1 hidden md:inline-block"></span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <MapPin size={16} className="text-gray-500" />
                {job.location}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <Briefcase size={16} className="text-gray-500" />
                {job.type}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <Calendar size={16} className="text-gray-500" />
                {job.experience}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <IndianRupee size={16} className="text-gray-500" />
                {job.salary}
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-sm font-medium text-green-700">
                <img src="/money.png" alt="" className="w-4 h-4" />
                {job.commissionRate || 0}% Commission
              </span>
              <span className="h-5 w-px bg-gray-200 mx-1 hidden md:inline-block"></span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <CalendarDays size={16} className="text-gray-500" />
                Posted {formatDate(job.postedDate)}
              </span>
            </div>
            <button 
              onClick={() => setShowCandidateList(true)}
              className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <Users size={18} className="text-white" />
              {resumeCount} Candidate List 
              <svg xmlns='http://www.w3.org/2000/svg' className='inline ml-1' width='18' height='18' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main Content Row */}
        <div className="flex flex-col lg:flex-row gap-8 w-full mt-8">
          {/* Left: Job Description Card */}
          <div className="flex-1 rounded-xl p-6 md:p-10 mb-6 lg:mb-0 bg-gray-50">
            <div className="text-xl font-bold mb-4">Job Description:</div>
            <p className="text-gray-700 mb-6 whitespace-pre-line">{job.description}</p>
            
            {job.keyResponsibilities && job.keyResponsibilities.length > 0 && (
              <>
                <div className="text-lg font-semibold mb-2">Key Responsibilities:</div>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                  {job.keyResponsibilities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            
            {job.skills && job.skills.length > 0 && (
              <>
                <div className="text-lg font-semibold mb-2">Required Skills & Experience:</div>
                <ul className="list-disc pl-6 mb-6 text-gray-700">
                  {job.skills.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          
          {/* Right: Commission & Payout and Application Statistics */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6" style={{ minWidth: 320 }}>
            {/* Commission & Payout Component */}
            <CommissionCard job={job} />

            {/* Application Statistics Component */}
            <div className="rounded-2xl p-6 flex flex-col items-center bg-gray-50 shadow-sm border border-gray-200">
              <h4 className="text-2xl font-bold mb-4 text-black">Application Statistics</h4>
              {/* Donut Chart and Legend (replicated from recruiter design) */}
              <div className="flex flex-col items-center w-full">
                <div className="relative w-72 h-72 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Total Application', value: job.totalApplications || 0 },
                          { name: 'Shortlisted', value: job.shortlisted || 0 },
                          { name: 'Interviewed', value: job.interviewed || 0 },
                          { name: '2nd Round Interviewed', value: job.secondRoundInterviewed || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={112}
                        outerRadius={130}
                        fill="#8884d8"
                        paddingAngle={4}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {['#1E75FF', '#0F172A', '#64748B', '#003A8D'].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} stroke={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center" style={{padding: '32px 0'}}>
                    <div className="text-5xl font-bold leading-none">{job.totalApplications || 0}</div>
                    <div className="text-gray-500 text-lg mt-2">Total Applications</div>
                  </div>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-4 w-full">
                  {[
                    { name: 'Total Application', value: job.totalApplications || 0, color: '#1E75FF' },
                    { name: 'Shortlisted', value: job.shortlisted || 0, color: '#0F172A' },
                    { name: 'Interviewed', value: job.interviewed || 0, color: '#64748B' },
                    { name: '2nd Round Interviewed', value: job.secondRoundInterviewed || 0, color: '#003A8D' },
                  ].map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="flex-grow text-base text-gray-700">{entry.name}</span>
                      <span className="bg-gray-800 text-white py-1 px-3 rounded-2xl text-sm font-medium">{entry.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceJobDetails;
