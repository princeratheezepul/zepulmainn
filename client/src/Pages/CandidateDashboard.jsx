import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ZepJobs.css";
import { getApiUrl } from "../config/config";
import InterviewPrepPanel from "../Components/InterviewPrepPanel";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [dreamJob, setDreamJob] = useState("");
  const [activeTab, setActiveTab] = useState("find");

  // Per-candidate interview state — fetched from the server so it never leaks
  // between different candidates using the same browser.
  const [loading, setLoading] = useState(true);
  const [hasInterviewed, setHasInterviewed] = useState(false);
  const [recommended, setRecommended] = useState([]);

  // Live postings pulled from the internet via web search. Loaded separately so a
  // slow search never holds up the jobs we already have in our own database.
  const [webJobs, setWebJobs] = useState([]);
  const [webLoading, setWebLoading] = useState(false);

  // On-demand search. Unlocked once the candidate has completed their interview —
  // before that the AI agent is the only way in, so we have a profile to match on.
  const [searchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState(null); // { query, jobs, webJobs }
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchWebLoading, setSearchWebLoading] = useState(false);
  // Identifies the newest search so a slower, superseded one can't write its
  // results or clear the spinners belonging to the search that replaced it.
  const searchIdRef = useRef(0);

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

  // Pull matching roles from around the web. Only worth doing once we know the
  // candidate has a profile to match against.
  const loadWebJobs = async ({ refresh = false } = {}) => {
    if (!candidate?._id) return;
    try {
      setWebLoading(true);
      const res = await fetch(
        getApiUrl(
          `/api/candidate-interview/candidate/${candidate._id}/web-jobs${refresh ? "?refresh=true" : ""}`
        )
      );
      const data = await res.json().catch(() => ({}));
      setWebJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch {
      setWebJobs([]);
    } finally {
      setWebLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !hasInterviewed) return;
    loadWebJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasInterviewed]);

  const currentTab = activeTab;

  // Run both halves of a search at once: database matches land fast, the web pass
  // takes 10-25s and fills in behind its own spinner.
  const runSearch = async (e) => {
    e?.preventDefault?.();
    const query = searchQuery.trim();
    if (!query || !candidate?._id) return;

    const id = ++searchIdRef.current;
    setSearch({ query, jobs: [], webJobs: [] });
    setSearchLoading(true);
    setSearchWebLoading(true);

    const isCurrent = () => searchIdRef.current === id;

    const post = (path) =>
      fetch(getApiUrl(`/api/candidate-interview/candidate/${candidate._id}/${path}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      }).then((res) => res.json().catch(() => ({})));

    post("search")
      .then((data) => {
        if (!isCurrent()) return;
        setSearch((prev) => (prev ? { ...prev, jobs: Array.isArray(data.matches) ? data.matches : [] } : prev));
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent()) setSearchLoading(false);
      });

    post("search/web")
      .then((data) => {
        if (!isCurrent()) return;
        setSearch((prev) => (prev ? { ...prev, webJobs: Array.isArray(data.jobs) ? data.jobs : [] } : prev));
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent()) setSearchWebLoading(false);
      });
  };

  const clearSearch = () => {
    searchIdRef.current += 1;
    setSearch(null);
    setSearchQuery("");
    setSearchLoading(false);
    setSearchWebLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("candidateInfo");
    localStorage.removeItem("candidateToken");
    navigate("/candidate/login", { replace: true });
  };

  // Card renderers, shared by the recommendations list and the search results so
  // a job looks the same however the candidate arrived at it.
  const renderDbJob = (job) => (
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
  );

  const renderWebJob = (job) => (
    <a
      key={job._id}
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-base font-bold text-black">{job.jobtitle}</span>
            {job.isInternship && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                Internship
              </span>
            )}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              From the web
            </span>
            {job.matchScore > 0 && (
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
            {job.employmentType && !job.isInternship && <span>{job.employmentType}</span>}
            {job.salary && <span>{job.salary}</span>}
            {job.sourceName && <span className="text-gray-400">via {job.sourceName}</span>}
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 border border-blue-600 text-blue-600 text-sm font-medium px-4 py-2 rounded-lg">
          View Job
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </span>
      </div>
    </a>
  );

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
        {/* Search box. Before the interview the only way in is the AI agent — it's
            what builds the profile everything else matches against. Afterwards the
            same tab becomes a free-text search they can run as often as they like. */}
        <div className="search-box mt-4">
          <div className="search-tabs" role="tablist" aria-label="Job search or interview prep">
            <button
              type="button"
              role="tab"
              id="tab-find"
              aria-selected={currentTab === "find"}
              aria-controls="panel-find"
              className={`search-tab${currentTab === "find" ? " active" : ""}`}
              onClick={() => setActiveTab("find")}
            >
              {hasInterviewed ? "Search Jobs" : "Find a Job"}
            </button>
            <button
              type="button"
              role="tab"
              id="tab-prep"
              aria-selected={currentTab === "prep"}
              aria-controls="panel-prep"
              className={`search-tab${currentTab === "prep" ? " active" : ""}`}
              onClick={() => setActiveTab("prep")}
            >
              Get Free Interview Prep
            </button>
          </div>

          <div className="search-tab-body">
            {currentTab === "find" && !hasInterviewed && (
              <div className="search-panel" role="tabpanel" id="panel-find" aria-labelledby="tab-find">
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

            {currentTab === "find" && hasInterviewed && (
              <form
                className="search-panel"
                role="tabpanel"
                id="panel-find"
                aria-labelledby="tab-find"
                onSubmit={runSearch}
              >
                <label className="search-label" htmlFor="job-search-input">
                  Search for a role
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="job-search-input"
                    type="text"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Senior React Developer in Bangalore, remote product design internship…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxLength={200}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!searchQuery.trim() || searchLoading || searchWebLoading}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {searchLoading || searchWebLoading ? "Searching…" : "Search"}
                    </button>
                    {search && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="shrink-0 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}

            {currentTab === "prep" && (
              <InterviewPrepPanel id="panel-prep" labelledBy="tab-prep" />
            )}
          </div>
        </div>

        {search ? (
          /* On-demand search results — replaces the recommendations while active. */
          <div className="mt-6">
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <div className="text-base font-bold text-black">
                  Results for &ldquo;{search.query}&rdquo;
                </div>
                <p className="text-xs text-gray-500">Zepul roles and live openings from the web</p>
              </div>
              <button
                onClick={clearSearch}
                className="shrink-0 text-xs font-medium text-blue-600 hover:underline cursor-pointer"
              >
                Back to recommendations
              </button>
            </div>

            {searchLoading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                <span className="text-sm text-gray-600">Searching Zepul roles…</span>
              </div>
            ) : search.jobs.length > 0 ? (
              <div className="space-y-3">{search.jobs.map(renderDbJob)}</div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-600">
                  No roles from Zepul&rsquo;s own network matched this search.
                </p>
              </div>
            )}

            <div className="mt-8">
              <div className="mb-2">
                <div className="text-base font-bold text-black">From around the web</div>
                <p className="text-xs text-gray-500">
                  Live openings matching your search — opens on the original site
                </p>
              </div>

              {searchWebLoading ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  <span className="text-sm text-gray-600">Searching the web…</span>
                </div>
              ) : search.webJobs.length > 0 ? (
                <div className="space-y-3">{search.webJobs.map(renderWebJob)}</div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                  <p className="text-sm text-gray-600">
                    We couldn&rsquo;t find live web postings for this search. Try different wording.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Recommended from the AI interview, plus web matches for the same profile. */
          <div className="mt-6">
            <div className="mb-2">
              <div className="text-base font-bold text-black">Recommended for you</div>
              <p className="text-xs text-gray-500">Matched from your AI career interview</p>
            </div>

            {recommended.length === 0 && webJobs.length === 0 && !webLoading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-600">
                  {hasInterviewed
                    ? "We couldn't find matching roles right now. New roles are added regularly — please check back soon."
                    : "You don't have any recommendations yet. Talk to our AI agent above and we'll match you with roles that fit you."}
                </p>
              </div>
            ) : recommended.length === 0 ? (
              // No in-house match, but the web search below still has something.
              <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-600">
                  No roles from our own network match you right now — here's what we found elsewhere.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommended.map(renderDbJob)}
              </div>
            )}

            {/* Live openings sourced from the web, matched to the same profile.
                These aren't ours, so clicking through opens the original posting. */}
            {(webLoading || webJobs.length > 0) && (
              <div className="mt-8">
                <div className="mb-2 flex items-end justify-between gap-4">
                  <div>
                    <div className="text-base font-bold text-black">More roles from around the web</div>
                    <p className="text-xs text-gray-500">
                      Live jobs and internships we found online that fit your profile — opens on the original site
                    </p>
                  </div>
                  {!webLoading && (
                    <button
                      onClick={() => loadWebJobs({ refresh: true })}
                      className="shrink-0 text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                    >
                      Refresh
                    </button>
                  )}
                </div>

                {webLoading ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <span className="text-sm text-gray-600">Searching the web for jobs and internships…</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {webJobs.map(renderWebJob)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
