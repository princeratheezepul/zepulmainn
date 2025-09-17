import React, { useState, useEffect } from 'react';
import { LicensedPartnersSection, JobDetailsSection, CandidateListPage } from './index';

const JobEditForm = ({ job, onClose, onSave }) => {
  const [showCandidateList, setShowCandidateList] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: job?.title || 'Product Designer',
    commission: job?.commission || '8%',
    location: job?.location || 'Remote - Hyderabad',
    type: job?.type || 'Full time',
    experience: job?.experience || '5+ years',
    salary: job?.salary || '₹100k-₹160k',
    postedDate: job?.postedDate || 'Posted 15 May, 2025',
    description: job?.description || 'Google is looking for a Product Designer who\'s passionate about building intuitive, accessible, and delightful user experiences. You\'ll work closely with product managers, engineers, and fellow designers to shape features from concept to launch. This is a hands-on role where your design decisions will directly impact real users.',
    skills: job?.skills || 'UX Design, UI design, Interaction Design, Figma, Photoshop, Illustrator',
    companiesPicked: job?.companiesPicked || '20+'
  });

  useEffect(() => {
    if (job?._id || job?.id) {
      fetchJobData();
    }
  }, [job]);

  const fetchJobData = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      const jobId = job?._id || job?.id;
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setJobData(data.job);
        } else {
          setError(data.message || 'Failed to fetch job data');
        }
      } else {
        setError('Failed to fetch job data');
      }
    } catch (err) {
      console.error('Error fetching job data:', err);
      setError('Error fetching job data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleViewCandidates = (partner) => {
    setShowCandidateList(true);
  };

  const handleBackFromCandidates = () => {
    setShowCandidateList(false);
  };

  // If showing candidate list, render the candidate list page
  if (showCandidateList) {
    return <CandidateListPage onBack={handleBackFromCandidates} />;
  }

  if (loading) {
    return (
      <div className="bg-white h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="bg-white h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">Error loading job details</div>
            <div className="text-gray-500">{error || 'Job not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen flex flex-col">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-8">
        {/* Job Details Section */}
        <JobDetailsSection jobData={jobData} />

        {/* Licensed Partners Section */}
        <LicensedPartnersSection 
          jobData={jobData}
          onViewCandidates={handleViewCandidates} 
        />
      </div>
    </div>
  );
};

export default JobEditForm;
