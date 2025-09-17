import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Briefcase, Clock, DollarSign, TrendingUp } from "lucide-react"

const JobDetailsSection = ({ jobData }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : 'C';
  };

  const getCompanyAvatarColor = (companyName) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    const index = companyName ? companyName.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (!jobData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-8xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-500">No job data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-8xl mx-auto">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-gray-900">{jobData.jobTitle || 'Product Designer'}</div>
          <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">New</span>
        </div>
      </div>

      {/* Commission Badge */}
      <div className="mb-6">
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          {jobData.commissionRate || 0}% Commission
        </span>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${getCompanyAvatarColor(jobData.mpCompanies?.[0]?.companyName)} rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">
            {getCompanyInitial(jobData.mpCompanies?.[0]?.companyName)}
          </span>
        </div>
        <span className="text-xl font-semibold text-gray-900">
          {jobData.mpCompanies?.[0]?.companyName || 'Company'}
        </span>
      </div>

      {/* Job Details Tags */}
      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {jobData.location || 'Not specified'}
        </span>
        <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          {jobData.jobType || 'Full time'}
        </span>
        <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {jobData.experience ? 
            (jobData.experience.min && jobData.experience.max ? 
              `${jobData.experience.min}-${jobData.experience.max} years` :
              jobData.experience.min ? `${jobData.experience.min}+ years` :
              jobData.experience.max ? `Up to ${jobData.experience.max} years` : 'Not specified'
            ) : 'Not specified'
          }
        </span>
        <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          {jobData.salary ? 
            (jobData.salary.min && jobData.salary.max ? 
              `₹${jobData.salary.min.toLocaleString()} - ₹${jobData.salary.max.toLocaleString()}` :
              jobData.salary.min ? `₹${jobData.salary.min.toLocaleString()}+` :
              jobData.salary.max ? `Up to ₹${jobData.salary.max.toLocaleString()}` : 'Not disclosed'
            ) : 'Not disclosed'
          }
        </span>
        <span className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Posted {formatDate(jobData.createdAt)}
        </span>
      </div>

      {/* Job Description */}
      <div className="mb-6">
        <div className="text-lg font-semibold text-gray-900 mb-3">Job Description:</div>
        <div className="text-gray-700 leading-relaxed">
          {jobData.jobDescription || 'No description available'}
        </div>
      </div>

      {/* Skills Required */}
      <div>
        <div className="text-lg font-semibold text-gray-900 mb-3">Skills Required:</div>
        <div className="text-gray-700">
          {jobData.skills && jobData.skills.length > 0 ? jobData.skills.join(', ') : 'No skills specified'}
        </div>
      </div>
    </div>
  )
}

export default JobDetailsSection
