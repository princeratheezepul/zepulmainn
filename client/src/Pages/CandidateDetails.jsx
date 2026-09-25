import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { config } from "../config/config";
import { extractResumeText } from "../utils/resumeText";

export default function CandidateDetails() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // The resume is read in the browser and sent as text, so it lands on the
  // profile in the same shape every later upload uses.
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [readingResume, setReadingResume] = useState(false);

  const candidate = (() => {
    try {
      return JSON.parse(localStorage.getItem("candidateInfo")) || null;
    } catch {
      return null;
    }
  })();

  // If there's no candidate session, send them back to signup
  useEffect(() => {
    if (!candidate?._id) {
      navigate("/candidate/signup", { replace: true });
    }
  }, [candidate, navigate]);

  const handleResume = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again after a failure
    if (!file) return;

    setReadingResume(true);
    setResumeError("");
    try {
      const text = await extractResumeText(file);
      setResumeText(text);
      setResumeFile(file);
    } catch (err) {
      setResumeText("");
      setResumeFile(null);
      setResumeError(err.message || "Could not read that file.");
    } finally {
      setReadingResume(false);
    }
  };

  const clearResume = () => {
    setResumeFile(null);
    setResumeText("");
    setResumeError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!candidate?._id) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${config.backendUrl}/api/candidate/${candidate._id}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            phoneNumber,
            address,
            ...(resumeText ? { resumeText, resumeFileName: resumeFile?.name || "" } : {}),
          }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not save details");
      }

      localStorage.setItem("candidateInfo", JSON.stringify(data.data?.user || candidate));
      toast.success(
        data.data?.resumeSaved
          ? "Profile and resume saved!"
          : "Profile saved! You can add your resume from your profile."
      );
      setTimeout(() => navigate("/candidate/dashboard", { replace: true }), 700);
    } catch (error) {
      toast.error(error.message || "Could not save details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <Toaster position="top-center" />
      {/* Left illustration */}
      <div className="hidden md:flex flex-col justify-center items-center md:w-1/2 bg-gray-50 relative p-4">
        <img
          src="/Mobile login-cuate 1(1).png"
          alt="Illustration"
          className="w-full max-w-2xl md:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mb-8 object-contain"
        />
      </div>
      {/* Right details form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 min-h-screen px-4 py-8 md:py-0">
        <div className="w-full max-w-xl p-0 md:p-0 rounded-xl">
          <h2 className="text-3xl font-semibold mb-2">Complete your profile</h2>
          <p className="text-gray-500 mb-8 text-sm">Tell us a little more about you.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows={3}
                placeholder="Enter your address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
              />
            </div>
            <div>
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                Resume
              </label>
              <p className="text-xs text-gray-500 mb-2">
                We&rsquo;ll keep this on your profile, so applying to a Zepul job is one click &mdash;
                no re-uploading. You can replace it any time.
              </p>

              {resumeFile ? (
                <div className="flex items-center justify-between gap-3 border border-green-200 bg-green-50 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-green-900 truncate">{resumeFile.name}</div>
                    <div className="text-xs text-green-700">Ready to save with your profile</div>
                  </div>
                  <button
                    type="button"
                    onClick={clearResume}
                    className="shrink-0 text-xs font-medium text-green-800 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="resume"
                  className={`flex items-center justify-center gap-2 w-full border border-dashed rounded-lg px-3 py-4 text-sm transition-colors ${
                    readingResume
                      ? "border-gray-300 bg-gray-50 text-gray-500 cursor-wait"
                      : "border-gray-300 bg-gray-50 text-gray-600 hover:border-blue-400 hover:text-blue-600 cursor-pointer"
                  }`}
                >
                  {readingResume ? "Reading your resume…" : "Choose a PDF, DOCX or TXT file"}
                </label>
              )}

              <input
                id="resume"
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleResume}
                disabled={readingResume}
                className="hidden"
              />

              {resumeError && <p className="mt-2 text-xs text-red-600">{resumeError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || readingResume}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium flex items-center justify-center transition-colors text-base"
            >
              {isLoading ? "Saving..." : "Continue to Dashboard"}
            </button>

            {!resumeFile && !readingResume && (
              <p className="text-xs text-gray-400 text-center">
                No resume handy? Continue without one and add it from your profile later.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
