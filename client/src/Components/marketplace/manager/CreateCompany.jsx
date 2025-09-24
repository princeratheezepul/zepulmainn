import React, { useState } from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormTextarea from './FormTextarea';

const CreateCompany = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    industryType: '',
    companySize: '',
    location: '',
    headquartersLocation: '',
    websiteUrl: '',
    companyDescription: '',
    hiringDomains: '',
    jobType: '',
    hiringLocations: '',
    packageRange: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const industryOptions = ['IT', 'Finance', 'Multicare'];
  const companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  const headquartersOptions = ['NewYork, USA', 'California, USA', 'London, UK', 'Berlin, Germany', 'Tokyo, Japan', 'Mumbai, India', 'Bangalore, India'];
  const hiringDomainOptions = ['Tech', 'Sales', 'Marketing'];
  const jobTypeOptions = ['Fulltime', 'Remote', 'Freelance', 'Startup'];
  const hiringLocationOptions = ['Hyderabad, Mumbai, Delhi', 'Bangalore, Chennai, Pune', 'New York, San Francisco', 'London, Berlin', 'Remote'];
  const packageRangeOptions = ['₹50k-₹100k', '₹100k-₹160k', '₹160k-₹250k', '₹250k-₹400k', '₹400k+'];

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
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email';
    }
    
    if (!formData.industryType) {
      newErrors.industryType = 'Industry type is required';
    }
    
    if (!formData.companySize) {
      newErrors.companySize = 'Company size is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.headquartersLocation) {
      newErrors.headquartersLocation = 'Headquarters location is required';
    }
    
    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    }
    
    if (!formData.companyDescription.trim()) {
      newErrors.companyDescription = 'Company description is required';
    }
    
    if (!formData.hiringDomains) {
      newErrors.hiringDomains = 'Hiring domain is required';
    }
    
    if (!formData.jobType) {
      newErrors.jobType = 'Job type is required';
    }
    
    if (!formData.hiringLocations) {
      newErrors.hiringLocations = 'Hiring locations is required';
    }
    
    if (!formData.packageRange) {
      newErrors.packageRange = 'Package range is required';
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
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        showToast('No authentication token found', 'error');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/create-marketplace-company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Company created successfully!', 'success');
        // Call the onSave callback with the created company data
        if (onSave) {
          onSave(data.company);
        }
        // Close the form after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showToast(data.message || 'Failed to create company', 'error');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      showToast('Error creating company. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="flex flex-col">
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

      <div className="flex-1 p-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mx-auto">
          {/* Header */}
          <div className="mb-3">
            <div className="text-lg font-bold text-gray-900">Create New Company</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <FormInput
                label="Company Name"
                value={formData.companyName}
                onChange={(value) => handleInputChange('companyName', value)}
                error={errors.companyName}
                placeholder="Enter company name"
                required
              />
              
              <FormInput
                label="Company Email"
                type="email"
                value={formData.companyEmail}
                onChange={(value) => handleInputChange('companyEmail', value)}
                error={errors.companyEmail}
                placeholder="Enter company email"
                required
              />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <FormSelect
                label="Industry"
                value={formData.industryType}
                onChange={(value) => handleInputChange('industryType', value)}
                options={industryOptions}
                error={errors.industryType}
                placeholder="Select industry"
                required
              />
              
              <FormSelect
                label="Company Size"
                value={formData.companySize}
                onChange={(value) => handleInputChange('companySize', value)}
                options={companySizeOptions}
                error={errors.companySize}
                placeholder="Select company size"
                required
              />
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <FormInput
                label="Location"
                value={formData.location}
                onChange={(value) => handleInputChange('location', value)}
                error={errors.location}
                placeholder="Enter location"
                required
              />
              
              <FormSelect
                label="Headquarters Location"
                value={formData.headquartersLocation}
                onChange={(value) => handleInputChange('headquartersLocation', value)}
                options={headquartersOptions}
                error={errors.headquartersLocation}
                placeholder="Select headquarters location"
                required
              />
            </div>

            {/* Fourth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <FormInput
                label="Website URL"
                value={formData.websiteUrl}
                onChange={(value) => handleInputChange('websiteUrl', value)}
                error={errors.websiteUrl}
                placeholder="Enter website URL"
                required
              />
              
              <div></div> {/* Empty div for spacing */}
            </div>

            {/* Company Description */}
            <FormTextarea
              label="Company Description"
              value={formData.companyDescription}
              onChange={(value) => handleInputChange('companyDescription', value)}
              error={errors.companyDescription}
              placeholder="Enter company description"
              rows={4}
              required
            />

            {/* Fifth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
              <FormSelect
                label="Hiring Domains"
                value={formData.hiringDomains}
                onChange={(value) => handleInputChange('hiringDomains', value)}
                options={hiringDomainOptions}
                error={errors.hiringDomains}
                placeholder="Select hiring domain"
                required
              />
              
              <FormSelect
                label="Preferred Job Types"
                value={formData.jobType}
                onChange={(value) => handleInputChange('jobType', value)}
                options={jobTypeOptions}
                error={errors.jobType}
                placeholder="Select job type"
                required
              />
            </div>

            {/* Sixth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Hiring Locations"
                value={formData.hiringLocations}
                onChange={(value) => handleInputChange('hiringLocations', value)}
                options={hiringLocationOptions}
                error={errors.hiringLocations}
                placeholder="Select hiring locations"
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

            {/* Action Buttons */}
            <div className="flex justify-between space-x-4 pt-6">
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
                  <span>Create Company</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompany;
