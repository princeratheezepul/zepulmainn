import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin,
    Briefcase,
    Calendar,
    IndianRupee,
    ArrowLeft,
    CalendarDays,
    Building2
} from 'lucide-react';
import CareerResumeUpload from '../Components/careers/CareerResumeUpload';

const CareerJobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResumeUpload, setShowResumeUpload] = useState(false);


    useEffect(() => {
        const loadJobDetails = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/marketplace/public/jobs/${jobId}`);

                if (!response.ok) {
                    throw new Error('Failed to load job details');
                }

                const data = await response.json();
                setJob(data.data.job);
            } catch (error) {
                setError('Failed to load job details');
                console.error('Error loading job details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (jobId) {
            loadJobDetails();
        }
    }, [jobId]);

    const formatDate = (date) => {
        if (!date) return 'Not specified';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const getCompanyAvatarColor = (companyName) => {
        const colors = [
            'bg-blue-600',
            'bg-green-600',
            'bg-purple-600',
            'bg-red-600',
            'bg-indigo-600',
            'bg-pink-600',
            'bg-teal-600',
            'bg-orange-600'
        ];
        const index = companyName ? companyName.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-red-600 mb-4 text-xl">Error loading job details</div>
                    <div className="text-gray-500 mb-4">{error || 'Job not found'}</div>
                    <button
                        onClick={() => navigate('/careers')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Careers
                    </button>
                </div>
            </div>
        );
    }

    // Show resume upload component if upload is active
    if (showResumeUpload) {
        return <CareerResumeUpload onBack={() => setShowResumeUpload(false)} jobDetails={job} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/careers')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Back to All Jobs</span>
                    </button>
                </div>

                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
                    <div className="mb-4">
                        <div className="text-xs text-blue-600 font-semibold mb-2">JOB DETAILS</div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
                    </div>

                    {/* Job Meta Information */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <div className={`w-8 h-8 ${getCompanyAvatarColor(job.company)} text-white rounded-full flex items-center justify-center text-sm font-semibold`}>
                                {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                            </div>
                            {job.company}
                        </span>
                        <span className="h-5 w-px bg-gray-200 hidden md:inline-block"></span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            <MapPin size={16} className="text-gray-500" />
                            {job.location}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            <Briefcase size={16} className="text-gray-500" />
                            {job.type}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            <Calendar size={16} className="text-gray-500" />
                            {job.experience}
                        </span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            <IndianRupee size={16} className="text-gray-500" />
                            {job.salary}
                        </span>
                        <span className="h-5 w-px bg-gray-200 hidden md:inline-block"></span>
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                            <CalendarDays size={16} className="text-gray-500" />
                            Posted {formatDate(job.postedDate)}
                        </span>
                    </div>

                    {/* Apply Button */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowResumeUpload(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-base transition-colors"
                        >
                            Apply Now
                        </button>
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-lg text-base transition-colors">
                            Save Job
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    {/* Job Description */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                    </div>

                    {/* Required Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Job Type</div>
                                <div className="text-base font-medium text-gray-900">{job.type}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Experience Required</div>
                                <div className="text-base font-medium text-gray-900">{job.experience}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Salary Range</div>
                                <div className="text-base font-medium text-gray-900">{job.salary}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Location</div>
                                <div className="text-base font-medium text-gray-900">{job.location}</div>
                            </div>
                            {job.hiringDeadline && (
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Application Deadline</div>
                                    <div className="text-base font-medium text-gray-900">{formatDate(job.hiringDeadline)}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Apply Section */}
                    <div className="border-t border-gray-200 mt-8 pt-8">
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Apply?</h3>
                            <p className="text-gray-700 mb-4">
                                Join our team and be part of something amazing. Click the button below to submit your application.
                            </p>
                            <button
                                onClick={() => setShowResumeUpload(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg text-base transition-colors"
                            >
                                Apply for this Position
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerJobDetails;
