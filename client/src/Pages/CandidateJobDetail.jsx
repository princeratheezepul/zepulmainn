import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  ArrowLeft,
  Loader2,
  MapPin,
  Briefcase,
  Calendar,
  IndianRupee,
  Clock,
  ListChecks,
  GraduationCap,
  FileText,
  CheckCircle2,
  Download,
  X,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
import toast, { Toaster } from "react-hot-toast";
import { getApiUrl } from "../config/config";
import { generateZepPrepPDF } from "../utils/zepPrepGenerator";

GlobalWorkerOptions.workerSrc = workerUrl;

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

const CandidateJobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const candidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidateInfo")) || null;
    } catch {
      return null;
    }
  })();

  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [prepLoading, setPrepLoading] = useState(false);

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
        const res = await fetch(
          getApiUrl(`/api/candidate-application/job/${jobId}?candidateId=${candidate?._id || ""}`)
        );
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.message || "Failed to load job");
        }
        const data = await res.json();
        setJob(data.job);
        setApplication(data.application);
      } catch (err) {
        setError(err.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    if (jobId && candidate?._id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async function () {
        const typedarray = new Uint8Array(this.result);
        try {
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
          let fullText = "";
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();
            fullText += content.items.map((i) => i.str).join(" ");
          }
          resolve(fullText);
        } catch (err) {
          reject("Failed to read PDF.");
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setSubmitting(true);
      setSubmitMsg("Reading your resume…");
      try {
        let text = "";
        if (file.type === "application/pdf") {
          text = await extractTextFromPDF(file);
        } else if (
          file.name.endsWith(".docx") ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          text = await extractTextFromDocx(file);
        } else {
          throw new Error("Unsupported file. Please upload a PDF or DOCX.");
        }
        if (!text || text.trim().length < 30) {
          throw new Error("Could not read enough text from this resume. Try another file.");
        }

        setSubmitMsg("Submitting your application…");
        const res = await fetch(getApiUrl(`/api/candidate-application/job/${jobId}/apply`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: candidate._id, text }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Failed to submit application");

        setApplication(data.application);
        setShowUpload(false);
        toast.success(data.alreadyApplied ? "You already applied to this job" : "Application submitted!");
      } catch (err) {
        toast.error(err.message || "Failed to submit application");
      } finally {
        setSubmitting(false);
        setSubmitMsg("");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobId, candidate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
    disabled: submitting,
  });

  // Fetch the candidate's ZepPrep pack (generating it on first request) and open
  // it as a printable PDF. The content is cached server-side, so re-downloads are instant.
  const handleDownloadPrep = async () => {
    if (!application?.id) {
      toast.error("Your prep document isn't ready yet — please refresh and try again.");
      return;
    }
    setPrepLoading(true);
    try {
      const res = await fetch(
        getApiUrl(
          `/api/candidate-application/prep/${application.id}?candidateId=${candidate?._id || ""}`
        )
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.prep) throw new Error(data.message || "Failed to build prep document");
      await generateZepPrepPDF(data.prep);
    } catch (err) {
      toast.error(err.message || "Failed to build prep document");
    } finally {
      setPrepLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-700 mb-3">{error || "Job not found"}</div>
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const salaryText =
    job.salary && (job.salary.min || job.salary.max)
      ? `${job.salary.min || ""}${job.salary.min && job.salary.max ? " - " : ""}${job.salary.max || ""}`
      : null;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : null;

  const facts = [
    job.employmentType && { icon: Briefcase, label: "Employment Type", value: job.employmentType },
    salaryText && { icon: IndianRupee, label: "Salary Range", value: salaryText },
    typeof job.experience === "number" && {
      icon: Calendar,
      label: "Experience",
      value: `${job.experience}+ years`,
    },
    job.location && { icon: MapPin, label: "Location", value: job.location },
    job.type && { icon: Briefcase, label: "Work Type", value: job.type, capitalize: true },
    job.hiringDeadline && { icon: Clock, label: "Apply By", value: formatDate(job.hiringDeadline) },
  ].filter(Boolean);

  const ApplyCard = (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      {application ? (
        <>
          <div className="text-sm font-semibold text-gray-900 mb-3">Application Status</div>
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${
                STATUS_COLORS[application.status] || "bg-blue-100 text-blue-700"
              }`}
            >
              <CheckCircle2 size={15} />
              {application.status}
            </span>
          </div>
          {application.appliedAt && (
            <p className="text-xs text-gray-500 mb-4">Applied on {formatDate(application.appliedAt)}</p>
          )}
          <button
            onClick={handleDownloadPrep}
            disabled={prepLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-wait text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {prepLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Preparing your guide…
              </>
            ) : (
              <>
                <Download size={16} />
                Download prep document
              </>
            )}
          </button>
          <p className="mt-2 mb-4 text-[11px] text-gray-400 text-center">
            Your personalised ZepPrep interview guide (PDF)
          </p>
          <button
            onClick={() => navigate("/candidate/applied")}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            View all applications
          </button>
        </>
      ) : (
        <>
          <div className="text-lg font-bold text-gray-900 mb-1">Ready to apply?</div>
          <p className="text-sm text-gray-500 mb-4">
            Submit your resume and we'll keep you posted on your application status.
          </p>
          <button
            onClick={() => setShowUpload(true)}
            disabled={job.isClosed}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {job.isClosed ? "Applications Closed" : "Apply Now"}
          </button>
          <p className="mt-3 text-xs text-gray-400 text-center">PDF or DOCX · takes under a minute</p>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <button
            onClick={() => navigate("/candidate/applied")}
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Applied Jobs
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <div className="p-5 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white items-center justify-center text-xl font-bold">
                {(job.company || job.jobtitle || "J").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold tracking-wider text-blue-600 mb-1">
                  JOB DETAILS
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words leading-tight">
                  {job.jobtitle}
                </h1>
                {job.company && (
                  <div className="mt-1 text-sm font-medium text-gray-600">{job.company}</div>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {job.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs sm:text-sm font-medium text-gray-700">
                      <MapPin size={15} className="text-gray-500" />
                      {job.location}
                    </span>
                  )}
                  {job.type && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs sm:text-sm font-medium text-gray-700 capitalize">
                      <Briefcase size={15} className="text-gray-500" />
                      {job.type}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs sm:text-sm font-medium text-gray-700">
                      <Clock size={15} className="text-gray-500" />
                      {job.employmentType}
                    </span>
                  )}
                  {typeof job.experience === "number" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs sm:text-sm font-medium text-gray-700">
                      <Calendar size={15} className="text-gray-500" />
                      {job.experience}+ yrs
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main column */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
            {job.description && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Job Description</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
                  {job.description}
                </p>
              </section>
            )}

            {job.keyResponsibilities?.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks size={18} className="text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Key Responsibilities</h2>
                </div>
                <ul className="space-y-2.5">
                  {job.keyResponsibilities.map((r, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 text-[15px]">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.skills?.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {job.preferredQualifications?.length > 0 && (
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={18} className="text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Preferred Qualifications</h2>
                </div>
                <ul className="space-y-2.5">
                  {job.preferredQualifications.map((q, i) => (
                    <li key={i} className="flex gap-3 text-gray-700 text-[15px]">
                      <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-20 space-y-6">
              {ApplyCard}

              {facts.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
                  <div className="text-sm font-semibold text-gray-900 mb-4">Job Overview</div>
                  <div className="space-y-4">
                    {facts.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Icon size={17} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs text-gray-500">{f.label}</div>
                            <div
                              className={`text-sm font-medium text-gray-900 break-words ${
                                f.capitalize ? "capitalize" : ""
                              }`}
                            >
                              {f.value}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Upload modal */}
      {showUpload && !application && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Submit your resume</h2>
              <button
                onClick={() => !submitting && setShowUpload(false)}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <div
                {...getRootProps()}
                className={`w-full min-h-[220px] border-2 border-dashed rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center transition-colors ${
                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                } ${submitting ? "cursor-wait" : ""}`}
              >
                <input {...getInputProps()} />
                {submitting ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-base font-semibold text-gray-800 mt-3">Processing…</p>
                    <p className="text-sm text-gray-500 mt-1">{submitMsg}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                      <UploadCloud className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="text-base sm:text-lg font-semibold text-gray-800">
                      Drag &amp; drop your resume here
                    </p>
                    <p className="text-sm text-gray-500 mt-1">or</p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-md transition-colors"
                      style={{ paddingLeft: 28, paddingRight: 28, paddingTop: 12, paddingBottom: 12 }}
                    >
                      <UploadCloud size={17} />
                      Browse Files
                    </button>
                    <p className="mt-3 text-xs text-gray-400">PDF or DOCX · max 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobDetail;
