/**
 * Upload one CV against a job, the same way the single-resume upload does:
 * read the text in the browser, have the server score it (`/api/resumes/parse-ai`),
 * then save it to the job (`/api/resumes/save/:jobId`).
 *
 * Saving through this route matters: above the job's CV bar it asks the
 * candidate to confirm the role, and the coding test follows once they accept.
 * Below the bar the server rejects the CV on the spot.
 */
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from 'mammoth';

GlobalWorkerOptions.workerSrc = workerUrl;

const API = import.meta.env.VITE_BACKEND_URL;
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const ACCEPTED = { 'application/pdf': ['.pdf'], [DOCX]: ['.docx'] };

const token = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo'))?.data?.accessToken || null;
  } catch {
    return null;
  }
};

const postJson = async (path, body) => {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

const pdfText = async (file) => {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  let text = '';
  for (let p = 1; p <= pdf.numPages; p++) {
    const content = await (await pdf.getPage(p)).getTextContent();
    text += `${content.items.map((i) => i.str).join(' ')} `;
  }
  return text.trim();
};

export const readResumeText = async (file) => {
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isDocx = file.type === DOCX || /\.docx$/i.test(file.name);
  if (!isPdf && !isDocx) throw new Error('Only PDF or DOCX files');
  const text = isPdf ? await pdfText(file) : (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  if (!text || !text.trim()) throw new Error('No readable text in this file');
  return text;
};

/** The job fields the AI scoring prompt reads. */
const jobForScoring = (job) => ({
  jobId: job._id,
  jobtitle: job.jobtitle,
  description: job.description,
  skills: job.skills || [],
  company: job.company || job.companyId?.name || '',
  location: job.location,
  employmentType: job.employmentType,
  experience: job.experience,
  salary: job.salary,
  keyResponsibilities: job.keyResponsibilities || [],
  preferredQualifications: job.preferredQualifications || [],
});

/**
 * @param onStep called with 'reading' | 'scoring' | 'saving'
 * @returns {{ name, detail, score, belowBar, bar }}
 */
export const uploadResume = async (file, job, onStep = () => {}) => {
  onStep('reading');
  const text = await readResumeText(file);

  onStep('scoring');
  const { analysis, atsResult } = await postJson('/api/resumes/parse-ai', { text, job: jobForScoring(job) });

  onStep('saving');
  const record = {
    ...analysis,
    overallScore: Math.round(atsResult.ats_score),
    ats_score: atsResult.ats_score,
    ats_reason: atsResult.ats_reason,
    ats_breakdown: atsResult.ats_breakdown,
  };
  // Structured copy for ZepDB search; non-critical, as in the single upload.
  if (analysis.resumeContent) {
    postJson('/api/resume-data/save', {
      ...analysis.resumeContent,
      rawText: text,
      phone: analysis.phone || '',
      emailId: analysis.email || '',
      countryCode: '91',
    }).catch(() => null);
  }
  const saved = await postJson(`/api/resumes/save/${job._id}`, record);

  const r = saved.resume || {};
  return {
    id: r._id,
    name: r.name || analysis.name || file.name,
    detail: [r.experience || analysis.experience, r.location || analysis.location].filter((v) => v && v !== 'Not specified').join(' · '),
    score: Math.round(saved.cvStrength ?? record.overallScore),
    belowBar: Boolean(saved.autoRejected),
    bar: saved.cvStrengthCutoff ?? job.cvStrengthCutoff ?? null,
  };
};
