import { toast } from 'react-hot-toast';

// Score gauge — colored arc on a light grey ring, centered numeric label (no %).
const scoreGaugeSVG = (value, color, size = 92, strokeWidth = 8) => {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashoffset = circumference - (v / 100) * circumference;
  return `
    <div style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg); display: block;">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="#e5e7eb" stroke-width="${strokeWidth}" fill="none" />
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}" stroke-linecap="round" />
      </svg>
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
        <span style="color: ${color}; font-size: 22px; font-weight: 700; line-height: 1;">${v}</span>
      </div>
    </div>
  `;
};

// Generate the complete PDF content
const generatePDFContent = (resumeData, note = '') => {
  // === Score extraction ===
  const cvScore = Math.round(resumeData.overallScore || resumeData.ats_score || 0);
  const codingScore = Math.round(
    resumeData.oa?.evaluation?.score || resumeData.avaloqOa?.evaluation?.score || 0
  );
  let interviewScore = Math.round(resumeData.score || 0);
  if (!interviewScore && resumeData.interviewEvaluation?.evaluationResults?.length > 0) {
    const total = resumeData.interviewEvaluation.evaluationResults.reduce(
      (sum, r) => sum + (r.score || 0), 0
    );
    interviewScore = Math.round(
      (total / resumeData.interviewEvaluation.evaluationResults.length) * 10
    );
  }

  // === Coding assessment metrics ===
  const submissions = resumeData.oa?.submissions || [];
  const totalQuestions = submissions.length || 3;
  const passedQuestions =
    submissions.filter(
      (s) => s?.evaluation?.pass === true || s?.pass === true || s?.passed === true
    ).length || (resumeData.oa?.evaluation?.pass ? totalQuestions : 0);
  const codingFeedback =
    resumeData.oa?.evaluation?.feedback ||
    resumeData.oa?.evaluation?.complexityAnalysis ||
    'Clean, efficient solutions across all problems.';

  // === Other data ===
  const initials = (resumeData.name || 'NA')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const skills = resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills : [];
  const interviewBullets = resumeData.interviewEvaluation?.aiInterviewSummary || [];
  const keyStrengths = resumeData.keyStrength || [];
  const concerns = resumeData.potentialConcern || [];
  const aiSummary = resumeData.aiSummary || {};

  // === Section: Dark header ===
  const headerHTML = `
    <div style="background: #0a0a0a; color: #ffffff; padding: 18px 32px 16px; position: relative;">
      <div style="position: absolute; top: 18px; right: 32px; display: flex; align-items: center; gap: 6px;">
        <img src="/zepul_sidebar_logo.png" alt="" style="height: 20px; width: auto; display: block;" />
        <span style="color: #ffffff; font-weight: 700; font-size: 18px; letter-spacing: 0.04em; line-height: 1;">ZEPUL<sup style="font-size: 9px; font-weight: 600; margin-left: 1px;">™</sup></span>
      </div>
      <div style="width: 44px; height: 44px; border-radius: 10px; background: #2563eb; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 700; font-size: 16px; margin-bottom: 10px;">
        ${initials}
      </div>
      <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 2px 0; color: #ffffff; line-height: 1.15;">
        ${resumeData.name || 'Candidate'}
      </h1>
      <p style="font-size: 13px; color: #9ca3af; margin: 0 0 10px 0;">
        ${resumeData.title || ''}
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: #d1d5db; margin-bottom: 10px;">
        ${resumeData.email ? `
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>
            ${resumeData.email}
          </span>` : ''}
        ${resumeData.phone ? `
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${resumeData.phone}
          </span>` : ''}
        ${resumeData.experience ? `
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${resumeData.experience}
          </span>` : ''}
        ${resumeData.location ? `
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${resumeData.location}
          </span>` : ''}
      </div>
      ${skills.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${skills.slice(0, 8).map(s => `
            <span style="background: #1f2937; color: #e5e7eb; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 500; border: 1px solid #374151;">${s}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // === Section: 3 score circles ===
  const scoreRowHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 1px solid #e5e7eb;">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 0; border-right: 1px solid #e5e7eb;">
        <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">CODING</div>
        ${scoreGaugeSVG(codingScore, '#22c55e')}
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 0; border-right: 1px solid #e5e7eb;">
        <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">CV STRENGTH</div>
        ${scoreGaugeSVG(cvScore, '#f59e0b')}
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 0;">
        <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">INTERVIEW</div>
        ${scoreGaugeSVG(interviewScore, '#3b82f6')}
      </div>
    </div>
  `;

  // === Section: Assessment (Strengths + Concerns) ===
  const sectionLabel = (text) => `
    <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">${text}</div>
  `;

  const strengthsText = keyStrengths.length > 0
    ? keyStrengths.join(' ')
    : 'Strong technical foundation with relevant project experience.';
  const concernsText = concerns.length > 0
    ? concerns.join(' ')
    : 'Some skill gaps identified — may need ramp-up.';

  const assessmentHTML = `
    <div style="margin-bottom: 16px;">
      ${sectionLabel('Assessment')}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 6px; padding: 10px 12px;">
          <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #15803d; text-transform: uppercase; margin-bottom: 4px;">Strengths</div>
          <p style="font-size: 12px; color: #1f2937; line-height: 1.45; margin: 0;">${strengthsText}</p>
        </div>
        <div style="background: #fefce8; border-left: 3px solid #eab308; border-radius: 6px; padding: 10px 12px;">
          <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: #a16207; text-transform: uppercase; margin-bottom: 4px;">Concerns</div>
          <p style="font-size: 12px; color: #1f2937; line-height: 1.45; margin: 0;">${concernsText}</p>
        </div>
      </div>
    </div>
  `;

  // === Section: AI Resume Summary — only these three, in this order ===
  const summaryEntriesToRender = [
    ['Project Experience', aiSummary.projectExperience || 'Project experience summary not available.'],
    ['Key Achievements', aiSummary.keyAchievements || 'Key achievements summary not available.'],
    ['Skill Match', aiSummary.skillMatch || 'Skill match summary not available.'],
  ];

  const aiResumeSummaryHTML = `
    <div style="margin-bottom: 16px;">
      ${sectionLabel('AI Resume Summary')}
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${summaryEntriesToRender.map(([title, value]) => `
          <div style="background: #f3f4f6; border-radius: 6px; padding: 10px 12px;">
            <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 2px;">${title}</div>
            <p style="font-size: 12px; color: #374151; line-height: 1.45; margin: 0;">${value}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // === Section: Coding Assessment ===
  const codingHeadline = passedQuestions === totalQuestions
    ? 'All test cases passed'
    : `${passedQuestions} of ${totalQuestions} test cases passed`;

  const codingAssessmentHTML = `
    <div style="margin-bottom: 16px;">
      ${sectionLabel('Coding Assessment')}
      <div style="background: #f0fdf4; border-radius: 6px; padding: 12px 14px; display: flex; align-items: center; gap: 16px;">
        <div style="font-size: 34px; font-weight: 700; color: #16a34a; line-height: 1; flex-shrink: 0;">
          ${passedQuestions}/${totalQuestions}
        </div>
        <div style="font-size: 12px; color: #1f2937; line-height: 1.45;">
          <span style="font-weight: 700;">${codingHeadline}</span> — scored ${codingScore}/100.
          <div style="margin-top: 1px;">${codingFeedback}</div>
        </div>
      </div>
    </div>
  `;

  // === Section: Interview Summary (AI Interview Summary) ===
  const interviewSummaryHTML = interviewBullets.length > 0 ? `
    <div>
      ${sectionLabel('Interview Summary')}
      <ul style="margin: 0; padding-left: 18px; list-style: disc;">
        ${interviewBullets.map(b => `
          <li style="font-size: 12px; color: #1f2937; line-height: 1.45; margin-bottom: 3px;">${b}</li>
        `).join('')}
      </ul>
    </div>
  ` : '';

  // === Footer ===
  const footerHTML = `
    <div style="border-top: 1px solid #e5e7eb; padding: 8px 32px; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 10px; color: #6b7280;">Generated by Zepul AI Screening</span>
      <img src="/zepul_trademark.jpg" alt="Zepul" style="height: 14px; width: auto;" />
    </div>
  `;

  // === Optional: Added Notes — only renders when provided, on its own page ===
  const addedNotesHTML = note && note.trim()
    ? `<div style="page-break-before: always; margin-top: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
        <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 12px;">Added Notes</div>
        <div style="font-size: 13px; color: #374151; line-height: 1.6;">${note}</div>
      </div>`
    : '';

  return `
    <div style="max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);">
      ${headerHTML}
      ${scoreRowHTML}
      <div style="padding: 16px 32px;">
        ${assessmentHTML}
        ${aiResumeSummaryHTML}
        ${codingAssessmentHTML}
        ${interviewSummaryHTML}
      </div>
      ${footerHTML}
    </div>
    ${addedNotesHTML}
  `;
};

// Main PDF generation function
export const generateScorecardPDF = async (resumeData, note = '') => {
  try {
    const printContent = generatePDFContent(resumeData, note);
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.name || 'Candidate'} Scorecard</title>
          <meta charset="utf-8">
          <style>
            /* Include all the comprehensive CSS from manager's version */
            ${getComprehensiveCSS()}
          </style>
        </head>
        <body>
          <svg style="position: absolute; width: 0; height: 0;">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          <div class="scorecard-wrapper">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 500);
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('Print dialog opened! Make sure to uncheck "Headers and footers" in print options for a clean PDF.');

  } catch (err) {
    console.error('PDF Generation Error:', err);
    toast.error('Failed to open print dialog. Please use Ctrl+P to print.');
    throw err;
  }
};

// Comprehensive CSS styles (extracted from manager's version)
const getComprehensiveCSS = () => `
  /* Remove default print headers/footers and set proper margins */
  @page {
    margin: 0.3in !important;
    size: A4 !important;
  }
  
  /* Hide default print headers and footers */
  @media print {
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Remove default browser print headers */
    @page {
      margin: 0.3in !important;
    }
  }
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background: #ffffff;
    padding: 0;
    margin: 0;
    font-size: 14px;
  }
  
  /* PDF specific styles */
  .bg-white { background-color: #ffffff !important; }
  .bg-gray-50 { background-color: #ffffff !important; }
  .bg-blue-50 { background-color: #eff6ff !important; }
  .bg-green-50 { background-color: #f0fdf4 !important; }
  .bg-red-50 { background-color: #fef2f2 !important; }
  .bg-gray-100 { background-color: #f3f4f6 !important; }
  .bg-gray-200 { background-color: #e5e7eb !important; }
  .bg-gray-900 { background-color: #111827 !important; }
  .bg-blue-100 { background-color: #dbeafe !important; }
  .bg-blue-400 { background-color: #60a5fa !important; }
  
  .text-gray-600 { color: #4b5563 !important; }
  .text-gray-700 { color: #374151 !important; }
  .text-gray-800 { color: #1f2937 !important; }
  .text-gray-900 { color: #111827 !important; }
  .text-black { color: #000000 !important; }
  .text-blue-600 { color: #2563eb !important; }
  .text-green-600 { color: #16a34a !important; }
  .text-green-500 { color: #22c55e !important; }
  .text-red-600 { color: #dc2626 !important; }
  .text-blue-900 { color: #1e3a8a !important; }
  .text-white { color: #ffffff !important; }
  
  /* Container and layout styles */
  .p-4 { padding: 16px !important; }
  .p-6 { padding: 24px !important; }
  .p-8 { padding: 32px !important; }
  .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
  .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
  .py-1\\.5 { padding-top: 6px !important; padding-bottom: 6px !important; }
  .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
  .py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
  .py-8 { padding-top: 32px !important; padding-bottom: 32px !important; }
  .mb-2 { margin-bottom: 8px !important; }
  .mb-3 { margin-bottom: 12px !important; }
  .mb-4 { margin-bottom: 16px !important; }
  .mb-6 { margin-bottom: 24px !important; }
  .mb-8 { margin-bottom: 32px !important; }
  .mt-8 { margin-top: 32px !important; }
  
  /* Grid and flexbox */
  .grid { display: grid !important; }
  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .xl\\:grid-cols-3 { grid-template-columns: 2fr 1fr !important; }
  .xl\\:col-span-2 { grid-column: span 1 / span 1 !important; }
  .xl\\:col-span-1 { grid-column: span 1 / span 1 !important; }
  .gap-2 { gap: 8px !important; }
  .gap-4 { gap: 16px !important; }
  .gap-6 { gap: 24px !important; }
  .gap-x-8 { column-gap: 32px !important; }
  .gap-y-5 { row-gap: 20px !important; }
  
  .flex { display: flex !important; }
  .flex-col { flex-direction: column !important; }
  .flex-wrap { flex-wrap: wrap !important; }
  .items-center { align-items: center !important; }
  .items-start { align-items: flex-start !important; }
  .justify-between { justify-content: space-between !important; }
  .justify-center { justify-content: center !important; }
  .justify-end { justify-content: flex-end !important; }
  
  /* Positioning classes */
  .relative { position: relative !important; }
  .absolute { position: absolute !important; }
  .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
  .top-0 { top: 0 !important; }
  .left-0 { left: 0 !important; }
  .z-10 { z-index: 10 !important; }
  .text-center { text-align: center !important; }
  .space-y-2 > * + * { margin-top: 8px !important; }
  .space-y-4 > * + * { margin-top: 16px !important; }
  .space-y-6 > * + * { margin-top: 24px !important; }
  .space-y-8 > * + * { margin-top: 32px !important; }
  
  /* Typography */
  .text-xs { font-size: 12px !important; line-height: 16px !important; }
  .text-sm { font-size: 14px !important; line-height: 20px !important; }
  .text-base { font-size: 16px !important; line-height: 24px !important; }
  .text-lg { font-size: 18px !important; line-height: 28px !important; }
  .text-xl { font-size: 20px !important; line-height: 28px !important; }
  .text-2xl { font-size: 24px !important; line-height: 32px !important; }
  
  .font-medium { font-weight: 500 !important; }
  .font-semibold { font-weight: 600 !important; }
  .font-bold { font-weight: 700 !important; }
  .leading-relaxed { line-height: 1.625 !important; }
  
  /* Borders and shapes */
  .border { border-width: 1px !important; border-color: #e5e7eb !important; border-style: solid !important; }
  .border-b { border-bottom-width: 1px !important; border-color: #e5e7eb !important; border-style: solid !important; }
  .border-2 { border-width: 2px !important; }
  .border-gray-200 { border-color: #e5e7eb !important; }
  .border-gray-300 { border-color: #d1d5db !important; }
  
  .rounded-lg { border-radius: 8px !important; }
  .rounded-xl { border-radius: 12px !important; }
  .rounded-md { border-radius: 6px !important; }
  .rounded-full { border-radius: 9999px !important; }
  
  /* Width and height */
  .w-full { width: 100% !important; }
  .w-8 { width: 32px !important; }
  .w-20 { width: 80px !important; }
  .h-full { height: 100% !important; }
  .h-2 { height: 8px !important; }
  .h-3 { height: 12px !important; }
  .h-8 { height: 32px !important; }
  .h-20 { height: 80px !important; }
  
  /* Avatar and profile styles */
  .w-20.h-20.rounded-full.border-2.border-gray-200 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 50% !important;
    border: 2px solid #e5e7eb !important;
    background: #10b981 !important;
  }
  
  /* Skills tags */
  .bg-gray-100.text-gray-800.px-3.py-1.rounded-full.text-sm.font-medium {
    background-color: #f3f4f6 !important;
    color: #1f2937 !important;
    padding: 4px 12px !important;
    border-radius: 9999px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
  }
  
  .skill-tag-refined {
    background-color: #f9fafb !important;
    color: #374151 !important;
    padding: 8px 12px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    border: 1px solid #e5e7eb !important;
  }
  
  /* Progress bars */
  .bg-blue-600 { background-color: #2563eb !important; }
  .bg-gray-300 { background-color: #d1d5db !important; }
  .overflow-hidden { overflow: hidden !important; }
  .transition-all { transition: all 0.5s ease !important; }
  
  /* Cards and containers */
  .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
  .mx-auto { margin-left: auto !important; margin-right: auto !important; }
  
  /* Hide buttons in PDF */
  button,
  .no-print,
  [class*="bg-blue-"][class*="hover"],
  [class*="cursor-pointer"] {
    display: none !important;
  }
  
  /* Page break rules - Allow content to flow naturally */
  .scorecard-item {
    page-break-inside: avoid !important;
  }
  
  /* Allow sections to break if needed */
  .xl\\:col-span-2, .xl\\:col-span-1 {
    page-break-inside: auto !important;
  }
  
  /* Overall layout improvements */
  .scorecard-wrapper {
    max-width: 100% !important;
    overflow: hidden !important;
    background: #ffffff !important;
    padding: 12px !important;
  }
  
  @media print {
    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    @page {
      margin: 0.3in !important;
    }
    
    body {
      margin: 0 !important;
      padding: 0 !important;
      font-size: 12px !important;
    }
    
    /* Reduce spacing in print to keep content together */
    .mb-2 { margin-bottom: 4px !important; }
    .mb-4 { margin-bottom: 8px !important; }
    .mb-6 { margin-bottom: 12px !important; }
    .mb-8 { margin-bottom: 16px !important; }
    .mt-8 { margin-top: 16px !important; }
    .gap-4 { gap: 8px !important; }
    .gap-6 { gap: 12px !important; }
    .py-8 { padding-top: 16px !important; padding-bottom: 16px !important; }
    
    .xl\\:grid-cols-3 {
      grid-template-columns: 1.8fr 1fr !important;
      gap: 16px !important;
    }
    
    /* Ensure content flows naturally */
    .grid {
      page-break-inside: auto !important;
    }
  }
`;
