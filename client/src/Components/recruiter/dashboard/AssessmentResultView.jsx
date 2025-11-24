import React from 'react';
import Editor from '@monaco-editor/react';
import { CheckCircle, XCircle, Clock, Award, AlertTriangle } from 'lucide-react';

const AssessmentResultView = ({ assessmentData }) => {
    if (!assessmentData || !assessmentData.submission) return null;

    const { question, submission, evaluation } = assessmentData;
    const isPass = evaluation?.pass;

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
                            {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
                {/* Left: Code Submission */}
                <div className="border-r border-gray-200 flex flex-col">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-gray-700 flex justify-between items-center">
                        <span>Candidate Submission</span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{submission.language}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage={submission.language || 'javascript'}
                            value={submission.code}
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
                        {/* Feedback */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h5 className="font-semibold text-gray-800 mb-2">General Feedback</h5>
                            <p className="text-gray-600 text-sm leading-relaxed">
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
