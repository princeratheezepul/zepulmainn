import React from 'react';
import { Card, StatusPill, Chip } from '../../dashboard/DashboardUI';

const RecruiterJobCard = ({ job, onClick }) => {
  const deadlinePassed =
    job.hiringDeadline && new Date(job.hiringDeadline) < new Date(new Date().setHours(0, 0, 0, 0));

  const status = (() => {
    if (job.isClosed) return { text: 'Closed', tone: 'grey' };
    if (deadlinePassed) return { text: 'Deadline passed', tone: 'red' };
    if (job.priority?.includes('High')) return { text: 'Urgent', tone: 'amber' };
    const days = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
    if (days <= 7) return { text: 'New', tone: 'green' };
    return { text: 'Live', tone: 'green' };
  })();

  const openings = job.openpositions || 1;

  return (
    <Card
      className="p-[17px] cursor-pointer hover:border-[#c7d5ff] transition-colors flex flex-col"
      onClick={() => onClick(job)}
    >
      <div className="flex items-start justify-between gap-2">
        <StatusPill tone={status.tone}>{status.text}</StatusPill>
        {job.cvStrengthCutoff != null && (
          <span className="text-[#024bff] font-extrabold text-[11px]">CV &ge; {job.cvStrengthCutoff}</span>
        )}
      </div>

      <h3 className="text-sm font-bold mt-3 mb-1.5">{job.jobtitle}</h3>

      <div className="text-[10px] text-[#778092] leading-[1.8]">
        {job.company || 'Zepul'}
        <br />
        {[job.type, job.location].filter(Boolean).join(' · ') || 'Location not set'}
        {job.experience ? ` · ${job.experience}+ yrs` : ''}
        <br />
        {openings} opening{openings !== 1 ? 's' : ''} · {job.totalApplication_number || 0} candidates
      </div>

      <div className="flex-1">
        <Chip>{job.employmentType || 'Full-time'}</Chip>
        <Chip>{job.shortlisted_number || 0} shortlisted</Chip>
      </div>

      <button
        className="mt-3 w-full border border-[#e7ebf2] rounded-lg py-2 text-[11px] font-bold text-[#024bff] hover:bg-[#f6f8fb] transition-colors cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick(job);
        }}
      >
        Open job
      </button>
    </Card>
  );
};

export default RecruiterJobCard;
