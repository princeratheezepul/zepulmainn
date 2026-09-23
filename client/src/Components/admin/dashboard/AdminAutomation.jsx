import React from 'react';
import { PageHead, MetricGrid, Section, InfoGrid, Pipeline, LoadingRow } from './AdminUI';
import { sumField } from './useAdminPlatformData';

const AdminAutomation = ({ platform }) => {
  const { jobs, candidates, loading } = platform;

  const applications = sumField(jobs, 'totalApplication_number');
  const shortlisted = sumField(jobs, 'shortlisted_number');
  const interviewed = sumField(jobs, 'interviewed_number');
  const secondRound = sumField(jobs, '2ndround_interviewed_number');
  const withCutoff = jobs.filter((j) => j.cvStrengthCutoff != null).length;

  const completion = applications ? Math.round((candidates.length / applications) * 100) : 0;

  return (
    <>
      <PageHead
        eyebrow="Platform intelligence"
        title="AI & Automation"
        sub="Monitor AI interview, CV analysis, coding and workflow services"
      />

      {loading ? (
        <LoadingRow label="Loading automation metrics…" />
      ) : (
        <MetricGrid
          items={[
            { label: 'Resumes Processed', value: applications },
            { label: 'Jobs with CV Cut-off', value: withCutoff, delta: `of ${jobs.length} jobs` },
            { label: 'Shortlisted by AI', value: shortlisted },
            { label: 'AI Interviews', value: interviewed },
            { label: 'Second Round', value: secondRound },
            { label: 'Scorecards Generated', value: candidates.length },
            { label: 'Workflow Completion', value: `${completion}%` },
            { label: 'Awaiting Evaluation', value: Math.max(applications - candidates.length, 0) },
          ]}
        />
      )}

      <Section>Automated workflow</Section>
      <Pipeline
        stages={[
          { label: 'Resumes', value: applications },
          { label: 'CV Strength', value: shortlisted },
          { label: 'Coding Test', value: interviewed },
          { label: 'AI Interview', value: interviewed },
          { label: 'Scorecards', value: candidates.length },
          { label: 'Second Round', value: secondRound },
        ]}
      />

      <Section>Service health</Section>
      <InfoGrid
        items={[
          {
            title: 'CV Strength',
            sub: `${withCutoff} requirements enforcing a cut-off score`,
            status: withCutoff ? 'Operational' : 'No cut-offs set',
            tone: withCutoff ? 'green' : 'amber',
          },
          {
            title: 'AI Interview',
            sub: `${interviewed} interviews conducted across all requirements`,
            status: interviewed ? 'Operational' : 'Idle',
            tone: interviewed ? 'green' : 'grey',
          },
          {
            title: 'Scorecards',
            sub: `${candidates.length} decision-ready scorecards delivered`,
            status: candidates.length ? 'Healthy' : 'Idle',
            tone: candidates.length ? 'green' : 'grey',
          },
        ]}
      />
    </>
  );
};

export default AdminAutomation;
