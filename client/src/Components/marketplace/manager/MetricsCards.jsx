import React, { useState, useEffect } from 'react';

const MetricsCards = () => {
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    selectedCandidates: 0,
    rejectedCandidates: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        setError('No authentication token found');
        return;
      }

      // Fetch companies data to calculate selected and rejected candidates
      const companiesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-companies`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        console.log('MetricsCards - Companies API response:', companiesData);
        
        if (companiesData.success && companiesData.companies) {
          // Calculate totals from all companies
          const totalSelectedCandidates = companiesData.companies.reduce((sum, company) => {
            return sum + (company.selectedCandidatesCount || 0);
          }, 0);
          
          const totalRejectedCandidates = companiesData.companies.reduce((sum, company) => {
            return sum + (company.rejectedCandidatesCount || 0);
          }, 0);
          
          console.log('Calculated totals:', { totalSelectedCandidates, totalRejectedCandidates });
          
          // Set metrics with calculated values
          setMetrics({
            totalJobs: companiesData.companies.length, // Total number of companies
            activeJobs: companiesData.companies.filter(company => company.isActive).length, // Active companies
            selectedCandidates: totalSelectedCandidates,
            rejectedCandidates: totalRejectedCandidates
          });
        } else {
          setError('Failed to fetch companies data');
        }
      } else {
        setError('Failed to fetch companies data');
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const metricsData = [
    {
      title: 'Jobs',
      value: loading ? '...' : formatNumber(metrics.totalJobs),
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    {
      title: 'Active Jobs',
      value: loading ? '...' : formatNumber(metrics.activeJobs),
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    {
      title: 'Selected Candidates',
      value: loading ? '...' : formatNumber(metrics.selectedCandidates),
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: 'Rejected Candidates',
      value: loading ? '...' : formatNumber(metrics.rejectedCandidates),
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    }
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-700 font-medium text-sm">{metric.title}</div>
            <div className="w-6 h-6 flex items-center justify-center">
              {metric.icon}
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
