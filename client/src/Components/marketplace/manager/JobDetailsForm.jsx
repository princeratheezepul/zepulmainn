import React, { useEffect, useMemo, useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';
import DateInput from './DateInput';
import PrioritySelect from './PrioritySelect';

const JobDetailsForm = ({ onClose, onSave, companyData, companyList, onRequestCompanies }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    employmentType: '',
    department: '',
    workMode: '',
    jobDescription: '',
    skills: '',
    experience: '',
    openings: '',
    packageRange: '',
    priority: 'Low',
    hiringDeadline: '',
    tat: '15 Days',
    commissionRate: '',
    resumeAnalysisPoints: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const companyOptions = useMemo(() => {
    if (companyData) {
      return [companyData.name];
    }
    if (Array.isArray(companyList) && companyList.length > 0) {
      return companyList.map((company) => {
        if (typeof company === 'string') {
          return company;
        }
        if (company && typeof company === 'object') {
          return company.name || company.companyName || '';
        }
        return '';
      }).filter(Boolean);
    }
    return [];
  }, [companyData, companyList]);

  const employmentTypeOptions = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
  const workModeOptions = ['Hybrid', 'Remote', 'On-site', 'Flexible'];
  const experienceOptions = ['0 - 2 Years', '2 - 5 Years', '5 - 10 Years', '10+ Years'];
  const openingsOptions = ['0-10', '11-50', '51-100', '100+'];
  const packageRangeOptions = ['₹50k-₹100k', '₹100k-₹160k', '₹160k-₹250k', '₹250k-₹400k', '₹400k+'];
  const priorityOptions = ['Low', 'Medium', 'High'];
  const tatOptions = ['7 Days', '15 Days', '30 Days', '45 Days', '60 Days'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    if (!formData.company) {
      newErrors.company = 'Company is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment type is required';
    }
    
    if (!formData.workMode) {
      newErrors.workMode = 'Work mode is required';
    }
    
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = 'Job description is required';
    }
    
    if (!formData.skills.trim()) {
      newErrors.skills = 'Skills are required';
    }
    
    if (!formData.experience) {
      newErrors.experience = 'Experience is required';
    }
    
    if (!formData.openings) {
      newErrors.openings = 'Openings is required';
    }
    
    if (!formData.packageRange) {
      newErrors.packageRange = 'Package range is required';
    }
    
    if (!formData.hiringDeadline) {
      newErrors.hiringDeadline = 'Hiring deadline is required';
    }
    
    if (!formData.commissionRate) {
      newErrors.commissionRate = 'Commission rate is required';
    } else {
      const commissionRate = parseFloat(formData.commissionRate);
      if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
        newErrors.commissionRate = 'Commission rate must be a number between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const formattedData = {
        ...formData,
        resumeAnalysisPoints: formData.resumeAnalysisPoints
          ? formData.resumeAnalysisPoints
              .split('\n')
              .map(point => point.trim())
              .filter(Boolean)
          : []
      };

      await onSave(formattedData);
      showToast('Job created successfully!', 'success');
      // Close the form after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      showToast('Error creating job. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  useEffect(() => {
    if (!companyData && (!companyList || companyList.length === 0) && typeof onRequestCompanies === 'function') {
      onRequestCompanies();
    }
  }, [companyData, companyList, onRequestCompanies]);

  return (
    <div className="h-full bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="h-full p-3 mb-6">
        <div className="w-full">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              <div className="text-xl font-bold text-gray-900 mb-2">Job Details</div>              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
                <FormInput
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={(value) => handleInputChange('jobTitle', value)}
                  error={errors.jobTitle}
                  placeholder="job title"
                  required
                />
                
                <FormSelect
                  label="Company"
                  value={formData.company}
                  onChange={(value) => handleInputChange('company', value)}
                  options={companyOptions}
                  error={errors.company}
                  placeholder="Select company"
                  required
                />
                
                <FormInput
                  label="Location"
                  value={formData.location}
                  onChange={(value) => handleInputChange('location', value)}
                  error={errors.location}
                  placeholder="Hyderabad, India"
                  required
                />
                
                <FormSelect
                  label="Employment Type"
                  value={formData.employmentType}
                  onChange={(value) => handleInputChange('employmentType', value)}
                  options={employmentTypeOptions}
                  error={errors.employmentType}
                  placeholder="Select employment type"
                  required
                />
                
                <FormInput
                  label="Department"
                  value={formData.department}
                  onChange={(value) => handleInputChange('department', value)}
                  error={errors.department}
                  placeholder="Enter department"
                />
                
                <FormSelect
                  label="Work Mode"
                  value={formData.workMode}
                  onChange={(value) => handleInputChange('workMode', value)}
                  options={workModeOptions}
                  error={errors.workMode}
                  placeholder="Select work mode"
                  required
                />
              </div>
            

            {/* Job Description & Skills Section */}
           
              <div className="text-xl font-bold text-gray-900 mb-3 mt-4">Job Description & Skills</div>
              
              <div className="space-y-6">
                <FormTextarea
                  label="Job Description"
                  value={formData.jobDescription}
                  onChange={(value) => handleInputChange('jobDescription', value)}
                  error={errors.jobDescription}
                  placeholder="Enter job description"
                  rows={6}
                  required
                />
                <FormTextarea
                  label="Resume Analysis Points"
                  value={formData.resumeAnalysisPoints}
                  onChange={(value) => handleInputChange('resumeAnalysisPoints', value)}
                  placeholder="Add bullet points (optional, one per line)"
                  rows={4}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Skills"
                    value={formData.skills}
                    onChange={(value) => handleInputChange('skills', value)}
                    error={errors.skills}
                    placeholder="Java, Nodejs"
                    required
                  />
                  
                  <FormSelect
                    label="Experience"
                    value={formData.experience}
                    onChange={(value) => handleInputChange('experience', value)}
                    options={experienceOptions}
                    error={errors.experience}
                    placeholder="Select experience"
                    required
                  />
                  
                  <FormSelect
                    label="Openings"
                    value={formData.openings}
                    onChange={(value) => handleInputChange('openings', value)}
                    options={openingsOptions}
                    error={errors.openings}
                    placeholder="Select openings"
                    required
                  />
                  
                  <FormSelect
                    label="Package Range"
                    value={formData.packageRange}
                    onChange={(value) => handleInputChange('packageRange', value)}
                    options={packageRangeOptions}
                    error={errors.packageRange}
                    placeholder="Select package range"
                    required
                  />
                </div>
              </div>
            

            {/* Job Settings Section */}
            
              <div className="text-xl font-bold text-gray-900 mb-3 mt-4">Job Settings</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PrioritySelect
                  label="Priority"
                  value={formData.priority}
                  onChange={(value) => handleInputChange('priority', value)}
                  options={priorityOptions}
                  error={errors.priority}
                />
                
                <FormInput
                  label="Commission Rate (%)"
                  value={formData.commissionRate}
                  onChange={(value) => handleInputChange('commissionRate', value)}
                  error={errors.commissionRate}
                  placeholder="Enter commission rate (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="mt-6">
                <div className="space-y-4">
                  <DateInput
                    label="Hiring Deadline / TAT"
                    deadlineValue={formData.hiringDeadline}
                    tatValue={formData.tat}
                    onDeadlineChange={(value) => handleInputChange('hiringDeadline', value)}
                    onTatChange={(value) => handleInputChange('tat', value)}
                    tatOptions={tatOptions}
                    deadlineError={errors.hiringDeadline}
                    tatError={errors.tat}
                  />
                </div>
              </div>

            {/* Action Buttons */}
            
              <div className="flex justify-between space-x-4 mt-4">
                <button style={{borderRadius:12}}
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button style={{borderRadius:12}}
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Job</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsForm;
