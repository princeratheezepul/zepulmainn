import React, { useState, useEffect } from 'react';
import CompanyOverview from './CompanyOverview';
import JobCard from './JobCard';
import JobEditForm from './JobEditForm';
import JobDetailsForm from './JobDetailsForm';
import ManagerCandidateList from './ManagerCandidateList';

const JobsPage = ({ company, onBack }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  useEffect(() => {
    if (company?.id) {
      fetchCompanyData(company.id);
      fetchJobs(company.id);
    }
  }, [company]);

  const fetchCompanyData = async (companyId) => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-company/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the data to match CompanyOverview component expectations
          const transformedData = {
            name: data.company.name,
            description: data.company.description,
            website: data.company.websiteUrl,
            headquarters: `Headquarters: ${data.company.headquartersLocation}`,
            offices: `Offices: ${data.company.hiringLocations}`,
            industry: data.company.industry,
            hiresMade: data.company.hiresMade,
            activeJobs: data.company.activeJobs
          };
          setCompanyData(transformedData);
        } else {
          setError(data.message || 'Failed to fetch company data');
        }
      } else {
        setError('Failed to fetch company data');
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError('Error fetching company data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async (companyId) => {
    try {
      setJobsLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        setJobsError('No authentication token found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-company/${companyId}/jobs`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobs(data.jobs || []);
        } else {
          setJobsError(data.message || 'Failed to fetch jobs');
        }
      } else {
        setJobsError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setJobsError('Error fetching jobs');
    } finally {
      setJobsLoading(false);
    }
  };

  const filters = ['All', 'New', 'Urgent', 'Actively Recruiting', 'Archived'];

  const handleViewCandidates = (job) => {
    try {
      setSelectedJob(job);
      setShowCandidateList(true);
    } catch (error) {
      console.error('Error in handleViewCandidates:', error);
    }
  };

  const handleBackFromCandidates = () => {
    setShowCandidateList(false);
    setSelectedJob(null);
  };

  const handleCreateJob = async (jobData) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    
    if (!userInfo?.data?.accessToken) {
      throw new Error('No authentication token found');
    }

    // Add companyId to the job data
    const jobDataWithCompany = {
      ...jobData,
      companyId: company?.id
    };

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/create-marketplace-job`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userInfo.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobDataWithCompany)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('Job created successfully:', data.job);
      // Refresh the jobs list after creating a new job
      if (company?.id) {
        fetchJobs(company.id);
      }
      return data.job;
    } else {
      throw new Error(data.message || 'Failed to create job');
    }
  };

  const handleCloseCreateJob = () => {
    setShowCreateJob(false);
  };

  // If showing create job form, render it
  if (showCreateJob) {
    return (
      <JobDetailsForm 
        onClose={handleCloseCreateJob}
        onSave={handleCreateJob}
        companyData={companyData}
      />
    );
  }

  // If showing candidate list, render it
  if (showCandidateList && selectedJob) {
    return (
      <ManagerCandidateList 
        job={selectedJob}
        onBack={handleBackFromCandidates}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Loading company data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
            <button 
              onClick={() => company?.id && fetchCompanyData(company.id)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
      {/* Company Overview */}
      {companyData && <CompanyOverview company={companyData} />}

      {/* Jobs Section */}
      <div className="mb-8">
        <div className="text-3xl font-bold text-gray-900 mb-6">
          Jobs at {companyData?.name || 'Company'}
        </div>
        
        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-1">
            {filters.map((filter) => (
              <div
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {filter}
              </div>
            ))}
          </div>
          
          {/* Add Job Button */}
          <div 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 cursor-pointer"
            onClick={() => setShowCreateJob(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add job</span>
          </div>
        </div>

        {/* Job Cards */}
        <div className="space-y-6">
          {/* Loading State */}
          {jobsLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Loading jobs...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {jobsError && !jobsLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{jobsError}</span>
              </div>
              <button 
                onClick={() => company?.id && fetchJobs(company.id)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Jobs List */}
          {!jobsLoading && !jobsError && (
            <>
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new job for this company.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateJob(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Job
                    </button>
                  </div>
                </div>
              ) : (
                jobs.map((job) => {
                  try {
                    return (
                      <JobCard 
                        key={job.id || job._id || Math.random()} 
                        job={job} 
                        onViewCandidates={handleViewCandidates}
                      />
                    );
                  } catch (error) {
                    console.error('Error rendering job card:', error, job);
                    return (
                      <div key={job.id || job._id || Math.random()} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-600">Error rendering job card</div>
                      </div>
                    );
                  }
                })
              )}
            </>
          )}
        </div>
      </div>
      </div>

    </div>
  );
};

export default JobsPage;
