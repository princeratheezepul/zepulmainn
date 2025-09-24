import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Briefcase, Plus, CheckCircle, XCircle, HelpCircle, Circle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateScorecardPDF } from '../../../utils/pdfGenerator';
import AIInterviewQuestions from './AIInterviewQuestions';
import InterviewTranscript from './InterviewTranscript';
import MarketplaceAIInterviewQuestions from '../../marketplace/MarketplaceAIInterviewQuestions';

// Circular progress bar component - Fixed with proper circle rendering
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
        {/* Background circle - full ring */}
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
        {/* Progress circle - blue section */}
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
        <span 
          className="font-bold text-gray-900" 
          style={{ 
            fontSize: '32px', 
            lineHeight: '1',
            textAlign: 'center'
          }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

const ResumeDetailsView = ({ resumeData, onBack, onResumeUpdate, isMarketplace = false, marketplaceJobDetails = null }) => {
  const navigate = useNavigate();
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Guard: If no _id, show error and redirect
  useEffect(() => {
    if (!resumeData || !resumeData._id) {
      // Redirect to job details after a short delay
      const timeout = setTimeout(() => {
        navigate(-1); // Go back one page
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [resumeData, navigate]);
  
  if (!resumeData || !resumeData._id) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: No resume ID found. Redirecting to job details...
      </div>
    );
  }

  // Use jobId from resumeData instead of separate jobDetails prop
  const jobDetails = resumeData.jobId || {};

  const [showInterviewQuestions, setShowInterviewQuestions] = useState(false);
  const [referredToManager, setReferredToManager] = useState(resumeData.referredToManager || false);
  const [note, setNote] = useState(resumeData.addedNotes || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [redFlagged, setRedFlagged] = useState(resumeData.redFlagged || false);
  const [redFlagLoading, setRedFlagLoading] = useState(false);

  // Helper to determine match label and color
  const getMatchLabel = (score) => {
    if (score >= 80) return { label: 'Strong Match', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { label: 'Good Match', color: 'text-green-500', bg: 'bg-green-50' };
    return { label: 'Less Match', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const match = getMatchLabel(resumeData.overallScore);

  // Helper functions for transcript confidence colors
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceIconColor = (confidence) => {
    switch (confidence) {
      case 'High':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleSaveNote = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      // Get the correct token from userInfo
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Always save to resume's addedNotes field (recruiter notes about this specific candidate)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ addedNotes: note })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }
      
      const result = await response.json();
      setSaveMsg('Note saved!');
      setTimeout(() => setSaveMsg(''), 1500);
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveMsg(`Failed to save note: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle PDF download using global utility
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await generateScorecardPDF(resumeData, note);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle red flag toggle
  const handleRedFlagToggle = async () => {
    setRedFlagLoading(true);
    try {
      const newRedFlagged = !redFlagged;
      
      // Determine the API endpoint based on whether it's marketplace or not
      const apiUrl = isMarketplace 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/${resumeData._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}`;
      
      // Get the appropriate token
      const token = isMarketplace 
        ? localStorage.getItem('marketplace_token')
        : JSON.parse(localStorage.getItem("userInfo"))?.data?.accessToken;
      
      console.log('Red flag toggle - isMarketplace:', isMarketplace);
      console.log('Red flag toggle - apiUrl:', apiUrl);
      console.log('Red flag toggle - token exists:', !!token);
      console.log('Red flag toggle - token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ redFlagged: newRedFlagged })
      });

      console.log('Red flag toggle - response status:', response.status);
      console.log('Red flag toggle - response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Red flag toggle - error data:', errorData);
        throw new Error(errorData.message || 'Failed to update red flag status');
      }

      const result = await response.json();
      console.log('Red flag toggle - success result:', result);

      setRedFlagged(newRedFlagged);
      toast.success(newRedFlagged ? 'Candidate marked as red flag' : 'Red flag removed from candidate');
    } catch (err) {
      console.error('Error toggling red flag:', err);
      toast.error(err.message || 'Failed to update red flag status');
    } finally {
      setRedFlagLoading(false);
    }
  };

  if (showInterviewQuestions) {
    if (isMarketplace) {
      return <MarketplaceAIInterviewQuestions onBack={() => setShowInterviewQuestions(false)} jobDetails={marketplaceJobDetails || resumeData.applicationDetails} resumeData={resumeData} onResumeUpdate={onResumeUpdate} />;
    } else {
      return <AIInterviewQuestions onBack={() => setShowInterviewQuestions(false)} jobDetails={resumeData.applicationDetails} resumeData={resumeData} onResumeUpdate={onResumeUpdate} />;
    }
  }

  // Get score for circular progress
  const score = resumeData.overallScore || resumeData.ats_score || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Action Buttons Header */}
        <div className="flex justify-end mb-2">
          <div className="flex gap-2">
            {resumeData.status !== 'screening' && (
              <button 
                onClick={() => setShowInterviewQuestions(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18}/>
                Add Answer
              </button>
            )}
            {resumeData.status === 'screening' && !referredToManager && (
              <button
                onClick={async () => {
                  try {
                    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                    const token = userInfo?.data?.accessToken;
                    if (!token) throw new Error('No authentication token found');
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ referredToManager: true })
                    });
                    if (!response.ok) throw new Error('Failed to refer to manager');
                    
                    // Update the state to trigger re-render
                    setReferredToManager(true);
                    
                    toast.success('Candidate referred to manager!');
                  } catch (err) {
                    toast.error(err.message || 'Failed to refer to manager');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                Refer to Manager
              </button>
            )}
            
            {/* Red Flag Button */}
            {redFlagged ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
                <span className="font-medium text-sm">Red Flag Candidate</span>
                <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRedFlagToggle}
                disabled={redFlagLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 ${
                  redFlagLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {redFlagLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                Add Red Flag
              </button>
            )}
            
            {/* Scorecard button for all candidates */}
            {/* <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
              type="button"
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              Scorecard
            </button> */}
            
            <button 
              onClick={onBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* This div acts as the "content" for the screen display - simpler layout */}
        <div className="bg-white p-4 md:p-8 rounded-lg w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${resumeData.name}`} alt={resumeData.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-200" />
              <div>
                <div className="text-3xl font-bold text-gray-900">{resumeData.name}</div>
                <p className="text-gray-600 text-lg">{resumeData.title}</p>
              </div>
            </div>
          </div>

          {/* Skills & Contact */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-y py-4 mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-2">
                {resumeData.skills && resumeData.skills.slice(0, 4).map(skill => <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
                {resumeData.skills && resumeData.skills.length > 4 && <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">+{resumeData.skills.length - 4}</span>}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2"><Mail size={16}/> {resumeData.email}</span>
                <span className="flex items-center gap-2"><Phone size={16}/> {resumeData.phone}</span>
                <span className="flex items-center gap-2"><Briefcase size={16}/> {resumeData.experience}</span>
                <span className="flex items-center gap-2"><MapPin size={16}/> {resumeData.location}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left & Middle Column */}
            <div className="col-span-1 lg:col-span-2 space-y-8">
                {/* AI Summary & Scorecard */}
                <div className="p-6 border rounded-xl bg-gray-50">
                    <div className="text-lg font-bold text-black mb-8">AI Resume Summary</div>
                    <div className="space-y-8">
                        {resumeData.aiSummary && Object.entries(resumeData.aiSummary).map(([key, value]) => (
                            <div key={key} className="flex gap-4 items-start">
                                <div className="bg-gray-200 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center mt-1">
                                    <HelpCircle size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 capitalize text-base mb-2">
                                        {key === 'skillMatch' ? 'Skill Match' : 
                                         key === 'competitiveFit' ? 'Competitive Fit & Market Prediction' : 
                                         key === 'consistencyCheck' ? 'Consistency Check' :
                                         key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <hr className="my-10 border-t border-gray-300" />
                    
                    <div className="text-lg font-bold text-black mb-8">AI Scorecard</div>
                    <div className="space-y-6">
                        {resumeData.aiScorecard && Object.entries(resumeData.aiScorecard).map(([key, value]) => (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-gray-800 capitalize font-semibold text-base">
                                        {key === 'technicalSkillMatch' ? 'Technical Skill Match' : 
                                         key === 'competitiveFit' ? 'Competitive Fit & Market Prediction' : 
                                         key === 'consistencyCheck' ? 'Consistency Check' :
                                         key === 'teamLeadership' ? 'Team Leadership' :
                                         key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <span className="font-bold text-gray-900 text-base">{value}%</span>
                                </div>
                                <div className="w-full bg-gray-300 rounded-full h-3">
                                    <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Details */}
                <div className="p-6 border rounded-xl bg-gray-50">
                    <div className="text-xl font-bold text-gray-800 mb-4">Application Details</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-600 mt-4">
                        <div><span className="font-semibold text-gray-800 block mb-1">Position Applied</span><p>{resumeData.applicationDetails?.position || 'N/A'}</p></div>
                        <div><span className="font-semibold text-gray-800 block mb-1">Application Date</span><p>{resumeData.applicationDetails?.date || 'N/A'}</p></div>
                        <div><span className="font-semibold text-gray-800 block mb-1">Notice Period</span><p>{resumeData.applicationDetails?.noticePeriod || 'N/A'}</p></div>
                        <div><span className="font-semibold text-gray-800 block mb-1">Application Source</span><p>{resumeData.applicationDetails?.source || 'Website'}</p></div>
                    </div>
                    <div className="mt-6">
                        <div className="font-semibold text-gray-800">About</div>
                        <p className="text-gray-600 mt-1">{resumeData.about || 'No additional information provided.'}</p>
                    </div>
                    <div className="mt-6">
                        <div className="font-semibold text-gray-800">Key Skills</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {resumeData.skills && resumeData.skills.map(skill => <span key={skill} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="col-span-1">
              <div className="rounded-2xl border p-4 shadow bg-gray-50 flex flex-col">
                {/* Match Label */}
                <div className={`w-full text-lg font-semibold mb-2 ${match.color}`}>{match.label}</div>
                <div className="text-base font-bold text-black mb-2">Overall Score</div>
                {/* Circular Progress */}
                <div className="relative my-2 flex justify-center">
                  <CircularProgress percentage={score} size={144} strokeWidth={12} />
                </div>
                {/* Recommendation */}
                <div className="w-full text-center bg-blue-100 text-blue-900 font-medium rounded-xl py-2 px-3 mb-4">{resumeData.recommendation || 'Consider with caution'}</div>
                {/* Key Strength */}
                <div className="w-full mb-4 rounded-xl p-4 bg-green-50">
                  <div className="font-semibold text-gray-800 mb-2">Key Strength</div>
                  <ul className="list-disc pl-5 text-gray-800">
                    {resumeData.keyStrength && resumeData.keyStrength.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                {/* Potential Concern */}
                <div className="w-full rounded-xl p-4 bg-red-50 mb-4">
                  <div className="font-semibold text-gray-800 mb-2">Potential Concern</div>
                  <ul className="list-disc pl-5 text-gray-800">
                    {resumeData.potentialConcern && resumeData.potentialConcern.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                {/* Added Notes */}
                <div className="w-full rounded-xl p-4 border border-gray-200">
                  <div className="font-semibold text-gray-800 mb-2">Added Notes</div>
                  <textarea
                    className="w-full border-gray-200 rounded-lg p-2 text-sm"
                    rows="4"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    disabled={saving}
                  ></textarea>
                  <button
                    className={`mt-2 w-full bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 flex items-center justify-center ${saving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={handleSaveNote}
                    disabled={saving}
                  >
                    {saving ? (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : null}
                    {saving ? 'Saving...' : 'Add Note'}
                  </button>
                  {saveMsg && <div className="text-green-600 text-sm mt-2 text-center">{saveMsg}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Interview Transcript - Show only if evaluation exists and has results */}
          {resumeData.interviewEvaluation && 
           resumeData.interviewEvaluation.evaluationResults && 
           resumeData.interviewEvaluation.evaluationResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="col-span-3">
                <InterviewTranscript interviewEvaluation={resumeData.interviewEvaluation} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDetailsView;