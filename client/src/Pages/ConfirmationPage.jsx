import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2, User, Briefcase, MapPin, Calendar, DollarSign, Phone, Mail } from 'lucide-react';

const ConfirmationPage = () => {
  const { token } = useParams();
  const [state, setState] = useState('loading'); // loading | ready | submitting | done | error | expired
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitResult, setSubmitResult] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/confirm/${token}`);
        const json = await res.json();

        if (!res.ok) {
          if (res.status === 410) { setState('expired'); return; }
          setErrorMsg(json.message || 'Something went wrong.');
          setState('error');
          return;
        }

        if (json.status !== 'pending') {
          setSubmitResult({ status: json.status });
          setState('done');
          return;
        }

        setData(json);
        setState('ready');
      } catch {
        setErrorMsg('Failed to load confirmation details.');
        setState('error');
      }
    };
    fetchDetails();
  }, [token]);

  const handleResponse = async (response) => {
    setState('submitting');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/confirm/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.message || 'Failed to submit response.');
        setState('error');
        return;
      }

      setSubmitResult(json);
      setState('done');
    } catch {
      setErrorMsg('Failed to submit your response.');
      setState('error');
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading your confirmation...</p>
        </div>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md text-center">
          <Clock className="w-14 h-14 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Link Expired</h2>
          <p className="text-gray-500">This confirmation link has expired (valid for 24 hours). Please contact the recruitment team for assistance.</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md text-center">
          <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (state === 'done') {
    const accepted = submitResult?.status === 'accepted';
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-md text-center">
          {accepted
            ? <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            : <XCircle className="w-14 h-14 text-gray-400 mx-auto mb-4" />
          }
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {accepted ? 'Confirmed!' : 'Response Recorded'}
          </h2>
          <p className="text-gray-500">{submitResult?.message}</p>
        </div>
      </div>
    );
  }

  const { candidate, job } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Opportunity Confirmation</h1>
          <p className="text-gray-500 mt-2">Please review the details below and confirm your interest.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Your Profile</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
                <p className="text-gray-800 font-medium">{candidate.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Current Role</p>
                <p className="text-gray-800">{candidate.role || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Experience</p>
                <p className="text-gray-800">{candidate.experienceYears ? `${candidate.experienceYears} years` : '—'}</p>
              </div>
              {candidate.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-800 text-sm">{candidate.email}</p>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-800 text-sm">+{candidate.countryCode || '91'} {candidate.phone}</p>
                </div>
              )}
              {candidate.skills?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 8).map((s, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Job Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Position</p>
                <p className="text-gray-800 font-semibold text-lg">{job.title}</p>
              </div>
              {job.company && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Company</p>
                  <p className="text-gray-800">{job.company}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                {job.location && (
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                )}
                {job.type && (
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full capitalize">{job.type}</span>
                )}
                {job.employmentType && (
                  <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">{job.employmentType}</span>
                )}
              </div>
              {(job.salary?.min || job.salary?.max) && (
                <div className="flex items-center gap-1 text-gray-700 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  {job.salary.min && job.salary.max
                    ? `₹${job.salary.min.toLocaleString()} – ₹${job.salary.max.toLocaleString()}`
                    : job.salary.min ? `From ₹${job.salary.min.toLocaleString()}` : `Up to ₹${job.salary.max.toLocaleString()}`}
                </div>
              )}
              {job.experience && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Experience Required</p>
                  <p className="text-gray-800 text-sm">{job.experience} years</p>
                </div>
              )}
              {job.hiringDeadline && (
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Deadline: {new Date(job.hiringDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        {(job.description || job.keyResponsibilities?.length > 0 || job.preferredQualifications?.length > 0) && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Full Job Description</h2>
            {job.description && (
              <p className="text-gray-700 text-sm leading-relaxed mb-5 whitespace-pre-line">{job.description}</p>
            )}
            {job.keyResponsibilities?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold text-gray-700 mb-2">Key Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1">
                  {job.keyResponsibilities.map((r, i) => (
                    <li key={i} className="text-gray-600 text-sm">{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {job.preferredQualifications?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold text-gray-700 mb-2">Preferred Qualifications</h3>
                <ul className="list-disc list-inside space-y-1">
                  {job.preferredQualifications.map((q, i) => (
                    <li key={i} className="text-gray-600 text-sm">{q}</li>
                  ))}
                </ul>
              </div>
            )}
            {job.skills?.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-gray-700 font-medium mb-6 text-lg">
            Would you like to proceed with the <strong>{job.title}</strong> opportunity?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleResponse('yes')}
              disabled={state === 'submitting'}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {state === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Yes, I'm interested
            </button>
            <button
              onClick={() => handleResponse('no')}
              disabled={state === 'submitting'}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-10 py-3 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <XCircle className="w-5 h-5" />
              No, not right now
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">This link expires 24 hours after it was sent.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
