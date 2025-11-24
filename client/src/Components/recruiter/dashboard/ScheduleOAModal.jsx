import React, { useState } from 'react';
import { X, Code } from 'lucide-react';
import toast from 'react-hot-toast';

const ScheduleOAModal = ({ isOpen, onClose, candidateEmail, candidateName, resumeId, onScheduled }) => {
    const [testId, setTestId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!testId.trim()) {
            toast.error('Please enter a Test ID');
            return;
        }

        setLoading(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const token = userInfo?.data?.accessToken;

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/hackerrank/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    testId: testId.trim(),
                    candidateEmail,
                    candidateName,
                    resumeId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to schedule OA');
            }

            toast.success('OA Scheduled successfully!');
            if (onScheduled) onScheduled();
            onClose();
        } catch (error) {
            console.error('Error scheduling OA:', error);
            toast.error(error.message || 'Failed to schedule OA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Code size={20} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-800">Schedule HackerRank OA</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
                        <div className="text-gray-900 font-medium">{candidateName}</div>
                        <div className="text-gray-500 text-sm">{candidateEmail}</div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="testId" className="block text-sm font-medium text-gray-700 mb-1">
                            HackerRank Test ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="testId"
                            value={testId}
                            onChange={(e) => setTestId(e.target.value)}
                            placeholder="e.g., 123456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter the Test ID from your HackerRank dashboard.</p>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Scheduling...
                                </>
                            ) : (
                                'Schedule OA'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleOAModal;
