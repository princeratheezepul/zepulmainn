import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, Briefcase, FileText, Play, Download, TrendingUp, Award, MessageSquare, AlertCircle, CheckCircle, XCircle, Target, BarChart3, Zap, Users, Brain, Mic, Star, HelpCircle, Mail, Phone, MapPin, ThumbsUp, Lightbulb, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { getApiUrl } from "../../../config/config";

const CircularProgress = ({ percentage, size = 160, strokeWidth = 14 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute top-0 left-0"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: 'center'
        }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e8e8e8"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          opacity="1"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          opacity="1"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-in-out'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{percentage}%</div>
        </div>
      </div>
    </div>
  );
};

const InterviewResultsDashboard = ({ meetingId, onBack }) => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        toast.error("Not authenticated");
        return;
      }

      // Try to find the meeting in all statuses first
      const response = await fetch(getApiUrl(`/api/meetings/recruiter/meetings`), {
        headers: {
          Authorization: `Bearer ${userInfo.data.accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch meeting details");
      }

      const data = await response.json();
      const foundMeeting = data.meetings.find((m) => m.id === meetingId);
      if (foundMeeting) {
        setMeeting(foundMeeting);
      } else {
        toast.error("Meeting not found");
      }
    } catch (error) {
      console.error("Error fetching meeting:", error);
      toast.error("Failed to load meeting details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="bg-white p-6 rounded-lg">
          <button onClick={onBack} className="mb-4 text-blue-600 hover:underline font-semibold">
            ← Back
          </button>
          <div className="text-center text-gray-500">Meeting not found</div>
        </div>
      </div>
    );
  }

  const report = meeting.report || {};
  const scores = report.scores || {};
  const overallScore = calculateOverallScore(scores);
  const roleAlignment = calculateRoleAlignment(scores);
  const interviewDuration = calculateInterviewDuration(meeting);
  const strengths = extractStrengths(report);
  const weaknesses = extractWeaknesses(report);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 text-blue-600 hover:underline font-semibold flex items-center gap-2"
          >
            ← Back
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white p-4 md:p-8 rounded-lg w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <img
                src={`https://api.dicebear.com/8.x/initials/svg?seed=${meeting.resume?.name || meeting.candidateEmail}`}
                alt={meeting.resume?.name || "Candidate"}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200"
              />
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {meeting.resume?.name || meeting.candidateEmail}
                </div>
                <p className="text-gray-600 text-lg">{meeting.job?.title || "Interview"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  meeting.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : meeting.status === "active"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {meeting.status === "completed" && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Contact & Meeting Info */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-y py-4 mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Mail size={16} /> {meeting.candidateEmail}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} />{" "}
                {new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} /> {meeting.durationMinutes} minutes
              </span>
              {meeting.job?.company && (
                <span className="flex items-center gap-2">
                  <Briefcase size={16} /> {meeting.job.company}
                </span>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left & Middle Column */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
              {/* Overall Performance */}
              <div className="p-6 border rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-black mb-6">Interview Performance</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-base font-bold text-gray-900 mb-2">Overall Score</div>
                    <div className="flex items-center gap-4">
                      <CircularProgress percentage={overallScore} size={120} strokeWidth={10} />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{overallScore}%</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {getPerformanceLabel(overallScore)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-gray-900 mb-2">Role Alignment</div>
                    <div className="flex items-center gap-4">
                      <CircularProgress percentage={roleAlignment} size={120} strokeWidth={10} />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{roleAlignment}%</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {getAlignmentLabel(roleAlignment)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              {Object.keys(scores).length > 0 && (
                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="text-lg font-bold text-black mb-6">Detailed Assessment</div>
                  <div className="space-y-6">
                    {Object.entries(scores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-gray-800 font-semibold text-base flex items-center gap-2">
                            {getScoreIcon(key)}
                            {formatScoreKey(key)}
                          </div>
                          <span className="font-bold text-gray-900 text-base">
                            {value || 0}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              value >= 8
                                ? "bg-green-500"
                                : value >= 6
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${(value / 10) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getScoreDescription(key, value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Summary */}
              {report.summary && (
                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-gray-600" />
                    Interview Summary
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {report.summary}
                  </p>
                </div>
              )}

              {/* Strengths */}
              {strengths.length > 0 && (
                <div className="p-6 border rounded-xl bg-green-50">
                  <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-green-600" />
                    Key Strengths
                  </div>
                  <ul className="list-disc pl-5 text-gray-800 space-y-1">
                    {strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses/Concerns */}
              {weaknesses.length > 0 && (
                <div className="p-6 border rounded-xl bg-red-50">
                  <div className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Areas for Improvement
                  </div>
                  <ul className="list-disc pl-5 text-gray-800 space-y-1">
                    {weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm">{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transcript */}
              {meeting.transcript && (
                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-black flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      Interview Transcript
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(meeting.transcript);
                        toast.success("Transcript copied to clipboard");
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto border">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {meeting.transcript}
                    </p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {meeting.transcript.length} characters •{" "}
                    {Math.ceil(meeting.transcript.split(" ").length / 200)} minutes reading time
                  </div>
                </div>
              )}

              {/* Recording */}
              {meeting.recordingUrl && (
                <div className="p-6 border rounded-xl bg-gray-50">
                  <div className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-gray-600" />
                    Interview Recording
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={meeting.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Play Recording
                    </a>
                    <a
                      href={meeting.recordingUrl}
                      download
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>
                </div>
              )}

              {/* Meeting Details */}
              <div className="p-6 border rounded-xl bg-gray-50">
                <div className="text-lg font-bold text-black mb-4">Meeting Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Scheduled Date</span>
                    <p>
                      {new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Scheduled Time</span>
                    <p>
                      {new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZoneName: "short",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Duration</span>
                    <p>{meeting.durationMinutes} minutes</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Interview Type</span>
                    <p>AI-Led Video Interview</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Created</span>
                    <p>
                      {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block mb-1">Completed</span>
                    <p>
                      {new Date(meeting.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-1">
              <div className="rounded-2xl border p-4 shadow bg-gray-50 flex flex-col sticky top-4">
                {/* Overall Score */}
                <div className="text-base font-bold text-black mb-2">Overall Score</div>
                <div className="relative my-2 flex justify-center">
                  <CircularProgress percentage={overallScore} size={144} strokeWidth={12} />
                </div>

                {/* Recommendation */}
                <div className="w-full text-center bg-blue-100 text-blue-900 font-medium rounded-xl py-2 px-3 mb-4">
                  {report.recommendation || getRecommendationText(overallScore)}
                </div>

                {/* Role Alignment */}
                <div className="w-full mb-4 rounded-xl p-4 bg-blue-50">
                  <div className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Role Alignment
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{roleAlignment}%</div>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${roleAlignment}%` }}
                    ></div>
                  </div>
                </div>

                {/* Key Strengths */}
                {strengths.length > 0 && (
                  <div className="w-full mb-4 rounded-xl p-4 bg-green-50">
                    <div className="font-semibold text-gray-800 mb-2">Key Strengths</div>
                    <ul className="list-disc pl-5 text-gray-800">
                      {strengths.slice(0, 3).map((strength, idx) => (
                        <li key={idx} className="text-sm">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Concerns */}
                {weaknesses.length > 0 && (
                  <div className="w-full rounded-xl p-4 bg-red-50 mb-4">
                    <div className="font-semibold text-gray-800 mb-2">Potential Concerns</div>
                    <ul className="list-disc pl-5 text-gray-800">
                      {weaknesses.slice(0, 3).map((weakness, idx) => (
                        <li key={idx} className="text-sm">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interview Metrics */}
                <div className="w-full rounded-xl p-4 border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-3">Interview Metrics</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold text-gray-900">
                        {interviewDuration.actual || meeting.durationMinutes} min
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Questions Asked</span>
                      <span className="font-semibold text-gray-900">
                        {interviewDuration.questions || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Quality</span>
                      <span className="font-semibold text-gray-900">
                        {scores.communication || scores.responseQuality || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateOverallScore(scores) {
  const scoreValues = Object.values(scores).filter((v) => typeof v === "number");
  if (scoreValues.length === 0) return 0;
  const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  return Math.round((average / 10) * 100);
}

function calculateRoleAlignment(scores) {
  // Weighted average giving more importance to technical and problem-solving
  const weights = {
    technicalDepth: 0.3,
    problemSolving: 0.25,
    communication: 0.2,
    culturalFit: 0.15,
    experience: 0.1,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(weights).forEach(([key, weight]) => {
    if (scores[key] !== undefined) {
      weightedSum += (scores[key] / 10) * 100 * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) {
    // Fallback: use overall score
    return calculateOverallScore(scores);
  }

  return Math.round(weightedSum / totalWeight);
}

function calculateInterviewDuration(meeting) {
  if (!meeting.transcript) return { actual: null, questions: null };

  const words = meeting.transcript.split(" ").length;
  const estimatedMinutes = Math.ceil(words / 150); // Average speaking rate
  const questions = (meeting.transcript.match(/\?/g) || []).length;

  return {
    actual: estimatedMinutes,
    questions: questions || null,
  };
}

function extractStrengths(report) {
  const strengths = [];
  if (report.strengths && Array.isArray(report.strengths)) {
    return report.strengths;
  }
  if (report.summary) {
    // Try to extract strengths from summary
    const summary = report.summary.toLowerCase();
    if (summary.includes("strong") || summary.includes("excellent") || summary.includes("good")) {
      const sentences = report.summary.split(/[.!?]+/).filter((s) => s.trim());
      sentences.forEach((sentence) => {
        if (
          sentence.toLowerCase().includes("strong") ||
          sentence.toLowerCase().includes("excellent") ||
          sentence.toLowerCase().includes("demonstrated")
        ) {
          strengths.push(sentence.trim());
        }
      });
    }
  }
  return strengths.slice(0, 5);
}

function extractWeaknesses(report) {
  const weaknesses = [];
  if (report.risks && Array.isArray(report.risks)) {
    return report.risks;
  }
  if (report.weaknesses && Array.isArray(report.weaknesses)) {
    return report.weaknesses;
  }
  if (report.summary) {
    const summary = report.summary.toLowerCase();
    if (summary.includes("concern") || summary.includes("weak") || summary.includes("lack")) {
      const sentences = report.summary.split(/[.!?]+/).filter((s) => s.trim());
      sentences.forEach((sentence) => {
        if (
          sentence.toLowerCase().includes("concern") ||
          sentence.toLowerCase().includes("weak") ||
          sentence.toLowerCase().includes("lack") ||
          sentence.toLowerCase().includes("limited")
        ) {
          weaknesses.push(sentence.trim());
        }
      });
    }
  }
  return weaknesses.slice(0, 5);
}

function formatScoreKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function getScoreIcon(key) {
  const iconMap = {
    technicalDepth: <Brain className="w-4 h-4" />,
    problemSolving: <Zap className="w-4 h-4" />,
    communication: <Mic className="w-4 h-4" />,
    culturalFit: <Users className="w-4 h-4" />,
    experience: <Briefcase className="w-4 h-4" />,
  };
  return iconMap[key] || <Award className="w-4 h-4" />;
}

function getScoreDescription(key, value) {
  if (value >= 8) return "Excellent performance";
  if (value >= 6) return "Good performance";
  if (value >= 4) return "Average performance";
  return "Needs improvement";
}

function getPerformanceLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Improvement";
}

function getAlignmentLabel(score) {
  if (score >= 85) return "Highly Aligned";
  if (score >= 70) return "Well Aligned";
  if (score >= 50) return "Moderately Aligned";
  return "Low Alignment";
}

function getRecommendationText(score) {
  if (score >= 80) return "Strong Hire";
  if (score >= 60) return "Consider for Hire";
  if (score >= 40) return "Consider with Caution";
  return "Not Recommended";
}

export default InterviewResultsDashboard;
