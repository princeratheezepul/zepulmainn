import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePDF, Resolution, Margin } from 'react-to-pdf';
import toast from 'react-hot-toast';
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { buildScorecardHTML } from '../../utils/scorecardHtml';

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const GenerateScorecard = () => {
  const [jobId, setJobId] = useState('');
  const [file, setFile] = useState(null);
  const [includeCoding, setIncludeCoding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Capture the rendered scorecard card and download it as a PDF. targetRef wraps
  // the inline-hex scorecard markup (buildScorecardHTML) — no Tailwind inside it,
  // so html2canvas renders it faithfully and the PDF matches the card on screen.
  const { toPDF, targetRef } = usePDF({
    filename: `${(result?.scorecard?.name || 'candidate').replace(/\s+/g, '_')}_Scorecard.pdf`,
    resolution: Resolution.HIGH,
    page: { format: 'A4', orientation: 'portrait', margin: Margin.SMALL },
  });

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF…', { id: 'scorecard-pdf' });
      await toPDF();
      toast.success('Scorecard downloaded', { id: 'scorecard-pdf' });
    } catch (err) {
      toast.error(`Failed to generate PDF: ${err.message}`, { id: 'scorecard-pdf' });
    }
  };

  const pickFile = (selected) => {
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) {
      toast.error('Please upload a PDF or DOCX resume');
      return;
    }
    setFile(selected);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) return toast.error('Please upload a resume');
    if (!OBJECT_ID_RE.test(jobId.trim())) return toast.error('Enter a valid 24-character job ObjectId');

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
    const token = userInfo?.data?.accessToken;
    if (!token) return toast.error('You are not logged in as an admin');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobId', jobId.trim());
    formData.append('includeCoding', String(includeCoding));

    setLoading(true);
    try {
      // No Content-Type header — the browser sets the multipart boundary itself.
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/generate-scorecard`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate scorecard');
      }

      setResult(data);
      toast.success('Scorecard generated and submitted to the job');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setFile(null);
    setJobId('');
    setIncludeCoding(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Generate Scorecard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload a resume and give a job ID. The full scorecard is generated from the job description and
            resume, then submitted to that job. Nothing is sent to the candidate — no coding test or interview
            link is created.
          </p>
        </div>

        {!result && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Job ID */}
            <label className="mb-2 block text-sm font-semibold text-gray-800">Job ObjectId</label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="e.g. 6a27e5798f18de67d989744b"
              disabled={loading}
              className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <p className="mb-5 text-xs text-gray-400">
              The 24-character MongoDB id of the job this candidate is being submitted to.
            </p>

            {/* Resume upload */}
            <label className="mb-2 block text-sm font-semibold text-gray-800">Resume</label>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!loading) pickFile(e.dataTransfer.files?.[0]);
              }}
              className={`mb-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
                file ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'
              } ${loading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                disabled={loading}
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <FileText className="mb-2 text-green-600" size={22} />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="mt-0.5 text-xs text-gray-500">Click to choose a different file</span>
                </>
              ) : (
                <>
                  <Upload className="mb-2 text-gray-400" size={22} />
                  <span className="text-sm font-medium text-gray-700">Drop a resume here, or click to browse</span>
                  <span className="mt-0.5 text-xs text-gray-400">PDF or DOCX</span>
                </>
              )}
            </label>

            {/* Coding toggle */}
            <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                type="checkbox"
                checked={includeCoding}
                disabled={loading}
                onChange={(e) => setIncludeCoding(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-800">Include coding assessment section</span>
                <span className="mt-0.5 block text-xs text-gray-500">
                  Ticked: a complete scorecard with both coding and interview sections. Unticked: an
                  interview-only scorecard (use this for non-engineering roles such as DevOps leadership or
                  product).
                </span>
              </span>
            </label>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating scorecard… this can take a minute
                </>
              ) : (
                'Generate & submit scorecard'
              )}
            </button>
            {loading && (
              <p className="mt-3 text-center text-xs text-gray-400">
                Reading the resume, scoring it against the job description, and writing the
                {includeCoding ? ' coding and interview' : ' interview'} evaluation.
              </p>
            )}
          </form>
        )}

        {/* Result */}
        {result && (
          <div>
            <div className="mb-4 flex items-center gap-2 text-green-700">
              <CheckCircle2 size={20} />
              <span className="font-semibold">Scorecard generated and submitted to {result.scorecard.jobTitle}</span>
            </div>

            {/* Actions (kept OUTSIDE the capture target so they never appear in the PDF) */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleDownloadPDF}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Download size={16} />
                Download scorecard PDF
              </button>
              <Link
                to={`/admin/candidates/${result.resumeId}`}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Open in dashboard
              </Link>
              <button
                onClick={reset}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Generate another
              </button>
            </div>

            <p className="mb-4 font-mono text-[11px] text-gray-400">
              resumeId: {result.resumeId} &nbsp;·&nbsp; rawTextId: {result.rawTextId}
            </p>

            {/* Live preview — this exact node is what gets captured into the PDF. */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-4">
              <div
                ref={targetRef}
                style={{ background: '#ffffff' }}
                dangerouslySetInnerHTML={{ __html: buildScorecardHTML(result.fullResume) }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateScorecard;
