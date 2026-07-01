import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ZepJobs.css";
import { getApiUrl } from "../config/config";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [dreamJob, setDreamJob] = useState("");

  // Per-candidate interview state — fetched from the server so it never leaks
  // between different candidates using the same browser.
  const [loading, setLoading] = useState(true);
  const [hasInterviewed, setHasInterviewed] = useState(false);
  const [recommended, setRecommended] = useState([]);

  const candidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidateInfo")) || null;
    } catch {
      return null;
    }
  })();

  // Require a candidate session
  useEffect(() => {
    if (!candidate?._id) {
      navigate("/candidate/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load this candidate's interview status + matches from the server
  useEffect(() => {
    if (!candidate?._id) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          getApiUrl(`/api/candidate-interview/candidate/${candidate._id}/latest`)
        );
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setHasInterviewed(!!data.hasInterviewed);
        setRecommended(Array.isArray(data.matches) ? data.matches : []);
      } catch {
        if (active) {
          setHasInterviewed(false);
          setRecommended([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("candidateInfo");
    localStorage.removeItem("candidateToken");
    navigate("/candidate/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Zepul" className="h-7" />
          <span className="text-sm font-semibold text-gray-700 hidden md:inline">Candidate Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/candidate/applied")}
            className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
          >
            Applied Jobs
          </button>
          <span className="text-sm text-gray-600 hidden md:inline">
            {candidate?.fullName || candidate?.email || "Candidate"}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col justify-center pb-2 pt-2 border-b border-gray-200 mb-4">
          <div className="text-lg font-bold text-black mb-0">Jobs</div>
          <p className="text-xs text-gray-500">Roles matched to you from your AI career interview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
        <>
        {/* Search box — shown only until the candidate completes their interview */}
        {!hasInterviewed && (
          <div className="search-box mt-4">
            <label className="search-label">Describe your dream job</label>
            <textarea
              className="search-textarea"
              placeholder="Senior Product Designer At An Early-Stage Startup..."
              value={dreamJob}
              onChange={(e) => setDreamJob(e.target.value)}
            ></textarea>
            <div className="search-actions">
              <button className="search-btn blue-btn" onClick={() => navigate("/candidate/interview")}>
                Talk to AI Agent
                <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Recommended from AI interview */}
        <div className="mt-6">
          <div className="mb-2">
            <div className="text-base font-bold text-black">Recommended for you</div>
            <p className="text-xs text-gray-500">Matched from your AI career interview</p>
          </div>

          {recommended.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-600">
                {hasInterviewed
                  ? "We couldn't find matching roles right now. New roles are added regularly — please check back soon."
                  : "You don't have any recommendations yet. Talk to our AI agent above and we'll match you with roles that fit you."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommended.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-indigo-100 ring-1 ring-indigo-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-black">{job.jobtitle}</span>
                        {typeof job.matchScore === "number" && job.matchScore > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            {job.matchScore}% match
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        {job.company && <span className="font-medium text-gray-700">{job.company}</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.type && <span className="capitalize">{job.type}</span>}
                        {job.employmentType && <span>{job.employmentType}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/candidate/jobs/${job._id}`)}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
