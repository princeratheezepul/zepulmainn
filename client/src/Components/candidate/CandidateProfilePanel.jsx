import React, { useEffect, useRef, useState } from "react";
import { X, FileText, Upload, Loader2, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import { getApiUrl } from "../../config/config";
import { extractResumeText } from "../../utils/resumeText";

const Section = ({ title, children }) => (
  <div className="mb-5">
    <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{title}</div>
    {children}
  </div>
);

const Pill = ({ children }) => (
  <span className="inline-block text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
    {children}
  </span>
);

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

/**
 * The candidate's own profile: who we have them as, the resume mapped to them,
 * and the upload that replaces it. Opened from the dashboard's top-right.
 */
export default function CandidateProfilePanel({ candidate, open, onClose, onResumeUpdated }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [showFullText, setShowFullText] = useState(false);
  const fileRef = useRef(null);

  const token = localStorage.getItem("candidateToken");

  useEffect(() => {
    if (!open || !candidate?._id) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/candidate/${candidate._id}/resume`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setResume(res.ok ? data.data?.resume || null : null);
      } catch {
        if (active) setResume(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [open, candidate?._id, token]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again after a failure
    if (!file || !candidate?._id) return;

    setUploading(true);
    try {
      setUploadMsg("Reading your resume…");
      const text = await extractResumeText(file);

      setUploadMsg("Saving and reading the details…");
      const res = await fetch(getApiUrl(`/api/candidate/${candidate._id}/resume`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, fileName: file.name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update resume");

      setResume(data.data?.resume || null);
      setShowFullText(false);
      onResumeUpdated?.(data.data?.resume || null);
      toast.success(data.message || "Resume updated");
    } catch (err) {
      toast.error(err.message || "Failed to update resume");
    } finally {
      setUploading(false);
      setUploadMsg("");
    }
  };

  if (!open) return null;

  const parsed = resume?.parsed || null;
  const experience = Array.isArray(parsed?.experience) ? parsed.experience : [];
  const education = Array.isArray(parsed?.education) ? parsed.education : [];
  const projects = Array.isArray(parsed?.projects) ? parsed.projects : [];
  const skills = Array.isArray(parsed?.skills) ? parsed.skills.filter(Boolean) : [];
  const certifications = Array.isArray(parsed?.certifications) ? parsed.certifications.filter(Boolean) : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Your profile"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-200">
          <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-bold flex-shrink-0">
            {(candidate?.fullName || candidate?.email || "C").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 truncate">
              {candidate?.fullName || "Your profile"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {parsed?.title || "Candidate"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
            aria-label="Close profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Section title="Contact">
            <div className="space-y-1.5 text-sm text-gray-700">
              {candidate?.email && (
                <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" />{candidate.email}</div>
              )}
              {(candidate?.phoneNumber || parsed?.phone) && (
                <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" />{candidate.phoneNumber || parsed.phone}</div>
              )}
              {(candidate?.address || parsed?.location) && (
                <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" />{candidate.address || parsed.location}</div>
              )}
              {parsed?.experienceYears > 0 && (
                <div className="flex items-center gap-2"><Briefcase size={14} className="text-gray-400" />{parsed.experienceYears} years experience</div>
              )}
            </div>
          </Section>

          {/* Resume */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-sm font-bold text-gray-900">Your Resume</div>
                {resume?.updatedAt && (
                  <div className="text-xs text-gray-500">
                    {resume.fileName ? `${resume.fileName} · ` : ""}updated {formatDate(resume.updatedAt)}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                  uploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                }`}
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {resume ? "Update Resume" : "Upload Resume"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {uploading && <div className="text-xs text-blue-600 mb-3">{uploadMsg}</div>}

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            ) : !resume ? (
              <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-gray-800 mb-1">No resume yet</div>
                <p className="text-xs text-gray-500">
                  Upload a PDF, DOCX or TXT and we'll keep it on your profile.
                </p>
              </div>
            ) : (
              <div>
                {parsed?.about && (
                  <Section title="Summary">
                    <p className="text-sm text-gray-700 leading-relaxed">{parsed.about}</p>
                  </Section>
                )}

                {skills.length > 0 && (
                  <Section title="Skills">
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => <Pill key={s}>{s}</Pill>)}
                    </div>
                  </Section>
                )}

                {experience.length > 0 && (
                  <Section title="Experience">
                    <div className="space-y-3">
                      {experience.map((role, i) => (
                        <div key={`${role.company}-${i}`} className="border-l-2 border-blue-100 pl-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {role.title}{role.company ? ` · ${role.company}` : ""}
                          </div>
                          {role.duration && <div className="text-xs text-gray-500 mb-1">{role.duration}</div>}
                          {Array.isArray(role.points) && role.points.length > 0 && (
                            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-0.5">
                              {role.points.filter(Boolean).map((p, j) => <li key={j}>{p}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {education.length > 0 && (
                  <Section title="Education">
                    <div className="space-y-1.5">
                      {education.map((ed, i) => (
                        <div key={`${ed.institution}-${i}`} className="text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">{ed.degree}</span>
                          {ed.institution ? ` — ${ed.institution}` : ""}
                          {ed.year ? ` (${ed.year})` : ""}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {projects.length > 0 && (
                  <Section title="Projects">
                    <div className="space-y-2">
                      {projects.map((pr, i) => (
                        <div key={`${pr.title}-${i}`}>
                          <div className="text-sm font-semibold text-gray-900">{pr.title}</div>
                          {Array.isArray(pr.points) && pr.points.length > 0 && (
                            <ul className="list-disc pl-4 text-xs text-gray-600 space-y-0.5">
                              {pr.points.filter(Boolean).map((p, j) => <li key={j}>{p}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {certifications.length > 0 && (
                  <Section title="Certifications">
                    <div className="flex flex-wrap gap-1.5">
                      {certifications.map((c) => <Pill key={c}>{c}</Pill>)}
                    </div>
                  </Section>
                )}

                {/* The resume text itself — always available, and the only thing
                    shown when the automatic read didn't produce a profile. */}
                {resume.text && (
                  <Section title="Resume Text">
                    {!parsed && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2">
                        We couldn't read the details automatically, so here's your resume as uploaded.
                      </p>
                    )}
                    <div
                      className={`text-xs text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-3 ${
                        showFullText ? "" : "max-h-40 overflow-hidden"
                      }`}
                    >
                      {resume.text}
                    </div>
                    <button
                      onClick={() => setShowFullText((v) => !v)}
                      className="text-xs font-medium text-blue-600 hover:underline mt-2 cursor-pointer"
                    >
                      {showFullText ? "Show less" : "Show full resume"}
                    </button>
                  </Section>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
