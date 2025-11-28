import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, Clock, Award, AlertTriangle, ChevronRight } from 'lucide-react';

const AssessmentResultView = ({ assessmentData }) => {
    // Handle both legacy (single) and new (multiple) data structures
    const submissions = assessmentData?.submissions || (assessmentData?.submission ? [assessmentData.submission] : []);
    const questions = assessmentData?.questions || (assessmentData?.question ? [assessmentData.question] : []);
    const evaluation = assessmentData?.evaluation;

    const [activeTab, setActiveTab] = useState(0);

    if (!submissions.length) return null;

    const isPass = evaluation?.pass;
    const currentSubmission = submissions.find(s => s.questionIndex === activeTab) || submissions[activeTab] || {};
    const currentQuestion = questions[activeTab] || {};

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header / Summary */}
            <div className={`p-6 border-b border-gray-200 ${isPass ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Assessment Result</h3>
                        <div className="flex items-center gap-2">
                            {isPass ? (
                                <span className="flex items-center gap-1 text-green-700 font-semibold">
                                    <CheckCircle size={18} /> Passed
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-700 font-semibold">
                                    <XCircle size={18} /> Needs Improvement
                                </span>
                            )}
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">Score: <span className="font-bold">{evaluation?.score}/100</span></span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Submitted</div>
                        <div className="font-medium text-gray-900">
                            {currentSubmission.submittedAt ? new Date(currentSubmission.submittedAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Tabs */}
            {questions.length > 1 && (
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {questions.map((q, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === idx
                                    ? 'border-blue-600 text-blue-600 bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Q{idx + 1}: {q.title || `Question ${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
                {/* Left: Code Submission */}
                <div className="border-r border-gray-200 flex flex-col">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-gray-700 flex justify-between items-center">
                        <span>Candidate Submission</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{currentSubmission.language || 'javascript'}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage={currentSubmission.language || 'javascript'}
                            value={currentSubmission.code || '// No code submitted'}
                            theme="light"
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                            }}
                        />
                    </div>
                </div>

                {/* Right: AI Feedback */}
                <div className="overflow-y-auto p-6 bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="text-blue-600" size={20} />
                        AI Evaluation Report
                    </h4>

                    <div className="space-y-6">
                        {/* Question Context */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-2">Problem: {currentQuestion.title}</h5>
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                {currentQuestion.description}
                            </p>
                        </div>

                        {/* Feedback */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-2">General Feedback</h5>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {evaluation?.feedback}
                            </p>
                        </div>

                        {/* Complexity */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Clock size={16} className="text-orange-500" />
                                Complexity Analysis
                            </h5>
                            <p className="text-gray-600 text-sm font-mono bg-gray-50 p-2 rounded border border-gray-100">
                                {evaluation?.complexityAnalysis}
                            </p>
                        </div>

                        {/* Improvements */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-yellow-500" />
                                Suggestions for Improvement
                            </h5>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {evaluation?.improvementSuggestions}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentResultView;
