import { toast } from 'react-hot-toast';

// Circular progress bar component as string template
const getCircularProgressSVG = (percentage, size = 160, strokeWidth = 14) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return `
    <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px; margin: 0 auto;">
      <svg 
        width="${size}" 
        height="${size}" 
        viewBox="0 0 ${size} ${size}"
        class="absolute top-0 left-0"
        style="transform: rotate(-90deg); transform-origin: center; display: block;"
      >
        <!-- Background circle -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="#e8e8e8"
          stroke-width="${strokeWidth}"
          fill="none"
          stroke-linecap="round"
          opacity="1"
        />
        <!-- Progress circle -->
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          stroke="#3b82f6"
          stroke-width="${strokeWidth}"
          fill="none"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          stroke-linecap="round"
          opacity="1"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center z-10" style="pointer-events: none;">
        <span 
          class="font-bold text-gray-900" 
          style="font-size: 24px; line-height: 1; text-align: center; display: block; margin: 0; padding: 0;"
        >
          ${percentage}%
        </span>
      </div>
    </div>
  `;
};

// Helper functions
const getMatchLabel = (score) => {
  if (score >= 80) return { label: 'Strong Match', color: 'text-green-600', bg: 'bg-green-50' };
  if (score >= 60) return { label: 'Good Match', color: 'text-green-500', bg: 'bg-green-50' };
  return { label: 'Less Match', color: 'text-red-600', bg: 'bg-red-50' };
};



// Generate the complete PDF content
const generatePDFContent = (resumeData, note = '') => {
  const score = resumeData.overallScore || resumeData.ats_score || 0;
  const match = getMatchLabel(score);

  // Extract OA score if available
  const oaScore = resumeData.oa?.evaluation?.score || 0;
  const hasOAData = resumeData.oa && resumeData.oa.evaluation;
  const oaMatch = getMatchLabel(oaScore);

  // AI Summary section
  const aiSummaryHTML = resumeData.aiSummary && Object.keys(resumeData.aiSummary).length > 0
    ? Object.entries(resumeData.aiSummary).map(([key, value]) => `
        <div class="flex gap-4 items-start">
          <div class="bg-white rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12" y2="17"></line>
            </svg>
          </div>
          <div>
            <div class="font-bold text-gray-900 text-base mb-2">${key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}</div>
            <p class="text-gray-700 text-sm leading-relaxed">${value}</p>
          </div>
        </div>
      `).join('')
    : `<div class="text-gray-500 text-sm">No AI summary available.</div>`;

  // AI Scorecard section
  const aiScorecardHTML = resumeData.aiScorecard && Object.keys(resumeData.aiScorecard).length > 0
    ? Object.entries(resumeData.aiScorecard).map(([key, value]) => {
      const numericValue = parseInt(value) || 0;
      const displayName = key === 'technicalSkillMatch' ? 'Technical Skill Match' :
        key === 'cultureFit' ? 'Culture Fit' :
          key === 'teamLeadership' ? 'Team Leadership' :
            key.charAt(0).toUpperCase() + key.slice(1);
      return `
          <div class="scorecard-item">
            <div class="flex justify-between items-center mb-3">
              <div class="text-gray-800 font-semibold text-base">${displayName}</div>
              <span class="font-bold text-gray-900 text-base">${numericValue}%</span>
            </div>
            <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: ${Math.min(Math.max(numericValue, 0), 100)}%"></div>
            </div>
          </div>
        `;
    }).join('')
    : `<div class="space-y-6">
        <div class="scorecard-item">
          <div class="flex justify-between items-center mb-3">
            <div class="text-gray-800 font-semibold text-base">Technical Skill Match</div>
            <span class="font-bold text-gray-900 text-base">85%</span>
          </div>
                              <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 85%"></div>
                    </div>
        </div>
        <div class="scorecard-item">
          <div class="flex justify-between items-center mb-3">
            <div class="text-gray-800 font-semibold text-base">Communication</div>
            <span class="font-bold text-gray-900 text-base">78%</span>
          </div>
                              <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 78%"></div>
                    </div>
        </div>
        <div class="scorecard-item">
          <div class="flex justify-between items-center mb-3">
            <div class="text-gray-800 font-semibold text-base">Culture Fit</div>
            <span class="font-bold text-gray-900 text-base">72%</span>
          </div>
                              <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 72%"></div>
                    </div>
        </div>
        <div class="scorecard-item">
          <div class="flex justify-between items-center mb-3">
            <div class="text-gray-800 font-semibold text-base">Team Leadership</div>
            <span class="font-bold text-gray-900 text-base">65%</span>
          </div>
                              <div class="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 65%"></div>
                    </div>
        </div>
      </div>`;

  // Key Strength section
  const keyStrengthHTML = resumeData.keyStrength && resumeData.keyStrength.length > 0
    ? resumeData.keyStrength.map(strength => `
        <li class="text-sm text-gray-700 flex items-start gap-2">
          <span class="text-green-600 mt-1">•</span>
          <span>${strength}</span>
        </li>
      `).join('')
    : `<li class="text-sm text-gray-700 flex items-start gap-2"><span class="text-green-600 mt-1">•</span><span>Strong technical skills and relevant experience</span></li>
       <li class="text-sm text-gray-700 flex items-start gap-2"><span class="text-green-600 mt-1">•</span><span>Good communication and teamwork abilities</span></li>
       <li class="text-sm text-gray-700 flex items-start gap-2"><span class="text-green-600 mt-1">•</span><span>Demonstrated problem-solving capabilities</span></li>`;

  // Potential Concern section
  const potentialConcernHTML = resumeData.potentialConcern && resumeData.potentialConcern.length > 0
    ? resumeData.potentialConcern.map(concern => `
        <li class="text-sm text-gray-700 flex items-start gap-2">
          <span class="text-red-600 mt-1">•</span>
          <span>${concern}</span>
        </li>
      `).join('')
    : `<li class="text-sm text-gray-700 flex items-start gap-2"><span class="text-red-600 mt-1">•</span><span>Some technical skill gaps identified</span></li>
       <li class="text-sm text-gray-700 flex items-start gap-2"><span class="text-red-600 mt-1">•</span><span>Resume formatting could be improved</span></li>
       <li class="text-sm text-gray-700 flex items-start gap-2"><span class="text-red-600 mt-1">•</span><span>Communication skills need assessment</span></li>`;

  // Skills section
  const skillsHTML = resumeData.skills && resumeData.skills.length > 0
    ? resumeData.skills.map(skill => `<span class="skill-tag-refined bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors">${skill}</span>`).join('')
    : ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'MongoDB', 'Solidity', 'Express.js', 'Redux', 'Git', 'Hardhat'].map(skill => `<span class="skill-tag-refined bg-gray-50 text-gray-700 px-3 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100 transition-colors">${skill}</span>`).join('');

  // Interview Transcript section
  const interviewTranscriptHTML = resumeData.interviewEvaluation && resumeData.interviewEvaluation.evaluationResults && resumeData.interviewEvaluation.evaluationResults.length > 0
    ? `<div class="w-full p-4 md:p-6 border rounded-xl bg-white">
        <div class="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Interview Transcript</div>
        <div class="space-y-4 md:space-y-6">
          ${resumeData.interviewEvaluation.evaluationResults.map((result, index) => `
            <div class="border border-gray-200 rounded-xl p-4 md:p-6">
              <div class="mb-3 md:mb-4">
                <div class="font-light text-gray-900 text-base md:text-lg">Q${index + 1}. ${result.question}</div>
              </div>
              <div class="mb-4 md:mb-6">
                <p class="text-gray-700 leading-relaxed text-sm md:text-base">${result.reason}</p>
              </div>
              <div class="flex justify-end">
                <div class="bg-gray-900 text-white px-3 py-1.5 rounded-full">
                  <span class="text-sm font-medium">Score: ${result.score}/10</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`
    : '';


  // Coding Assessment section
  const getCodingAssessmentHTML = (oaData) => {
    if (!oaData || !oaData.evaluation) return '';

    const evaluation = oaData.evaluation;
    const isPass = evaluation.pass;
    const score = evaluation.score || 0;
    const questionsCompleted = oaData.questions?.length || 0;

    return `
      <div class="p-4 border rounded-lg bg-white mb-4">
        <div class="flex items-center justify-between mb-3">
          <div class="text-base font-bold text-black">Coding Assessment Summary</div>
          <div class="flex items-center gap-2">
            ${isPass
        ? '<span class="flex items-center gap-1 text-green-700 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200"><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> Passed</span>'
        : '<span class="flex items-center gap-1 text-red-700 font-semibold text-sm bg-red-50 px-3 py-1 rounded-full border border-red-200"><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg> Needs Improvement</span>'
      }
            <span class="text-gray-700 font-bold text-sm">Score: ${score}/100</span>
          </div>
        </div>
        
        <div class="space-y-2">
          ${questionsCompleted > 0 ? `
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-blue-600"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/></svg>
              <span><strong>Questions Completed:</strong> ${questionsCompleted}</span>
            </div>
          ` : ''}
          
          ${evaluation.feedback ? `
            <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div class="font-semibold text-gray-800 mb-1 text-sm">General Feedback</div>
              <p class="text-gray-700 text-sm leading-relaxed">${evaluation.feedback}</p>
            </div>
          ` : ''}
          
          ${evaluation.complexityAnalysis ? `
            <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div class="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-blue-600"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                Complexity Analysis
              </div>
              <p class="text-gray-700 text-sm font-mono bg-white p-2 rounded border border-blue-100">${evaluation.complexityAnalysis}</p>
            </div>
          ` : ''}
          
          ${evaluation.improvementSuggestions ? `
            <div class="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div class="font-semibold text-gray-800 mb-1 text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-yellow-600"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                Suggestions for Improvement
              </div>
              <p class="text-gray-700 text-sm leading-relaxed">${evaluation.improvementSuggestions}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const codingAssessmentHTML = getCodingAssessmentHTML(resumeData.oa);

  // Added Notes section

  return `
    <div class="bg-white p-2 md:p-3 lg:p-4">
      <div class="max-w-7xl mx-auto">
        <div class="border-b border-gray-200 py-1 mb-2">
          <div class="flex flex-col items-center text-center gap-1 mb-0">
            <img src="https://api.dicebear.com/8.x/initials/svg?seed=${resumeData.name}" alt="${resumeData.name}" class="w-20 h-20 rounded-full border-2 border-gray-200 bg-green-600" />
            <div>
              <div class="text-2xl font-bold text-gray-900">${resumeData.name || 'Prince Rathi'}</div>
              <p class="text-gray-600 text-base">${resumeData.title || 'FullStack Developer'}</p>
            </div>
          </div>
          <div class="flex flex-col items-center text-center gap-4">
            <!-- Skills Section -->
            <div class="flex flex-wrap items-center justify-center gap-2">
              ${resumeData.skills && resumeData.skills.slice(0, 5).map(skill => `<span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">${skill}</span>`).join('')}
              ${(!resumeData.skills || resumeData.skills.length === 0) ? `<span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">JavaScript</span><span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">TypeScript</span><span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">React.js</span><span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Node.js</span><span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">MongoDB</span>` : ''}
            </div>
            <!-- Contact Information -->
            <div class="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <span class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg> ${resumeData.email || 'rathi.prince2@gmail.com'}</span>
              <span class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${resumeData.phone || '9690389156'}</span>
              <span class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> ${resumeData.experience || 'Less than 1 year'}</span>
              <span class="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${resumeData.location || 'Himachal Pradesh, India'}</span>
            </div>
          </div>
        </div>
        <!-- Score Cards Row -->
        <div class="grid ${hasOAData ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-5">
          ${hasOAData ? `
          <div class="p-4 border rounded-lg bg-white flex flex-col items-center justify-center">
            <div class="${oaMatch.color} text-xs font-semibold mb-2">${oaMatch.label}</div>
            <div class="text-base font-bold text-gray-900 mb-2">Coding Performance</div>
            <div class="flex justify-center">${getCircularProgressSVG(oaScore, 90, 9)}</div>
          </div>
          ` : ''}
          <div class="p-4 border rounded-lg bg-white flex flex-col items-center justify-center">
            <div class="${match.color} text-xs font-semibold mb-2">${match.label}</div>
            <div class="text-base font-bold text-gray-900 mb-2">CV Strength</div>
            <div class="flex justify-center mb-2">${getCircularProgressSVG(score, 90, 9)}</div>
            <div class="bg-blue-100 text-gray-700 px-3 py-1 rounded text-xs font-medium border border-gray-300 text-center">Consider with caution</div>
          </div>
          <div class="p-4 border rounded-lg bg-white flex flex-col items-center justify-center">
            <div class="${match.color} text-xs font-semibold mb-2">${match.label}</div>
            <div class="text-base font-bold text-gray-900 mb-2">Interview Performance</div>
            <div class="flex justify-center">${getCircularProgressSVG(score, 90, 9)}</div>
          </div>
        </div>

        <!-- Key Strength & Potential Concern Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-green-50 rounded-xl p-6 border border-green-100">
            <div class="font-bold text-gray-900 mb-4">Key Strength</div>
            <ul class="space-y-3">${keyStrengthHTML}</ul>
          </div>
          <div class="bg-red-50 rounded-xl p-6 border border-red-100">
            <div class="font-bold text-gray-900 mb-4">Potential Concern</div>
            <ul class="space-y-3">${potentialConcernHTML}</ul>
          </div>
        </div>

        <!-- Coding Assessment Summary (conditional) -->
        ${codingAssessmentHTML}

        <!-- AI Summary -->
        <div class="p-6 border rounded-xl bg-white">
          <div class="text-sm font-semibold text-black mb-4">AI Resume Summary</div>
          <div class="space-y-8">${aiSummaryHTML}</div>
        </div>
      </div>
      ${interviewTranscriptHTML}
    </div>
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
            <!-- Zepul Logo - Top Right -->
            <img src="/zepul_trademark.jpg" alt="Zepul Logo" class="zepul-logo" />
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
  /* Zepul Logo - Top Right */
  .zepul-logo {
    position: absolute !important;
    top: 20px !important;
    right: 20px !important;
    width: 120px !important;
    height: auto !important;
    z-index: 1000 !important;
    background-color: #ffffff !important;
    padding: 8px !important;
    border-radius: 8px !important;
  }
  
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
