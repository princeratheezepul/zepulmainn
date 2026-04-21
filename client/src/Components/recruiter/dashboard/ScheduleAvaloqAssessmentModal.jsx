import React, { useState } from 'react';
import { X, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { config } from '../../../config/config';

const ScheduleAvaloqAssessmentModal = ({ isOpen, onClose, candidateEmail, candidateName, resumeId, onScheduled }) => {
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.data?.accessToken;

            const backendUrl = config.backendUrl || 'https://zepul-fullstack.onrender.com';
            const response = await fetch(`${backendUrl}/api/assessment/generate-avaloq`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resumeId
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Server error (${response.status}): Unexpected response from server. Check Render deployment logs.`);
            }
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate Avaloq assessment');
            }

            setGeneratedLink(`${window.location.origin}/assessment/${data.assessmentId}`);
            toast.success('Avaloq Assessment generated successfully!');
            if (onScheduled) onScheduled();

        } catch (err) {
            console.error("Error generating Avaloq assessment:", err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        toast.success('Link copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Database className="text-amber-600" size={20} />
                        Schedule Avaloq Assessment
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-800">
                            <strong>Candidate:</strong> {candidateName}
                        </p>
                        <p className="text-sm text-amber-700">{candidateEmail}</p>
                    </div>

                    <p className="text-gray-600 text-sm">
                        This will generate a <strong>90-minute Avaloq Banking Assessment</strong> with 5-6 questions covering SQL/PL-SQL, banking scenarios, and debugging. The candidate will receive an email with a link to take the test.
                    </p>

                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1">
                        <p className="font-semibold text-gray-700">Assessment covers:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            <li>2-3 SQL coding questions (joins, aggregations, complex queries)</li>
                            <li>1-2 Banking scenario problems (transactions, balance validation)</li>
                            <li>1 Debugging question (faulty SQL/business logic)</li>
                            <li>Optional: 1 simple coding problem (Java/Python)</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="bg-red-50 p-3 rounded-lg flex items-start gap-2 text-red-700 text-sm">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {generatedLink ? (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-green-600 font-medium justify-center">
                                <CheckCircle size={20} />
                                Avaloq Assessment Ready!
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedLink}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-600 pr-20"
                                />
                                <button
                                    onClick={copyLink}
                                    className="absolute right-1 top-1 bottom-1 px-3 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                Share this link with the candidate manually if needed.
                            </p>
                        </div>
                    ) : (
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium mr-2 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        Generate & Invite
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheduleAvaloqAssessmentModal;
