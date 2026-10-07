import React, { useState, useEffect } from 'react';
import PartnerCard from "./Partner_Card"

const RecruitmentPartnersSection = ({ jobData, onViewCandidates }) => {
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    if (jobData && jobData.recruitmentPartners) {
      // Transform the populated recruitmentPartners data
      const partners = jobData.recruitmentPartners.map(partner => ({
        id: partner._id,
        name: partner.fullName || partner.email,
        email: partner.email,
        location: partner.location || 'Not specified',
        description: partner.bio || 'No description available',
        candidatesSubmitted: 0, // This would need to be calculated from actual data
        placementSuccess: 0, // This would need to be calculated from actual data
        redFlagCandidates: 0, // This would need to be calculated from actual data
        joinedDate: partner.createdAt
      }));

      setPartners(partners);
    } else {
      setPartners([]);
    }
  }, [jobData]);


  return (
    <div className="bg-gray-50 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recruitment Partners</h2>

      {partners.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No recruitment partners found</div>
          <div className="text-sm text-gray-400">Partners will appear here when they pick this job</div>
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} onViewCandidates={onViewCandidates} />
          ))}
        </div>
      )}
    </div>
  )
}

export default RecruitmentPartnersSection
