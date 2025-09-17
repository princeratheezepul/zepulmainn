import React from 'react';
import JobCard from './JobCard';

const JobListings = ({ 
  searchQuery, 
  sortBy, 
  onSortChange, 
  sortOptions 
}) => {
  // Mock data for jobs
  const jobs = [
    {
      id: 1,
      title: 'Product Designer',
      company: 'Google',
      companyLogo: 'https://via.placeholder.com/40x40/4285F4/FFFFFF?text=G',
      description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
      location: 'Remote',
      jobType: 'Full time',
      experience: '5+ years',
      salary: '₹100k-₹160k',
      postedDate: 'Posted 15 May, 2025',
      status: 'New',
      companiesPicked: '20+ Companies Picked',
      timeLeft: '3d left'
    },
    {
      id: 2,
      title: 'Product Designer',
      company: 'Google',
      companyLogo: 'https://via.placeholder.com/40x40/4285F4/FFFFFF?text=G',
      description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
      location: 'Remote',
      jobType: 'Full time',
      experience: '5+ years',
      salary: '₹100k-₹160k',
      postedDate: 'Posted 15 May, 2025',
      status: 'New',
      companiesPicked: '20+ Companies Picked',
      timeLeft: '3d left'
    },
    {
      id: 3,
      title: 'Product Designer',
      company: 'Google',
      companyLogo: 'https://via.placeholder.com/40x40/4285F4/FFFFFF?text=G',
      description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
      location: 'Remote',
      jobType: 'Full time',
      experience: '5+ years',
      salary: '₹100k-₹160k',
      postedDate: 'Posted 15 May, 2025',
      status: 'New',
      companiesPicked: '20+ Companies Picked',
      timeLeft: '3d left'
    },
    {
      id: 4,
      title: 'Product Designer',
      company: 'Google',
      companyLogo: 'https://via.placeholder.com/40x40/4285F4/FFFFFF?text=G',
      description: "We're looking for a Product Designer to craft clean, user-friendly digital experiences. You'll work with product and engineering teams to design wireframes, prototypes, and UI flows. 5+ years of experience in product or UX/UI design.",
      location: 'Remote',
      jobType: 'Full time',
      experience: '5+ years',
      salary: '₹100k-₹160k',
      postedDate: 'Posted 15 May, 2025',
      status: 'New',
      companiesPicked: '20+ Companies Picked',
      timeLeft: '3d left'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          16 Jobs Found for "{searchQuery}"
        </h1>
      </div>

      {/* Sort By */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobListings;
