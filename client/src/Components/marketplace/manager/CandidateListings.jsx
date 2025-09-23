import React from 'react';
import CandidateCard from './CandidateCard';

const CandidateListings = ({ 
  searchQuery, 
  sortBy, 
  onSortChange, 
  sortOptions 
}) => {
  // Mock data for candidates
  const candidates = [
    {
      id: 1,
      name: 'Michael Singh',
      role: 'Software Engineer',
      email: 'Michael.singh@gmail.com',
      phone: '+91 8574246491',
      experience: '5 years',
      location: 'Shimla, India',
      skills: ['Java', 'Spring Boot', 'Microservice', 'AWS'],
      additionalSkills: 5,
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Michael Singh',
      role: 'Software Engineer',
      email: 'Michael.singh@gmail.com',
      phone: '+91 8574246491',
      experience: '5 years',
      location: 'Shimla, India',
      skills: ['Java', 'Spring Boot', 'Microservice', 'AWS'],
      additionalSkills: 5,
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 3,
      name: 'Michael Singh',
      role: 'Software Engineer',
      email: 'Michael.singh@gmail.com',
      phone: '+91 8574246491',
      experience: '5 years',
      location: 'Shimla, India',
      skills: ['Java', 'Spring Boot', 'Microservice', 'AWS'],
      additionalSkills: 5,
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 4,
      name: 'Michael Singh',
      role: 'Software Engineer',
      email: 'Michael.singh@gmail.com',
      phone: '+91 8574246491',
      experience: '5 years',
      location: 'Shimla, India',
      skills: ['Java', 'Spring Boot', 'Microservice', 'AWS'],
      additionalSkills: 5,
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 5,
      name: 'Michael Singh',
      role: 'Software Engineer',
      email: 'Michael.singh@gmail.com',
      phone: '+91 8574246491',
      experience: '5 years',
      location: 'Shimla, India',
      skills: ['Java', 'Spring Boot', 'Microservice', 'AWS'],
      additionalSkills: 5,
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-2xl font-semibold text-gray-900">
          Candidates Found for "{searchQuery}"
        </h3>
      </div>

      {/* Sort By */}
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
};

export default CandidateListings;
