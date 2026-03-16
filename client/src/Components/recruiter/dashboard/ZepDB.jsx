import React, { useState } from 'react';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import ZepDBCandidateDetail from './ZepDBCandidateDetail';

// Custom CSS for hiding scrollbars
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Safari and Chrome */
  }
`;

const ZepDB = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const candidates = await fetchCandidates();

      setResults({
        query: prompt,
        candidates
      });
    } catch (err) {
      setError('Failed to process your query. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.data?.accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/zepdb/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.data.accessToken}`
        },
        body: JSON.stringify({
          query: prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch candidates');
      }

      const data = await response.json();
      return data.data.candidates || [];
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-blue-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleBackToResults = () => {
    setSelectedCandidate(null);
  };

  return (
    <>
      <style>{scrollbarHideStyles}</style>
      <div className="flex flex-col h-screen bg-gray-50 w-full">
        {!results ? (
          // Initial state with input
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">ZEPDB</h1>
              <p className="text-gray-600 text-base md:text-lg lg:text-xl px-4 max-w-3xl">
                Your AI-powered recruitment assistant. Search through resumes, filter candidates, and find the perfect match.
              </p>
            </div>

            {/* Input Area */}
            <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl px-4">
              <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Search resumes... (e.g., 'Full stack developer with 2 years experience')"
                    className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-xl px-4 py-3 md:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  />
                  {/* Send button */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <button
                      type="submit"
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={!prompt.trim() || loading}
                    >
                      <Send className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Example prompts */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-xs md:text-sm mb-3">Try asking:</p>
                <div className="flex flex-wrap justify-center gap-2 px-2">
                  <button
                    onClick={() => setPrompt("Full stack developer with 2+ years experience")}
                    className="text-xs bg-white text-gray-700 border border-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Full Stack Dev &gt; 2 years
                  </button>
                  <button
                    onClick={() => setPrompt("React developer with Node.js experience")}
                    className="text-xs bg-white text-gray-700 border border-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    React + Node.js developers
                  </button>
                  <button
                    onClick={() => setPrompt("Python developer with machine learning skills")}
                    className="text-xs bg-white text-gray-700 border border-gray-300 px-2 md:px-3 py-1 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Python ML developers
                  </button>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Searching resumes...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="mt-8 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        ) : selectedCandidate ? (
          // Candidate Detail View
          <ZepDBCandidateDetail
            candidate={selectedCandidate}
            onBack={handleBackToResults}
          />
        ) : (
          // Results state
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setResults(null)}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to ZepDB
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
                  <p className="text-gray-600 mt-1">
                    {results.candidates.length} result{results.candidates.length !== 1 ? 's' : ''} for: "{results.query}"
                  </p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-hidden p-6">
              {results.candidates.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or upload more resumes.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
                  {/* Table Container with Scroll */}
                  <div className="flex-1 overflow-auto p-6 pt-4 scrollbar-hide">
                    <div className="overflow-x-auto scrollbar-hide">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white z-10">
                          <tr className="border-b border-gray-200">
                            <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">CANDIDATE</th>
                            <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">ROLE</th>
                            <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">EXPERIENCE</th>
                            <th className="py-4 px-4 font-semibold text-gray-500 text-sm bg-white">TOP SKILLS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.candidates.map((candidate) => (
                            <tr
                              key={candidate.id}
                              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleCandidateClick(candidate)}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold mr-4 ${getAvatarColor(candidate.name)}`}>
                                    {getInitials(candidate.name)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-800">{candidate.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-gray-700 font-medium">{candidate.role}</span>
                              </td>
                              <td className="py-4 px-4 text-gray-600">
                                {candidate.experienceYears > 0 ? `${candidate.experienceYears} year${candidate.experienceYears !== 1 ? 's' : ''}` : 'N/A'}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {(candidate.skills || []).slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                  {candidate.skills && candidate.skills.length > 3 && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                                      +{candidate.skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ZepDB;
