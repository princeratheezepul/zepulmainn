import React, { useState, useEffect } from 'react';

// Default team performance data (used as fallback)
const defaultTeamPerformanceData = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    firstName: 'Tech',
    lastName: 'Corp',
    jobsAssigned: 15,
    submitted: 234,
    shortlisted: 12,
    status: 'Active'
  },
  {
    id: '2',
    name: 'Innovation Labs',
    firstName: 'Innovation',
    lastName: 'Labs',
    jobsAssigned: 12,
    submitted: 189,
    shortlisted: 8,
    status: 'Active'
  },
  {
    id: '3',
    name: 'Digital Ventures',
    firstName: 'Digital',
    lastName: 'Ventures',
    jobsAssigned: 18,
    submitted: 312,
    shortlisted: 15,
    status: 'Active'
  }
];

const stageLabels = [
  "Submitted",
  "Screened",
  "Shortlisted",
  "Hired",
];

const stageColors = [
  "#0057FF", // Submitted (blue)
  "#FF8A00", // Screened (orange)
  "#FFD233", // Shortlisted (yellow)
  "#f3f4f6",  // Hired (light gray)
];

// Default candidate pipeline data (used as fallback)
const defaultCandidatePipelineData = [
  { role: 'Software Engineer', stages: [35, 28, 15, 5] },
  { role: 'Product Manager', stages: [25, 20, 12, 4] },
  { role: 'UI/UX Designer', stages: [22, 18, 10, 3] },
  { role: 'Data Analyst', stages: [20, 16, 8, 2] }
];

const ArrowSegment = ({ value, color, isFirst, isLast, empty, index }) => {
  let shapeClass = "middle";
  if (isFirst) shapeClass = "first";
  else if (isLast) shapeClass = "last";
  
  let marginLeft = 0;
  if (isFirst) {
    marginLeft = 0;
  } else if (index === 1) {
    marginLeft = -12;
  } else if (index === 2) {
    marginLeft = -24;
  } else if (index === 3) {
    marginLeft = -36;
  } else if (index === 4) {
    marginLeft = -48;
  } else {
    marginLeft = -60;
  }
  
  return (
    <div
      className={`pipeline-segment ${shapeClass} ${empty ? 'empty' : ''} text-xs`}
      style={{ 
        background: empty ? undefined : color, 
        marginLeft: marginLeft, 
        minWidth: 'clamp(50px, 12vw, 80px)', 
        width: 'clamp(3rem, 12vw, 5rem)',
        fontSize: 'clamp(10px, 2vw, 12px)'
      }}
    >
      {value}
    </div>
  );
};

const TalentScoutDashboardView = ({ onBack }) => {
  // State for dynamic pipeline data
  const [candidatePipelineData, setCandidatePipelineData] = useState(defaultCandidatePipelineData);
  const [isLoadingPipeline, setIsLoadingPipeline] = useState(true);
  
  // State for dynamic scorecard data
  const [scorecardData, setScorecardData] = useState({
    total: 45,
    pending: 12,
    reviewed: 33
  });
  
  // State for dynamic team performance data
  const [teamPerformanceData, setTeamPerformanceData] = useState(defaultTeamPerformanceData);
  const [isLoadingTeamPerformance, setIsLoadingTeamPerformance] = useState(true);
  
  // Fetch candidate pipeline data
  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        setIsLoadingPipeline(true);
        const token = localStorage.getItem('marketplace_token');
        
        if (!token) {
          console.log('No marketplace token found');
          setIsLoadingPipeline(false);
          return;
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/candidate-pipeline`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch pipeline data');
        }
        
        const data = await response.json();
        console.log('Pipeline data fetched:', data);
        
        if (data.data && data.data.pipelineData && data.data.pipelineData.length > 0) {
          setCandidatePipelineData(data.data.pipelineData);
        }
        
        // Update scorecard data
        if (data.data && data.data.scorecardData) {
          console.log('Scorecard data fetched:', data.data.scorecardData);
          setScorecardData(data.data.scorecardData);
        }
      } catch (error) {
        console.error('Error fetching pipeline data:', error);
      } finally {
        setIsLoadingPipeline(false);
      }
    };
    
    fetchPipelineData();
  }, []);
  
  // Fetch team performance data
  useEffect(() => {
    const fetchTeamPerformanceData = async () => {
      try {
        setIsLoadingTeamPerformance(true);
        const token = localStorage.getItem('marketplace_token');
        
        if (!token) {
          console.log('No marketplace token found');
          setIsLoadingTeamPerformance(false);
          return;
        }
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/team-performance`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch team performance data');
        }
        
        const data = await response.json();
        console.log('Team performance data fetched:', data);
        
        if (data.data && data.data.teamPerformance) {
          setTeamPerformanceData(data.data.teamPerformance);
        }
      } catch (error) {
        console.error('Error fetching team performance data:', error);
      } finally {
        setIsLoadingTeamPerformance(false);
      }
    };
    
    fetchTeamPerformanceData();
  }, []);
  
  // Scorecard calculations
  const size = 280;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const totalScorecards = scorecardData.total;
  const pendingScorecards = scorecardData.pending;
  const reviewedScorecards = scorecardData.reviewed;
  
  const pendingPercentage = totalScorecards > 0 ? (pendingScorecards / totalScorecards) * 100 : 0;
  const reviewedPercentage = totalScorecards > 0 ? (reviewedScorecards / totalScorecards) * 100 : 0;
  
  const pendingLength = (pendingPercentage / 100) * circumference;
  const reviewedLength = (reviewedPercentage / 100) * circumference;
  
  const offsetPending = 0;
  const offsetReviewed = pendingLength;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="flex-1 h-screen overflow-y-auto">
        <main className="bg-white flex-1 p-4 md:p-6 pt-3 md:pt-4">
          <div className="flex flex-col space-y-2 md:space-y-3">
            {/* Header */}
            <div className="bg-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-600 font-semibold tracking-wide mb-1">DASHBOARD</div>
                  <div className="text-xl font-bold text-gray-900">Talent Scout Overview</div>
                </div>
                <div className="flex items-center">
                  <button 
                    onClick={onBack}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-200"
                    style={{
                      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      textShadow: '0 0 8px rgba(147, 197, 253, 0.8)'
                    }}
                  >
                    Lead Partner Dashboard
                  </button>
                </div>
              </div>
              <hr className="my-2 border-gray-200" />
            </div>
         
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
              {/* Candidate Pipeline */}
              <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4 mb-3">
                <div className="font-semibold text-gray-900 mb-3 text-xs md:text-sm">Candidate Pipeline</div>
                {isLoadingPipeline ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : candidatePipelineData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No picked jobs found. Pick some jobs to see candidate pipeline data.
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] table-fixed">
                        <thead>
                          <tr>
                            <th className="w-20 sm:w-24 md:w-32 text-left text-xs text-gray-500 font-medium pb-2"></th>
                            {stageLabels.map((label, idx) => {
                              let transformClass = '';
                              let widthClass = 'w-12 sm:w-16 md:w-20';
                              
                              if (label === 'Screened') {
                                transformClass = 'transform -translate-x-2 sm:-translate-x-3 md:-translate-x-4';
                              } else if (label === 'Shortlisted') {
                                transformClass = 'transform -translate-x-4 sm:-translate-x-6 md:-translate-x-8';
                              } else if (label === 'Hired') {
                                transformClass = 'transform -translate-x-6 sm:-translate-x-8 md:-translate-x-12';
                              }
                              
                              return (
                                <th key={label} className={`${widthClass} text-xs text-gray-500 font-medium pb-2 text-left ${transformClass}`}>
                                  {label}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {candidatePipelineData.map((item, idx) => (
                            <tr key={item.role} className="align-middle">
                              <td className="text-xs text-gray-700 font-medium py-1 pr-2">{item.role}</td>
                              {item.stages.map((val, i) => (
                                <td key={i} className="py-1 px-0.5">
                                  <ArrowSegment
                                    value={val !== null ? val : ""}
                                    color={stageColors[i]}
                                    isFirst={i === 0}
                                    isLast={i === item.stages.length - 1}
                                    empty={val === null}
                                    index={i}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Scorecard Review */}
              <div className="bg-[#F7F8FA] rounded-2xl shadow p-3 md:p-4 flex flex-col items-center w-full max-w-sm mx-auto">
                <div className="font-semibold text-gray-900 mb-3 text-sm md:text-base text-left w-full">Pending Scorecard Review</div>
                <div className="relative flex items-center justify-center mb-4">
                  <svg
                    width={size * 0.8}
                    height={size * 0.8}
                    viewBox={`0 0 ${size} ${size}`}
                    className="block"
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth={stroke}
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#0A1833"
                      strokeWidth={stroke}
                      strokeDasharray={`${pendingLength} ${circumference - pendingLength}`}
                      strokeDashoffset={-offsetPending}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth={stroke}
                      strokeDasharray={`${reviewedLength} ${circumference - reviewedLength}`}
                      strokeDashoffset={-offsetReviewed}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">{totalScorecards}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0A1833]"></div>
                      <span className="text-xs font-medium text-gray-700">Pending</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{pendingScorecards}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                      <span className="text-xs font-medium text-gray-700">Reviewed</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{reviewedScorecards}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="text-lg font-bold text-gray-900">Team Performance</div>
                <div className="text-sm text-gray-500 mt-1">Overview of team activities and results</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jobs Assigned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shortlisted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingTeamPerformance ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : teamPerformanceData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8">
                          <div className="text-center text-gray-500 text-sm">
                            No team members found.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      teamPerformanceData.map((member, index) => (
                        <tr key={member.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {member.firstName?.charAt(0) || member.name?.charAt(0) || '?'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.jobsAssigned}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.submitted}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{member.shortlisted}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .pipeline-segment {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          position: relative;
          color: white;
          font-weight: 600;
          text-align: center;
        }
        
        .pipeline-segment.first {
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%);
        }
        
        .pipeline-segment.middle {
          clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%);
        }
        
        .pipeline-segment.last {
          clip-path: polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%);
        }
        
        .pipeline-segment.empty {
          background: linear-gradient(135deg, #e5e7eb 25%, transparent 25%, transparent 50%, #e5e7eb 50%, #e5e7eb 75%, transparent 75%, transparent);
          background-size: 8px 8px;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default TalentScoutDashboardView;

