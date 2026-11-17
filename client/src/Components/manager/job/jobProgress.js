/**
 * Where a job is in the 11-step Zeus workflow, read off its candidates.
 * A step counts as reached once any candidate shows evidence of it; the
 * current step is the one after the furthest reached.
 */
import { hasCvStrength, hasScorecard, codingTestDone } from '../../dashboard/dashboardUtils';
import { interviewDone } from '../dashboard/zeusModel';

export const JOB_STEPS = [
  { title: 'Brief Zeus', sub: 'One conversation', who: 'YOU', next: ['Brief Zeus', 'on the role'] },
  { title: 'Job description', sub: 'Written, editable any time', who: 'ZEUS', next: ['Write the job description', 'editable any time'] },
  { title: 'Sourcing', sub: '800M+ profiles · ZepDB', who: 'ZEUS', next: ['Search 800M+ profiles', 'in ZepDB'] },
  { title: 'Outreach', sub: 'You pick who to ask', who: 'YOU', next: ['You pick', 'who Zeus asks about the role'] },
  { title: 'CV strength', sub: 'Scorecards of who said yes', who: 'ZEUS', next: ['Score every CV', 'of those who said yes'] },
  { title: 'Coding test', sub: 'Proctored · snapshots', who: 'ZEUS', next: ['Run the coding test', 'proctored, with snapshots'] },
  { title: 'Send interview links', sub: 'Pick who goes forward', who: 'YOU', next: ['You pick', 'who gets an AI interview'] },
  { title: 'AI interview', sub: 'Live 24/7 · identity checked', who: 'ZEUS', next: ['Run AI interviews', 'live 24/7, identity checked'] },
  { title: 'Scorecards', sub: 'Coding, CV, interview', who: 'ZEUS', next: ['Write scorecards', 'coding, CV and interview'] },
  { title: 'Shortlist', sub: 'Phone numbers revealed', who: 'YOU', next: ['You shortlist', 'phone numbers revealed'] },
  { title: 'Prep brief', sub: 'Emailed to the shortlist', who: 'ZEUS', next: ['Email the prep brief', 'to the final shortlist'] },
];

/** Step key for each step number, used for the step's page under /jobs/:id/. */
export const STEP_PATHS = {
  3: 'sourcing', 4: 'outreach', 5: 'cv', 6: 'coding', 7: 'interview-links',
  8: 'interviews', 9: 'scorecards', 10: 'shortlist', 11: 'prep',
};

const codingRequired = (job) => Boolean(job?.intake?.codingTest?.required);

/** The steps for one job: the coding test step is marked skipped when the job has none. */
export const jobSteps = (job) => JOB_STEPS.map((s, i) => (
  i === 5 && job && !codingRequired(job) ? { ...s, sub: 'Not required for this job', skipped: true } : s
));

const AT_CLIENT = ['shortlisted', 'offered', 'hired'];

/** 1-based current step (12 when every step is done). */
export const currentStep = (rs = [], job = null) => {
  const any = (test) => rs.some(test);
  const confirmedAny = any((r) => r?.roleConfirmation?.status === 'accepted');
  const reached = [
    true,
    true,
    rs.length > 0,
    any((r) => Boolean(r?.roleConfirmation?.sentAt)),
    confirmedAny && any(hasCvStrength),
    job && !codingRequired(job) ? confirmedAny : any(codingTestDone),
    any((r) => Boolean(r?.interviewScheduled || r?.interviewInvite) || interviewDone(r)),
    any(interviewDone),
    any(hasScorecard),
    any((r) => AT_CLIENT.includes(r?.status)),
    any((r) => Boolean(r?.blueprintDocument?.emailedAt)),
  ];
  const last = reached.lastIndexOf(true);
  return Math.min(JOB_STEPS.length + 1, last + 2);
};
