import React from 'react';
import { Pencil } from 'lucide-react';
import { Card, StatusPill, Chip } from '../../dashboard/DashboardUI';
import { jobCompanyName } from '../../dashboard/dashboardUtils';

/**
 * Clicking the card opens the job's own page. Editing is a separate action on
 * the card, because the edit panel is a side sheet — opening it on every click
 * meant there was no way to simply go and read the job.
 */
const ManagerJobCard = ({ job, onClick, onEdit, onShowCandidates }) => {
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
  const recruiters = job.assignedRecruiters?.length || 0;
  const candidates = job.totalApplication_number || 0;

  return (
    <Card
      className="p-[17px] cursor-pointer hover:border-[#c7d5ff] transition-colors flex flex-col"
      onClick={() => onClick(job)}
    >
      <div className="flex items-start justify-between gap-2">
        <StatusPill tone={status.tone}>{status.text}</StatusPill>
        <div className="flex items-center gap-2">
          {job.cvStrengthCutoff != null && (
            <span className="text-[#024bff] font-extrabold text-[11px]">CV &ge; {job.cvStrengthCutoff}</span>
          )}
          {onEdit && (
            <button
              type="button"
              title="Edit job"
              aria-label={`Edit ${job.jobtitle}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(job);
              }}
              className="shrink-0 text-[#8991a0] hover:text-[#024bff] transition-colors cursor-pointer"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>

      <h3 className="text-sm font-bold mt-3 mb-1.5">{job.jobtitle}</h3>

      <div className="text-[10px] text-[#778092] leading-[1.8]">
        {jobCompanyName(job)}
        <br />
        {[job.type, job.location].filter(Boolean).join(' · ') || 'Location not set'}
        {job.experience ? ` · ${job.experience}+ yrs` : ''}
        <br />
        {openings} opening{openings !== 1 ? 's' : ''} ·{' '}
        <span
          className="text-[#024bff] font-bold hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            onShowCandidates(job);
          }}
        >
          {candidates} candidates
        </span>
      </div>

      <div className="flex-1">
        <Chip>{job.employmentType || 'Full-time'}</Chip>
        <Chip>
          {recruiters} recruiter{recruiters !== 1 ? 's' : ''} assigned
        </Chip>
      </div>
    </Card>
  );
};

export default ManagerJobCard;
