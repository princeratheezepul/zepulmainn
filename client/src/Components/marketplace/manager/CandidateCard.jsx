import React from 'react';

const CandidateCard = ({ candidate }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Profile Image */}
          {/* <div className="flex-shrink-0">
            <img
              src={candidate.profileImage}
              alt={candidate.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div> */}

          {/* Candidate Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-1">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={candidate.profileImage}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {candidate.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{candidate.role}</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex items-center space-x-6 mb-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {candidate.email}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {candidate.phone}
              </div>
           
            {/* Experience and Location */}
            
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                {candidate.experience}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {candidate.location}
              </div>
            </div>

            {/* Skills */}
            <div className='flex justify-between'>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
                {candidate.additionalSkills > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{candidate.additionalSkills}
                  </span>
                )}
              </div>
               {/* View Scorecard Button */}
                <div className="flex-shrink-0 ml-4 text-sm">
                  <button style={{borderRadius:10}} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">
                    View Scorecard
                  </button>
                </div>
              </div>
          </div>
        </div>       
      </div>
    </div>
  );
};

export default CandidateCard;
