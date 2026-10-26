// Edit-job form <-> Job document. The form covers every field the Zeus AI
// intake captures (job fields plus the `intake` brief), so a job can be
// corrected after creation without going back through the chat.

export const SENIORITY_LEVELS = ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'];
export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
export const WORK_MODELS = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
];
export const DOMAIN_LEVELS = ['Required', 'Preferred', 'Not needed'];
export const TEST_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const PRIORITIES = ['High', 'Medium', 'Low'];

const lines = (v) => (Array.isArray(v) ? v.join('\n') : v || '');
const toLines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const dateOnly = (v) => (v ? String(v).split('T')[0] : '');
// Blank or non-numeric input becomes null instead of 0.
const num = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const jobToEditForm = (job) => {
  const i = job?.intake || {};
  const nice = i.niceToHaveSkills || [];
  const cond = i.conditional || {};
  return {
    jobtitle: job?.jobtitle || '',
    seniority: i.seniority || '',
    experience: job?.experience ?? '',
    experienceMax: i.experienceMax ?? '',

    // job.skills holds the must-haves first, then the nice-to-haves.
    mustHaveSkills: (job?.skills || []).filter((s) => !nice.includes(s)),
    niceToHaveSkills: nice,

    description: job?.description || '',
    keyResponsibilities: lines(job?.keyResponsibilities),
    successAt12m: lines(i.successAt12m),
    preferredQualifications: lines(job?.preferredQualifications),
    resumeAnalysisPoints: lines(job?.resumeAnalysisPoints),

    domainLevel: i.domain?.level || 'Not needed',
    domainTags: i.domain?.tags || [],

    location: job?.location || '',
    type: job?.type || '',
    hybridDays: i.workModel?.hybridDays ?? '',
    radiusKm: i.workModel?.radiusKm ?? 40,
    relocation: Boolean(i.workModel?.relocation),

    salaryMin: job?.salary?.min ?? '',
    salaryMax: job?.salary?.max ?? '',
    currency: i.ctc?.currency || '',
    stretch: i.ctc?.stretch ?? '',
    variablePct: i.ctc?.variablePct ?? '',

    noticeMaxDays: i.noticeMaxDays ?? 60,
    latestJoiningDate: dateOnly(i.latestJoiningDate),

    sponsorship: Boolean(i.workAuth?.sponsorship),
    authorisedIn: i.workAuth?.authorisedIn || [],

    employmentType: job?.employmentType || 'Full-time',
    contractMonths: i.contractMonths ?? '',

    openpositions: job?.openpositions ?? '',
    shortlistSize: i.shortlistSize ?? 5,
    shortlistDue: dateOnly(i.shortlistDue),
    hiringDeadline: dateOnly(job?.hiringDeadline),
    priority: job?.priority?.length ? job.priority[0] : 'High',

    codingRequired: Boolean(i.codingTest?.required),
    codingStack: i.codingTest?.stack || [],
    codingDifficulty: i.codingTest?.difficulty || 'Medium',
    codingDuration: i.codingTest?.durationMin ?? 45,
    codingCutoff: i.codingTest?.cutoff ?? 70,

    cvStrengthCutoff: job?.cvStrengthCutoff ?? '',

    interviewFocus: i.interview?.focus || [],
    mustAsk: lines(i.interview?.mustAsk),
    dealBreakers: i.interview?.dealBreakers || '',

    confidential: Boolean(cond.confidential),
    targetCompanies: cond.targetCompanies || [],
    excludedCompanies: cond.excludedCompanies || [],
    certifications: cond.certifications || [],
    languages: cond.languages || [],
    conditions: cond.conditions || '',
    timezone: cond.timezone || '',
    timezoneOverlapHours: cond.timezoneOverlapHours ?? '',
    reportingTo: cond.reportingTo || '',
    teamSize: cond.teamSize ?? '',
    whyJoin: cond.whyJoin || '',

    internalNotes: job?.internalNotes || '',

    // Carried through untouched: where each intake value came from.
    provenance: i.provenance || {},
  };
};

export const editFormToPayload = (f) => {
  const nice = f.niceToHaveSkills.filter((s) => !f.mustHaveSkills.includes(s));
  return {
    jobtitle: f.jobtitle.trim(),
    description: f.description,
    location: f.location,
    type: f.type,
    employmentType: f.employmentType,
    salary: { min: num(f.salaryMin) ?? 0, max: num(f.salaryMax) ?? 0 },
    openpositions: num(f.openpositions) ?? 1,
    skills: [...f.mustHaveSkills, ...nice],
    experience: num(f.experience) ?? 0,
    cvStrengthCutoff: num(f.cvStrengthCutoff),
    keyResponsibilities: toLines(f.keyResponsibilities),
    preferredQualifications: toLines(f.preferredQualifications),
    resumeAnalysisPoints: toLines(f.resumeAnalysisPoints),
    priority: [f.priority],
    hiringDeadline: f.hiringDeadline || null,
    internalNotes: f.internalNotes,
    intake: {
      seniority: f.seniority || null,
      experienceMax: num(f.experienceMax),
      niceToHaveSkills: nice,
      successAt12m: toLines(f.successAt12m),
      domain: { level: f.domainLevel, tags: f.domainTags },
      workModel: {
        hybridDays: f.type === 'hybrid' ? num(f.hybridDays) : null,
        radiusKm: num(f.radiusKm) ?? 40,
        relocation: f.relocation,
      },
      ctc: { currency: f.currency.trim() || null, stretch: num(f.stretch), variablePct: num(f.variablePct) },
      noticeMaxDays: num(f.noticeMaxDays) ?? 60,
      latestJoiningDate: f.latestJoiningDate || null,
      workAuth: { sponsorship: f.sponsorship, authorisedIn: f.authorisedIn },
      contractMonths: f.employmentType === 'Full-time' ? null : num(f.contractMonths),
      shortlistSize: num(f.shortlistSize) ?? 5,
      shortlistDue: f.shortlistDue || null,
      codingTest: {
        required: f.codingRequired,
        stack: f.codingStack,
        difficulty: f.codingDifficulty,
        durationMin: num(f.codingDuration) ?? 45,
        cutoff: num(f.codingCutoff) ?? 70,
      },
      interview: { focus: f.interviewFocus, mustAsk: toLines(f.mustAsk), dealBreakers: f.dealBreakers },
      conditional: {
        confidential: f.confidential,
        targetCompanies: f.targetCompanies,
        excludedCompanies: f.excludedCompanies,
        certifications: f.certifications,
        languages: f.languages,
        conditions: f.conditions,
        timezoneOverlapHours: num(f.timezoneOverlapHours),
        timezone: f.timezone,
        reportingTo: f.reportingTo,
        teamSize: num(f.teamSize),
        whyJoin: f.whyJoin,
      },
      provenance: f.provenance,
    },
  };
};

// The same impossible-value rules the server enforces, so they surface before
// the request is sent.
export const validateEditForm = (f) => {
  const errors = [];
  if (!f.jobtitle.trim()) errors.push('Job title is required');
  const exp = num(f.experience);
  const expMax = num(f.experienceMax);
  if (exp !== null && expMax !== null && exp > expMax) {
    errors.push(`Minimum experience (${exp}) is above the maximum (${expMax})`);
  }
  const min = num(f.salaryMin);
  const max = num(f.salaryMax);
  if (min !== null && max !== null && max > 0 && min > max) {
    errors.push(`CTC minimum (${min}) is above the maximum (${max})`);
  }
  const stretch = num(f.stretch);
  if (stretch !== null && max !== null && max > 0 && stretch < max) {
    errors.push(`CTC stretch ceiling (${stretch}) is below the maximum (${max})`);
  }
  return errors;
};
