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
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6664 45.8333H33.3331C41.7081 45.8333 43.2081 42.4792 43.6456 38.3958L45.2081 21.7292C45.7706 16.6458 44.3122 12.5 35.4164 12.5H14.5831C5.68722 12.5 4.22889 16.6458 4.79139 21.7292L6.35389 38.3958C6.79139 42.4792 8.29139 45.8333 16.6664 45.8333Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.667 12.5001V10.8334C16.667 7.14591 16.667 4.16675 23.3337 4.16675H26.667C33.3337 4.16675 33.3337 7.14591 33.3337 10.8334V12.5001" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M29.1663 27.0833V29.1667C29.1663 29.1875 29.1663 29.1875 29.1663 29.2083C29.1663 31.4792 29.1455 33.3333 24.9997 33.3333C20.8747 33.3333 20.833 31.5 20.833 29.2292V27.0833C20.833 25 20.833 25 22.9163 25H27.083C29.1663 25 29.1663 25 29.1663 27.0833Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M45.1045 22.9167C40.292 26.4167 34.792 28.5001 29.167 29.2084" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5.45801 23.4792C10.1455 26.6876 15.4372 28.6251 20.833 29.2292" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Active Jobs',
      value: loading ? '...' : formatNumber(metrics.activeJobs),
      icon: (
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.6664 45.8333H33.3331C41.7081 45.8333 43.2081 42.4792 43.6456 38.3958L45.2081 21.7292C45.7706 16.6458 44.3122 12.5 35.4164 12.5H14.5831C5.68722 12.5 4.22889 16.6458 4.79139 21.7292L6.35389 38.3958C6.79139 42.4792 8.29139 45.8333 16.6664 45.8333Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16.667 12.5001V10.8334C16.667 7.14591 16.667 4.16675 23.3337 4.16675H26.667C33.3337 4.16675 33.3337 7.14591 33.3337 10.8334V12.5001" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M29.1663 27.0833V29.1667C29.1663 29.1875 29.1663 29.1875 29.1663 29.2083C29.1663 31.4792 29.1455 33.3333 24.9997 33.3333C20.8747 33.3333 20.833 31.5 20.833 29.2292V27.0833C20.833 25 20.833 25 22.9163 25H27.083C29.1663 25 29.1663 25 29.1663 27.0833Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M45.1045 22.9167C40.292 26.4167 34.792 28.5001 29.167 29.2084" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5.45801 23.4792C10.1455 26.6876 15.4372 28.6251 20.833 29.2292" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      )
    },
    {
      title: 'Selected Candidates',
      value: loading ? '...' : formatNumber(metrics.selectedCandidates),
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.2663 18.1166C15.0996 18.0999 14.8996 18.0999 14.7163 18.1166C10.7496 17.9833 7.59961 14.7333 7.59961 10.7333C7.59961 6.64992 10.8996 3.33325 14.9996 3.33325C19.0829 3.33325 22.3996 6.64992 22.3996 10.7333C22.3829 14.7333 19.2329 17.9833 15.2663 18.1166Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M27.3505 6.66675C30.5838 6.66675 33.1838 9.28341 33.1838 12.5001C33.1838 15.6501 30.6838 18.2167 27.5671 18.3334C27.4338 18.3167 27.2838 18.3167 27.1338 18.3334" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.9332 24.2667C2.89987 26.9667 2.89987 31.3667 6.9332 34.0501C11.5165 37.1167 19.0332 37.1167 23.6165 34.0501C27.6499 31.3501 27.6499 26.9501 23.6165 24.2667C19.0499 21.2167 11.5332 21.2167 6.9332 24.2667Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M30.5664 33.3333C31.7664 33.0833 32.8997 32.5999 33.8331 31.8833C36.4331 29.9333 36.4331 26.7166 33.8331 24.7666C32.9164 24.0666 31.7997 23.5999 30.6164 23.3333" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

      )
    },
    {
      title: 'Rejected Candidates',
      value: loading ? '...' : formatNumber(metrics.rejectedCandidates),
      icon: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.2663 18.1166C15.0996 18.0999 14.8996 18.0999 14.7163 18.1166C10.7496 17.9833 7.59961 14.7333 7.59961 10.7333C7.59961 6.64992 10.8996 3.33325 14.9996 3.33325C19.0829 3.33325 22.3996 6.64992 22.3996 10.7333C22.3829 14.7333 19.2329 17.9833 15.2663 18.1166Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M27.3495 6.66675C30.5828 6.66675 33.1828 9.28341 33.1828 12.5001C33.1828 15.6501 30.6828 18.2167 27.5661 18.3334C27.4328 18.3167 27.2828 18.3167 27.1328 18.3334" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.9332 24.2667C2.89987 26.9667 2.89987 31.3667 6.9332 34.0501C11.5165 37.1167 19.0332 37.1167 23.6165 34.0501C27.6499 31.3501 27.6499 26.9501 23.6165 24.2667C19.0499 21.2167 11.5332 21.2167 6.9332 24.2667Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M30.5664 33.3333C31.7664 33.0833 32.8997 32.5999 33.8331 31.8833C36.4331 29.9333 36.4331 26.7166 33.8331 24.7666C32.9164 24.0666 31.7997 23.5999 30.6164 23.3333" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4 py-2.5">
      {metricsData.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg p-3 shadow-sm border-gray-200 border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-800 font-medium text-sm">{metric.title}</div>
            <div className="w-6 h-6 flex items-center justify-center">
              {metric.icon}
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
            <div className="text-sm text-gray-500 flex items-center mt-2">
              View more
              <span className="ml-1.5 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.0254 4.94165L17.0837 9.99998L12.0254 15.0583" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2.91699 10H16.942" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
        </div>
      ))}
    </div>

    
  );
};

export default MetricsCards;
