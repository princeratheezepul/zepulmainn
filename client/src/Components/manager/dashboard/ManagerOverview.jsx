import React from 'react';
import {
  PageHead,
  MetricGrid,
  Section,
  Pipeline,
  JobGrid,
  LoadingRow,
  PrimaryButton,
} from '../../dashboard/DashboardUI';
import {
  isJobOpen,
  isJobUrgent,
  sumField,
  jobCompanyName,
  greeting,
  pipelineStages,
  atClientReview,
  hasAiInterview,
} from './useManagerPlatformData';

const ManagerOverview = ({ platform, managerName, onNavigate, onOpenJob }) => {
  const { jobs, recruiters, resumes, resumeStats, marketplace, loading } = platform;

  const openJobs = jobs.filter(isJobOpen);
  const closedJobs = jobs.filter((j) => !isJobOpen(j));
  const clients = new Set(jobs.map(jobCompanyName).filter(Boolean));

  const metrics = [
    { label: 'Active Clients', value: clients.size, delta: `${jobs.length} requirements` },
    { label: 'Active Jobs', value: openJobs.length, delta: `${jobs.length} total` },
    { label: 'Jobs in Marketplace', value: marketplace.activeJobs, delta: `${marketplace.totalJobs} listed` },
    { label: 'Positions Closed', value: closedJobs.length },
    { label: 'Candidates in Pipeline', value: resumes.length, delta: `${resumeStats.pendingResumes} awaiting review` },
    { label: 'Interviews', value: resumes.filter(hasAiInterview).length },
    { label: 'Recruiters', value: recruiters.length },
    { label: 'With Client', value: resumes.filter(atClientReview).length },
  ];

  // Surface the requirements that most need a manager: urgent first, then the
  // open roles with the fewest candidates against them.
  const needsAttention = [...openJobs]
    .sort((a, b) => {
      const urgency = Number(isJobUrgent(b)) - Number(isJobUrgent(a));
      if (urgency) return urgency;
      return (a.totalApplication_number || 0) - (b.totalApplication_number || 0);
    })
    .slice(0, 6);

  return (
    <>
      <PageHead
        eyebrow="Zepul control centre"
        title={`${greeting()}, ${managerName}`}
        sub="Manage Zepul-generated business, partners, clients and revenue"
        action={<PrimaryButton onClick={() => onNavigate('Jobs')}>+ Create Job</PrimaryButton>}
      />

      {loading ? <LoadingRow label="Loading your business…" /> : <MetricGrid items={metrics} />}

      <Section>Live execution</Section>
      <Pipeline stages={pipelineStages(resumes)} />

      <Section>Requirements needing attention</Section>
      <JobGrid
        jobs={needsAttention.map((job) => ({
          id: job._id,
          title: job.jobtitle,
          company: jobCompanyName(job),
          location: job.location || 'Location not set',
          experience: job.experience ? `${job.experience}+ yrs` : '',
          openings: job.openpositions || 0,
          candidates: job.totalApplication_number || 0,
          cutoff: job.cvStrengthCutoff,
          status: isJobUrgent(job) ? 'Urgent' : 'Live',
          statusTone: isJobUrgent(job) ? 'amber' : 'green',
          chips: [
            `${job.assignedRecruiters?.length || 0} recruiters`,
            job.totalApplication_number ? 'AI evaluation' : 'No candidates yet',
          ],
          onClick: () => onOpenJob(job),
        }))}
        empty={
          loading
            ? 'Loading…'
            : openJobs.length
              ? 'Every open requirement has candidates against it.'
              : 'No open requirements right now.'
        }
      />

      <Section>Sum of pipeline</Section>
      <MetricGrid
        items={[
          { label: 'Applications', value: sumField(jobs, 'totalApplication_number') },
          { label: 'Shortlisted', value: sumField(jobs, 'shortlisted_number') },
          { label: 'Interviewed', value: sumField(jobs, 'interviewed_number') },
          { label: 'Reviewed Resumes', value: resumeStats.reviewedResumes },
        ]}
      />
    </>
  );
};

export default ManagerOverview;
