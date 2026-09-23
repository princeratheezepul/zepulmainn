import React from 'react';
import { PageHead, Section } from '../../dashboard/DashboardUI';
import CandidateSubmissionChart from './CandidateSubmissionChart';
import TotalApplications from './TotalApplications';
import AverageScore from './AverageScore';
import ShortlistChart from './ShortlistChart';

/**
 * The charts from the previous recruiter overview keep their own section rather
 * than being dropped when the dashboard moved to the platform layout.
 */
const RecruiterAnalytics = () => (
  <>
    <PageHead
      eyebrow="Analytics"
      title="Submission analytics"
      sub="Submission trend, application mix, average CV score and shortlist ratio"
    />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-[13px]">
      <div className="min-h-[360px] flex flex-col [&>*]:flex-1">
        <CandidateSubmissionChart />
      </div>
      <div className="min-h-[360px] flex flex-col [&>*]:flex-1">
        <TotalApplications />
      </div>
    </div>

    <Section>Quality</Section>
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-[13px]">
      <div className="min-h-[320px] flex flex-col [&>*]:flex-1">
        <AverageScore />
      </div>
      <div className="min-h-[320px] flex flex-col [&>*]:flex-1">
        <ShortlistChart />
      </div>
    </div>
  </>
);

export default RecruiterAnalytics;
