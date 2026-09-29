// ── Zep Pro Recruiter · pricing data ──
// One source of truth for the plan matrix, the two-question finder and the
// "included in every plan" list.

/** The six pipeline stages, in order. `q` links a stage to the finder question
 *  that decides whether the buyer cares about it (null = in every plan). */
export const STAGES = [
    { label: 'AI sourcing', q: 'src' },
    { label: 'Interest verification', q: 'src' },
    { label: 'CV strength', q: null },
    { label: 'Coding test', q: null },
    { label: 'AI interview', q: 'int' },
    { label: 'Shortlist & scorecard', q: null },
];

/** `cells` holds one entry per stage in STAGES order — a label when the plan
 *  covers that stage, null when it doesn't. */
export const PLANS = [
    {
        key: 'recruit',
        name: 'Zepul Recruit',
        blurb: 'Find and engage the right candidates.',
        req: '5 active hiring requirements',
        price: '$499',
        per: 'per month',
        featured: false,
        cells: ['3,000 credits', '✓', '✓', '✓', null, '✓'],
    },
    {
        key: 'screen',
        name: 'Zepul Screen',
        blurb: 'Screen and interview your own applicants.',
        req: '10 active hiring requirements',
        price: '$1,500',
        per: 'per month',
        featured: false,
        cells: [null, null, '✓', '✓', '3,000 min', '✓'],
    },
    {
        key: 'hire',
        name: 'Zepul Hire',
        flag: 'Most complete',
        blurb: 'The full pipeline, end to end.',
        req: '15 active hiring requirements',
        price: '$2,500',
        per: 'per month',
        featured: true,
        cells: ['10,000 credits', '✓', '✓', '✓', '3,000 min', '✓'],
    },
];

export const QUESTIONS = [
    {
        key: 'src',
        title: 'Do you need AI to find candidates for you?',
        hint: 'AI sourcing from global talent data, plus interest verification.',
        options: [{ label: 'Yes', value: 1 }, { label: 'No, I have applicants', value: 0 }],
    },
    {
        key: 'int',
        title: 'Do you want AI to run interviews?',
        hint: 'Authorised AI interviews with a scorecard for every candidate.',
        options: [{ label: 'Yes', value: 1 }, { label: "No, we'll interview", value: 0 }],
    },
];

export const INCLUDED = [
    'CV strength analysis',
    'Coding assessment',
    'Automated candidate communication',
    'Candidate shortlisting & scorecards',
    'Phone reveal for shortlisted candidates',
    'Interview prep documents — up to 15 per active requirement',
    'Employer manager & recruiter logins',
    'Recruiter + hiring manager workflow',
];

/** Which plan the two answers point at. */
export function recommendedPlan(answers) {
    if (answers.src === 1 && answers.int === 1) return 'hire';
    if (answers.int === 1) return 'screen';
    return 'recruit';
}

/** The one-line rationale shown next to the recommendation. */
export function planNote(key, answers) {
    if (answers.src === 0 && answers.int === 0) {
        return 'Our entry plan — CV strength and coding assessments come with every plan.';
    }
    return {
        hire: 'Sourcing to AI interview — the full pipeline.',
        screen: 'AI screens and interviews your own applicants.',
        recruit: 'AI finds and engages candidates; your team interviews.',
    }[key];
}

/** Rounds the ends of each contiguous run of covered stages so the row reads
 *  as one continuous rail. Returns a class fragment per cell. */
export function railCaps(cells) {
    return cells.map((value, i) => {
        if (!value) return '';
        const start = i === 0 || !cells[i - 1];
        const end = i === cells.length - 1 || !cells[i + 1];
        return `${start ? ' s' : ''}${end ? ' e' : ''}`;
    });
}
