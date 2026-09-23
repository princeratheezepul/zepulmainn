import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, StatusPill, Chip } from './AdminUI';

const AdminJobCard = ({ job, onClick }) => {
  const navigate = useNavigate();

  const deadlinePassed =
    job.hiringDeadline && new Date(job.hiringDeadline) < new Date(new Date().setHours(0, 0, 0, 0));

  // Closed and past-deadline roles read as inactive; high priority surfaces as
  // urgent, and anything raised in the last week is flagged as new.
  const status = (() => {
    if (job.isClosed) return { text: 'Closed', tone: 'grey' };
    if (deadlinePassed) return { text: 'Deadline passed', tone: 'red' };
    if (job.priority?.includes('High')) return { text: 'Urgent', tone: 'amber' };
    const days = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
    if (days <= 7) return { text: 'New', tone: 'green' };
    return { text: 'Live', tone: 'green' };
  })();

  const company =
    job.company ||
    job.companyName ||
    (job.adminId && `Admin: ${job.adminId.fullname || job.adminId.username}`) ||
    (job.managerId && `Manager: ${job.managerId.fullname || job.managerId.username}`) ||
    'Zepul';

  const openings = job.openpositions || 1;
  const recruiters = job.assignedRecruiters?.length || 0;

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
        {company}
        <br />
        {[job.type, job.location].filter(Boolean).join(' · ') || 'Location not set'}
        {job.experience ? ` · ${job.experience}+ yrs` : ''}
        <br />
        {openings} opening{openings !== 1 ? 's' : ''} · {job.totalApplication_number || 0} candidates
      </div>

      <div className="flex-1">
        <Chip>{job.employmentType || 'Full-time'}</Chip>
        <Chip>
          {recruiters} recruiter{recruiters !== 1 ? 's' : ''} assigned
        </Chip>
      </div>

      {!job.isClosed && !deadlinePassed && (
        <button
          className="mt-3 w-full border border-[#e7ebf2] rounded-lg py-2 text-[11px] font-bold text-[#024bff] hover:bg-[#f6f8fb] transition-colors cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/jobs/${job._id || job.id}`);
          }}
        >
          View job
        </button>
      )}
    </Card>
  );
};

export default AdminJobCard;
