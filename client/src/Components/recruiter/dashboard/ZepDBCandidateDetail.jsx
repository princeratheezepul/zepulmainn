import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, GraduationCap, Award, Code, FolderOpen, Send, X, Loader2 } from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from 'react-hot-toast';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

const SubmitToJobModal = ({ isOpen, onClose, candidate, onSubmitSuccess }) => {
  const { get, post } = useApi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/assigned-jobs`);
      if (response.ok) {
        const data = await response.json();
        // Only show open jobs
        const openJobs = (data.jobs || []).filter(job => !job.isClosed);
        setJobs(openJobs);
      } else {
        toast.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error("An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const constructResumeText = (candidate) => {
    let text = `${candidate.name}\n${candidate.role || ''}\n\n`;

    if (candidate.experience && candidate.experience.length > 0) {
      text += "EXPERIENCE\n";
      candidate.experience.forEach(exp => {
        text += `${exp.title} at ${exp.company} (${exp.duration})\n`;
        if (exp.points) text += exp.points.map(p => `- ${p}`).join('\n') + '\n';
      });
      text += '\n';
    }

    if (candidate.skills && candidate.skills.length > 0) {
      text += "SKILLS\n" + candidate.skills.join(', ') + "\n\n";
    }

    if (candidate.projects && candidate.projects.length > 0) {
      text += "PROJECTS\n";
      candidate.projects.forEach(proj => {
        text += `${proj.title}\n`;
        if (proj.points) text += proj.points.map(p => `- ${p}`).join('\n') + '\n';
      });
      text += '\n';
    }

    if (candidate.education && candidate.education.length > 0) {
      text += "EDUCATION\n";
      candidate.education.forEach(edu => {
        text += `${edu.degree} from ${edu.institution}\n`;
        if (edu.points) text += edu.points.map(p => `- ${p}`).join('\n') + '\n';
      });
      text += '\n';
    }

    return text;
  };

  const generateAIEvaluation = async (resumeText, jobDetails) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert AI recruiter analyzing a resume for a specific job.
      Job Details:
      - Title: ${jobDetails.jobtitle}
      - Description: ${jobDetails.description}
      - Required Skills: ${(jobDetails.requiredSkills || []).join(", ")}

      Resume Text:
      ---
      ${resumeText}
      ---

      Based on the job details and resume text, provide a detailed analysis in a pure JSON format. Do not include any markdown, code blocks, or explanations. The JSON object should have EXACTLY the following structure:
      {
        "aiSummary": {
          "technicalExperience": "A 1-2 sentence summary of their technical background.",
          "projectExperience": "A 1-2 sentence summary of their project work and accomplishments.",
          "education": "A 1-2 sentence summary of their educational qualifications.",
          "keyAchievements": "A 1-2 sentence summary of their most impressive achievements.",
          "skillMatch": "A 1-2 sentence analysis of how well their skills align with the job.",
          "competitiveFit": "A 1-2 sentence assessment of their market position.",
          "consistencyCheck": "A 1-2 sentence evaluation of their career stability."
        },
        "aiScorecard": {
          "technicalSkillMatch": number (0-100),
          "competitiveFit": number (0-100),
          "consistencyCheck": number (0-100),
          "teamLeadership": number (0-100)
        },
        "ats_score": number (0-100),
        "ats_reason": "Short summary of why they got this ATS score",
        "ats_breakdown": {
          "skill_match": { "score": number, "reason": "string" },
          "experience_relevance": { "score": number, "reason": "string" },
          "project_achievement": { "score": number, "reason": "string" },
          "consistency_check": { "score": number, "reason": "string" }
        },
        "recommendation": "A short, decisive recommendation.",
        "keyStrength": ["Strength 1", "Strength 2"],
        "potentialConcern": ["Concern 1", "Concern 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const aiText = await result.response.text();
    const cleanedText = aiText.replace(/```json|```/g, "").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
    return JSON.parse(cleanedText);
  };

  const handleSubmit = async () => {
    if (!selectedJob) return;

    try {
      setSubmitting(true);
      setLoadingText("Evaluating candidate for the role...");

      const resumeText = constructResumeText(candidate);

      // Get AI Evaluation
      const aiAnalysis = await generateAIEvaluation(resumeText, selectedJob);

      setLoadingText("Submitting application...");

      // Prepare payload (matching the Resume model structure)
      const resumeData = {
        name: candidate.name,
        email: candidate.email || 'N/A',
        phone: candidate.phone || 'N/A',
        title: candidate.role || 'N/A',
        experience: `${candidate.experienceYears || 0} years`,
        skills: candidate.skills || [],
        location: candidate.location || 'N/A',

        // AI Fields directly injected
        aiSummary: aiAnalysis.aiSummary,
        aiScorecard: aiAnalysis.aiScorecard,
        ats_score: aiAnalysis.ats_score,
        ats_reason: aiAnalysis.ats_reason,
        ats_breakdown: aiAnalysis.ats_breakdown,
        recommendation: aiAnalysis.recommendation,
        keyStrength: aiAnalysis.keyStrength,
        potentialConcern: aiAnalysis.potentialConcern,

        // Linkage and internal tracking fields
        resumeDataId: candidate.id || candidate._id,
        isMarketplace: false,
        isMPUser: false,
        status: 'submitted',

        // Basic app details
        applicationDetails: {
          position: selectedJob.jobtitle,
          date: new Date().toLocaleDateString(),
          source: "ZepDB"
        }
      };

      const response = await post(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/save/${selectedJob._id || selectedJob.id}`, resumeData);

      if (response.ok) {
        toast.success(`Candidate submitted to ${selectedJob.jobtitle} successfully!`);
        onSubmitSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit candidate");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("An error occurred during submission.");
    } finally {
      setSubmitting(false);
      setLoadingText("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Submit to Job</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={submitting}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {submitting ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              <p className="text-gray-600 font-medium text-center">{loadingText}</p>
              <p className="text-xs text-gray-400 text-center max-w-xs">AI is analyzing the ResumeData structure and matching it against the job description.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No open jobs assigned to you.
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-2">Select an open job to submit <strong>{candidate.name}</strong> to:</p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {jobs.map(job => {
                  const isSelected = selectedJob && (
                    (selectedJob._id && job._id && selectedJob._id === job._id) ||
                    (selectedJob.id && job.id && selectedJob.id === job.id)
                  );

                  return (
                    <div
                      key={job._id || job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className="font-semibold text-gray-800">{job.jobtitle}</div>
                      <div className="text-xs text-gray-500 flex justify-between mt-1">
                        <span>{job.company}</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!submitting && (
          <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedJob}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              Evaluate & Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ZepDBCandidateDetail = ({ candidate, onBack }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!candidate) return null;

  const getAvatarColor = (name) => {
    const colors = ['bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'];
    const index = (name || '').length % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    return (name || 'N A').split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center py-0 px-0 bg-gray-50 overflow-auto">
        <div className="w-full max-w-5xl bg-gray-50">
          {/* Back Button */}
          <div className="bg-gray-50 w-full px-4 md:px-0 pt-6 pb-2 flex-shrink-0 flex justify-between items-center">
            <div
              onClick={onBack}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search Results
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit to Job
            </button>
          </div>

          {/* Header Card */}
          <div className="bg-white p-6 md:p-8 rounded-lg w-full mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-6">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getAvatarColor(candidate.name)}`}>
                {getInitials(candidate.name)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
                <p className="text-gray-600 text-lg">{candidate.role || 'N/A'}</p>
                {candidate.experienceYears > 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    {candidate.experienceYears} year{candidate.experienceYears !== 1 ? 's' : ''} of experience
                  </p>
                )}
              </div>
            </div>

            {/* Skills Bar */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                {candidate.skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content Sections */}
          <div className="space-y-6 mb-8">

            {/* Experience */}
            {candidate.experience && candidate.experience.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Experience
                </h2>
                <div className="space-y-6">
                  {candidate.experience.map((exp, idx) => (
                    <div key={idx} className={idx > 0 ? 'border-t pt-4' : ''}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">{exp.title || 'N/A'}</h3>
                        {exp.duration && (
                          <span className="text-sm text-gray-500">{exp.duration}</span>
                        )}
                      </div>
                      {exp.company && (
                        <p className="text-gray-600 text-sm mb-2">{exp.company}</p>
                      )}
                      {exp.points && exp.points.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1">
                          {exp.points.map((point, pidx) => (
                            <li key={pidx} className="text-gray-700 text-sm">{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {candidate.projects && candidate.projects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                  Projects
                </h2>
                <div className="space-y-6">
                  {candidate.projects.map((project, idx) => (
                    <div key={idx} className={idx > 0 ? 'border-t pt-4' : ''}>
                      <h3 className="font-semibold text-gray-800 text-lg mb-2">{project.title || 'N/A'}</h3>
                      {project.points && project.points.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1">
                          {project.points.map((point, pidx) => (
                            <li key={pidx} className="text-gray-700 text-sm">{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  Education
                </h2>
                <div className="space-y-6">
                  {candidate.education.map((edu, idx) => (
                    <div key={idx} className={idx > 0 ? 'border-t pt-4' : ''}>
                      <h3 className="font-semibold text-gray-800 text-lg">{edu.degree || 'N/A'}</h3>
                      {edu.institution && (
                        <p className="text-gray-600 text-sm mb-2">{edu.institution}</p>
                      )}
                      {edu.points && edu.points.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1">
                          {edu.points.map((point, pidx) => (
                            <li key={pidx} className="text-gray-700 text-sm">{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {candidate.achievements && candidate.achievements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Achievements
                </h2>
                <ul className="list-disc pl-5 space-y-2">
                  {candidate.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-gray-700">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Detail */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-red-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SubmitToJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={candidate}
        onSubmitSuccess={() => { /* Optional: Navigate or update UI after success */ }}
      />
    </div>
  );
};

export default ZepDBCandidateDetail;
