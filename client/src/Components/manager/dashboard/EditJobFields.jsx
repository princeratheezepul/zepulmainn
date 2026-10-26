import React, { useState } from 'react';
import {
  SENIORITY_LEVELS,
  EMPLOYMENT_TYPES,
  WORK_MODELS,
  DOMAIN_LEVELS,
  TEST_DIFFICULTIES,
  PRIORITIES,
} from '../../../utils/jobEditForm';

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const selectCls = `${inputCls} bg-white`;
const areaCls = `${inputCls} resize-none`;

const Section = ({ title, children }) => (
  <div className="space-y-4">
    <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 border-b border-gray-200 pb-1">
      {title}
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500"> *</span>}
      {hint && <span className="text-gray-400 text-xs font-normal"> ({hint})</span>}
    </label>
    {children}
  </div>
);

const Check = ({ name, checked, onChange, label }) => (
  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="h-4 w-4 accent-blue-600" />
    {label}
  </label>
);

const Row = ({ cols = 2, children }) => (
  <div className={`grid gap-4 ${cols === 3 ? 'grid-cols-1 sm:grid-cols-3' : cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
    {children}
  </div>
);

// Chips plus an input. Enter, a comma or leaving the input adds what was typed.
const TagInput = ({ value, onChange, max, placeholder }) => {
  const [draft, setDraft] = useState('');
  const full = max !== undefined && value.length >= max;

  const commit = (raw) => {
    const fresh = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !value.includes(s));
    if (fresh.length) onChange([...value, ...fresh].slice(0, max));
    setDraft('');
  };

  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((tag) => (
            <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              {tag}
              <button
                type="button"
                className="ml-1 text-blue-400 hover:text-red-500 cursor-pointer"
                onClick={() => onChange(value.filter((t) => t !== tag))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          disabled={full}
          onChange={(e) => (e.target.value.endsWith(',') ? commit(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(draft);
            }
          }}
          onBlur={() => draft.trim() && commit(draft)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          placeholder={full ? `Limit of ${max} reached` : placeholder}
        />
        <button
          type="button"
          disabled={full}
          onClick={() => commit(draft)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-300 cursor-pointer disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
};

/**
 * Every field the Zeus AI intake captures, for editing a job after it has been
 * created. Controlled: `form` comes from jobToEditForm, `setForm` updates it.
 */
const EditJobFields = ({ form, setForm }) => {
  const change = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const setField = (name) => (value) => setForm((prev) => ({ ...prev, [name]: value }));

  // Open on first render only when something is already filled in; deciding
  // this on every render would collapse the section as its last value is cleared.
  const [optionalOpen] = useState(() => Boolean(
    form.confidential || form.targetCompanies.length || form.excludedCompanies.length ||
    form.certifications.length || form.languages.length || form.conditions || form.timezone ||
    form.timezoneOverlapHours !== '' || form.reportingTo || form.teamSize !== '' || form.whyJoin
  ));
  // The saved value may predate this list, so it stays selectable.
  const employmentTypes = EMPLOYMENT_TYPES.includes(form.employmentType)
    ? EMPLOYMENT_TYPES
    : [...EMPLOYMENT_TYPES, form.employmentType];

  return (
    <div className="space-y-8">
      <Section title="Role & seniority">
        <Field label="Job Title" required>
          <input name="jobtitle" value={form.jobtitle} onChange={change} className={inputCls} placeholder="e.g. Senior Software Engineer" />
        </Field>
        <Row cols={3}>
          <Field label="Seniority">
            <select name="seniority" value={form.seniority} onChange={change} className={selectCls}>
              <option value="">Select level</option>
              {SENIORITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Min Experience" hint="years">
            <input name="experience" value={form.experience} onChange={change} type="number" min="0" max="60" className={inputCls} placeholder="e.g. 3" />
          </Field>
          <Field label="Max Experience" hint="years">
            <input name="experienceMax" value={form.experienceMax} onChange={change} type="number" min="0" max="60" className={inputCls} placeholder="e.g. 8" />
          </Field>
        </Row>
      </Section>

      <Section title="Skills">
        <Field label="Must-have Skills" hint="1 to 5 non-negotiables">
          <TagInput value={form.mustHaveSkills} onChange={setField('mustHaveSkills')} placeholder="Add a must-have skill..." />
          {form.mustHaveSkills.length > 5 && (
            <div className="text-xs text-amber-600 mt-1">
              {form.mustHaveSkills.length} must-haves is a lot; consider moving some to nice-to-have.
            </div>
          )}
        </Field>
        <Field label="Nice-to-have Skills" hint="up to 10">
          <TagInput value={form.niceToHaveSkills} onChange={setField('niceToHaveSkills')} max={10} placeholder="Add a nice-to-have skill..." />
        </Field>
      </Section>

      <Section title="Responsibilities & success">
        <Field label="Description">
          <textarea name="description" value={form.description} onChange={change} rows={4} className={areaCls} placeholder="Job description..." />
        </Field>
        <Field label="Key Responsibilities" hint="one per line, 3 to 8">
          <textarea name="keyResponsibilities" value={form.keyResponsibilities} onChange={change} rows={4} className={areaCls} placeholder="Each responsibility on a new line..." />
        </Field>
        <Field label="Success at 6-12 months" hint="one per line, up to 3">
          <textarea name="successAt12m" value={form.successAt12m} onChange={change} rows={3} className={areaCls} placeholder="What does a great first year look like?" />
        </Field>
        <Field label="Preferred Qualifications" hint="one per line">
          <textarea name="preferredQualifications" value={form.preferredQualifications} onChange={change} rows={3} className={areaCls} placeholder="Each qualification on a new line..." />
        </Field>
        <Field label="Resume Analysis Points" hint="one per line, what to look for when reviewing resumes">
          <textarea name="resumeAnalysisPoints" value={form.resumeAnalysisPoints} onChange={change} rows={3} className={areaCls} placeholder="Each point on a new line..." />
        </Field>
      </Section>

      <Section title="Domain experience">
        <Row>
          <Field label="Domain Experience">
            <select name="domainLevel" value={form.domainLevel} onChange={change} className={selectCls}>
              {DOMAIN_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          {form.domainLevel !== 'Not needed' && (
            <Field label="Domain Tags" hint="e.g. payments">
              <TagInput value={form.domainTags} onChange={setField('domainTags')} max={10} placeholder="Add a domain..." />
            </Field>
          )}
        </Row>
      </Section>

      <Section title="Location & work model">
        <Row>
          <Field label="Location">
            <input name="location" value={form.location} onChange={change} className={inputCls} placeholder="e.g. Bengaluru" />
          </Field>
          <Field label="Work Model">
            <select name="type" value={form.type} onChange={change} className={selectCls}>
              <option value="">Select model</option>
              {WORK_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
        </Row>
        <Row cols={3}>
          {form.type === 'hybrid' && (
            <Field label="Hybrid Days" hint="per week">
              <input name="hybridDays" value={form.hybridDays} onChange={change} type="number" min="1" max="5" className={inputCls} placeholder="1 to 5" />
            </Field>
          )}
          <Field label="Search Radius" hint="km">
            <input name="radiusKm" value={form.radiusKm} onChange={change} type="number" min="0" max="1000" className={inputCls} />
          </Field>
          <div className="flex items-end pb-2">
            <Check name="relocation" checked={form.relocation} onChange={change} label="Open to relocation" />
          </div>
        </Row>
      </Section>

      <Section title="CTC">
        <Row cols={4}>
          <Field label="Currency">
            <input name="currency" value={form.currency} onChange={change} maxLength={8} className={inputCls} placeholder="e.g. INR" />
          </Field>
          <Field label="Minimum">
            <input name="salaryMin" value={form.salaryMin} onChange={change} type="number" min="0" className={inputCls} />
          </Field>
          <Field label="Maximum">
            <input name="salaryMax" value={form.salaryMax} onChange={change} type="number" min="0" className={inputCls} />
          </Field>
          <Field label="Stretch Ceiling">
            <input name="stretch" value={form.stretch} onChange={change} type="number" min="0" className={inputCls} />
          </Field>
        </Row>
        <Field label="Variable Pay" hint="% of CTC">
          <input name="variablePct" value={form.variablePct} onChange={change} type="number" min="0" max="100" className={`${inputCls} sm:w-1/4`} placeholder="0 to 100" />
        </Field>
      </Section>

      <Section title="Notice period & joining">
        <Row>
          <Field label="Max Notice Period" hint="days, 0 to 180">
            <input name="noticeMaxDays" value={form.noticeMaxDays} onChange={change} type="number" min="0" max="180" className={inputCls} />
          </Field>
          <Field label="Latest Joining Date">
            <input name="latestJoiningDate" value={form.latestJoiningDate} onChange={change} type="date" className={inputCls} />
          </Field>
        </Row>
      </Section>

      <Section title="Work authorisation">
        <Check name="sponsorship" checked={form.sponsorship} onChange={change} label="Can sponsor a work visa" />
        <Field label="Candidates Must Be Authorised In" hint="countries">
          <TagInput value={form.authorisedIn} onChange={setField('authorisedIn')} max={20} placeholder="Add a country..." />
        </Field>
      </Section>

      <Section title="Employment & hiring plan">
        <Row>
          <Field label="Employment Type">
            <select name="employmentType" value={form.employmentType} onChange={change} className={selectCls}>
              {employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          {form.employmentType !== 'Full-time' && (
            <Field label="Contract Length" hint="months">
              <input name="contractMonths" value={form.contractMonths} onChange={change} type="number" min="1" max="60" className={inputCls} />
            </Field>
          )}
        </Row>
        <Row cols={3}>
          <Field label="Open Positions" hint="1 to 50">
            <input name="openpositions" value={form.openpositions} onChange={change} type="number" min="1" max="50" className={inputCls} placeholder="e.g. 3" />
          </Field>
          <Field label="Shortlist Size" hint="1 to 20">
            <input name="shortlistSize" value={form.shortlistSize} onChange={change} type="number" min="1" max="20" className={inputCls} />
          </Field>
          <Field label="Shortlist Due">
            <input name="shortlistDue" value={form.shortlistDue} onChange={change} type="date" className={inputCls} />
          </Field>
        </Row>
        <Row>
          <Field label="Hiring Deadline">
            <input name="hiringDeadline" value={form.hiringDeadline} onChange={change} type="date" className={inputCls} />
          </Field>
          <Field label="Priority">
            <select name="priority" value={form.priority} onChange={change} className={selectCls}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </Row>
      </Section>

      <Section title="Screening & cutoffs">
        <Row>
          <Field label="CV Strength Cutoff" hint="minimum CV match score 0 to 100, blank for none">
            <input name="cvStrengthCutoff" value={form.cvStrengthCutoff} onChange={change} type="number" min="0" max="100" className={inputCls} placeholder="e.g. 75" />
            {Number(form.cvStrengthCutoff) > 90 && (
              <div className="text-xs text-amber-600 mt-1">A cutoff above 90 may leave fewer candidates than the shortlist size.</div>
            )}
          </Field>
          <Field label="Coding Test Cutoff" hint="pass mark 0 to 100">
            <input name="codingCutoff" value={form.codingCutoff} onChange={change} type="number" min="0" max="100" className={inputCls} />
          </Field>
        </Row>
        <Check name="codingRequired" checked={form.codingRequired} onChange={change} label="Coding test required" />
        <Field label="Coding Test Languages / Stack">
          <TagInput value={form.codingStack} onChange={setField('codingStack')} max={10} placeholder="Add a language..." />
        </Field>
        <Row>
          <Field label="Coding Test Difficulty">
            <select name="codingDifficulty" value={form.codingDifficulty} onChange={change} className={selectCls}>
              {TEST_DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Coding Test Duration" hint="minutes, 20 to 120">
            <input name="codingDuration" value={form.codingDuration} onChange={change} type="number" min="20" max="120" className={inputCls} />
          </Field>
        </Row>
      </Section>

      <Section title="AI interview">
        <Field label="Focus Areas" hint="3 to 5 things to probe">
          <TagInput value={form.interviewFocus} onChange={setField('interviewFocus')} max={5} placeholder="Add a focus area..." />
        </Field>
        <Field label="Must-ask Questions" hint="one per line, up to 5">
          <textarea name="mustAsk" value={form.mustAsk} onChange={change} rows={3} className={areaCls} placeholder="Each question on a new line..." />
        </Field>
        <Field label="Deal-breakers">
          <textarea name="dealBreakers" value={form.dealBreakers} onChange={change} rows={2} maxLength={500} className={areaCls} placeholder="Anything that rules a candidate out..." />
        </Field>
      </Section>

      <details open={optionalOpen}>
        <summary className="text-xs font-semibold uppercase tracking-wide text-blue-600 border-b border-gray-200 pb-1 cursor-pointer">
          Optional details
        </summary>
        <div className="space-y-4 pt-4">
          <Check name="confidential" checked={form.confidential} onChange={change} label="Confidential search (hide company name until a candidate opts in)" />
          <Row>
            <Field label="Target Companies">
              <TagInput value={form.targetCompanies} onChange={setField('targetCompanies')} max={20} placeholder="Add a company..." />
            </Field>
            <Field label="Excluded Companies">
              <TagInput value={form.excludedCompanies} onChange={setField('excludedCompanies')} max={20} placeholder="Add a company..." />
            </Field>
          </Row>
          <Row>
            <Field label="Certifications / Education">
              <TagInput value={form.certifications} onChange={setField('certifications')} max={20} placeholder="Add a certification..." />
            </Field>
            <Field label="Languages">
              <TagInput value={form.languages} onChange={setField('languages')} max={20} placeholder="Add a language..." />
            </Field>
          </Row>
          <Field label="Job Conditions" hint="shifts, on-call, travel, background checks">
            <textarea name="conditions" value={form.conditions} onChange={change} rows={2} maxLength={500} className={areaCls} />
          </Field>
          <Row>
            <Field label="Time Zone">
              <input name="timezone" value={form.timezone} onChange={change} maxLength={60} className={inputCls} placeholder="e.g. IST" />
            </Field>
            <Field label="Time-zone Overlap" hint="hours, 0 to 8">
              <input name="timezoneOverlapHours" value={form.timezoneOverlapHours} onChange={change} type="number" min="0" max="8" className={inputCls} />
            </Field>
          </Row>
          <Row>
            <Field label="Reports To">
              <input name="reportingTo" value={form.reportingTo} onChange={change} maxLength={120} className={inputCls} placeholder="e.g. VP Engineering" />
            </Field>
            <Field label="Team Size">
              <input name="teamSize" value={form.teamSize} onChange={change} type="number" min="0" className={inputCls} />
            </Field>
          </Row>
          <Field label="Why Join" hint="up to 300 characters">
            <textarea name="whyJoin" value={form.whyJoin} onChange={change} rows={2} maxLength={300} className={areaCls} />
          </Field>
        </div>
      </details>

      <Section title="Internal">
        <Field label="Internal Notes">
          <textarea name="internalNotes" value={form.internalNotes} onChange={change} rows={2} className={areaCls} placeholder="Internal notes visible only to your team..." />
        </Field>
      </Section>
    </div>
  );
};

export default EditJobFields;
