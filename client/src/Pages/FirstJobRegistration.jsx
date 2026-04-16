import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DescribeJob from "../Pages/DescribeJob";
import JobChatAgent from "../Pages/JobChatAgent";

export default function FirstJobRegistration() {
    const navigate = useNavigate();
    const [showVoiceAgent, setShowVoiceAgent] = useState(false);
    const [showChatAgent, setShowChatAgent] = useState(false);

    if (showVoiceAgent) {
        // Render the DescribeJob component directly within this route
        return <DescribeJob />;
    }

    if (showChatAgent) {
        // Render the JobChatAgent component directly within this route
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <JobChatAgent />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
            <div className="max-w-xl w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100">

                {/* Confetti or simple icon could go here */}
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Great! Let's register your first Job
                </h2>
                <p className="text-gray-500 mb-10 text-lg">
                    Choose how you would like to create your first job posting. Our AI agents are ready to assist you.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => setShowChatAgent(true)}
                        className="flex-1 py-4 px-6 bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md text-gray-800 rounded-xl font-medium transition-all flex flex-col items-center gap-2 group"
                    >
                        <svg className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                        </svg>
                        <span>Via Chat Agent</span>
                    </button>

                    <button
                        onClick={() => setShowVoiceAgent(true)}
                        className="flex-1 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-200 transition-all flex flex-col items-center gap-2 group hover:-translate-y-1"
                    >
                        <svg className="w-6 h-6 text-blue-100 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                        </svg>
                        <span>Via Voice Agent</span>
                    </button>
                </div>

                <div className="mt-8 text-sm">
                    <button
                        onClick={() => navigate("/manager")}
                        className="text-gray-400 hover:text-gray-600 underline underline-offset-2"
                    >
                        Skip for now, take me to dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
