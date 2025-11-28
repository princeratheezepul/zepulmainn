import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaBriefcase, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Careers = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchJobs = async (query = '', pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/marketplace/public/jobs?query=${encodeURIComponent(query)}&page=${pageNum}&limit=9`);

            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data = await response.json();
            setJobs(data.data.jobs);
            setTotalPages(data.data.pagination.totalPages);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching jobs:", err);
            setError('Failed to load jobs. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchJobs(searchQuery, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchJobs(searchQuery, newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* Search Bar */}
            <div className="flex justify-center mb-12">
                <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for jobs..."
                        className="w-full py-4 pl-6 pr-14 rounded-full border border-gray-200 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#024bff] text-white p-3 rounded-full hover:bg-blue-700 transition duration-300 shadow-md flex items-center justify-center"
                    >
                        <FaSearch className="h-5 w-5" />
                    </button>
                </form>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-black">Available Jobs</h1>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 py-10 bg-red-50 rounded-lg">
                    <p>{error}</p>
                    <button
                        onClick={() => fetchJobs(searchQuery, page)}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                        Try Again
                    </button>
                </div>
            ) : jobs.length === 0 ? (
                <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
                    <p className="text-xl">No jobs found matching your criteria.</p>
                </div>
            ) : (
                <>
                    {/* Job Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {jobs.map((job) => (
                            <div key={job._id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] flex-1 mr-2">
                                            {job.title}
                                        </h3>
                                        {job.companyLogo && (
                                            <img
                                                src={job.companyLogo}
                                                alt={job.company}
                                                className="w-10 h-10 object-contain rounded"
                                                onError={(e) => { e.target.style.display = 'none' }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex items-center text-gray-500 mb-2">
                                        <FaMapMarkerAlt className="mr-2 flex-shrink-0 text-blue-500" />
                                        <span className="text-sm line-clamp-1">{job.location}</span>
                                    </div>

                                    <div className="flex items-center text-gray-500 mb-2">
                                        <FaBriefcase className="mr-2 flex-shrink-0 text-blue-500" />
                                        <span className="text-sm">{job.experience}</span>
                                    </div>

                                    <div className="text-sm text-gray-500 mb-6 line-clamp-1">
                                        {job.company}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/careers/job/${job._id}`)}
                                    className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-md font-medium hover:bg-black transition duration-300"
                                >
                                    Apply Now
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-8">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-600 flex items-center">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className={`px-4 py-2 rounded ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Careers;
