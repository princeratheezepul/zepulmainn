import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/config";

const STATUS_COLORS = {
  Applied: "bg-blue-100 text-blue-700",
  "Under review": "bg-amber-100 text-amber-700",
  Assessment: "bg-purple-100 text-purple-700",
  "Interview stage": "bg-indigo-100 text-indigo-700",
  Shortlisted: "bg-teal-100 text-teal-700",
  "Offer extended": "bg-emerald-100 text-emerald-700",
  Hired: "bg-green-100 text-green-700",
  "Not selected": "bg-gray-200 text-gray-600",
};

export default function CandidateAppliedJobs() {
  const navigate = useNavigate();

  const candidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidateInfo")) || null;
    } catch {
      return null;
    }
  })();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!candidate?._id) {
      navigate("/candidate/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/candidate-application/candidate/${candidate._id}`));
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || "Failed to load applications");
        }
        const data = await res.json();
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } catch (err) {
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };
    if (candidate?._id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Zepul" className="h-7" />
          <span className="text-sm font-semibold text-gray-700 hidden md:inline">Applied Jobs</span>
        </div>
        <button
          onClick={() => navigate("/candidate/dashboard")}
          className="text-sm font-medium text-blue-600 hover:underline cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="mb-4">
          <div className="text-lg font-bold text-black">Your Applications</div>
          <p className="text-xs text-gray-500">Track the live status of every job you've applied to</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-600 mb-4">You haven't applied to any jobs yet.</p>
            <button
              onClick={() => navigate("/candidate/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg"
            >
              Browse Recommended Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div
                key={a.applicationId}
                onClick={() => navigate(`/candidate/jobs/${a.job._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-base font-bold text-black mb-1">{a.job.jobtitle}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {a.job.company && <span className="font-medium text-gray-700">{a.job.company}</span>}
                      {a.job.location && <span>{a.job.location}</span>}
                      {a.job.type && <span className="capitalize">{a.job.type}</span>}
                      <span>Applied {formatDate(a.appliedAt)}</span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_COLORS[a.status] || "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
