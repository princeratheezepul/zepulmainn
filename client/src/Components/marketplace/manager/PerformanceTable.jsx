import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const PerformanceTable = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch companies data on component mount
  useEffect(() => {
    fetchCompaniesData();
  }, []);

  const fetchCompaniesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      
      if (!userInfo?.data?.accessToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-companies`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Performance Table - Companies API response:', result);
        
        if (result.success && result.companies) {
          // Transform companies data to performance data format
          const transformedData = result.companies.map(company => {
            const candidatesCount = company.candidatesCount || 0;
            const selectedCount = company.selectedCandidatesCount || 0;
            const rejectedCount = company.rejectedCandidatesCount || 0;
            
            // Calculate placement rate
            const placementRate = candidatesCount > 0 
              ? Math.round((selectedCount / candidatesCount) * 100) 
              : 0;
            
            // Determine status based on placement rate
            let status = 'Medium';
            let trend = 'up'; // Default trend
            if (placementRate >= 65) {
              status = 'High';
              trend = 'up';
            } else if (placementRate < 30) {
              status = 'Low';
              trend = 'down';
            }
            
            return {
              partner: company.companyName || 'Unknown Company',
              jobsPicked: company.pickedNumber || 0,
              candidates: candidatesCount,
              selected: selectedCount,
              rejected: rejectedCount,
              placementRate: placementRate,
              status: status,
              trend: trend
            };
          });
          
          setPerformanceData(transformedData);
        } else {
          setPerformanceData([]);
        }
      } else {
        throw new Error('Failed to fetch companies data');
      }
    } catch (error) {
      console.error('Error fetching companies data:', error);
      setError(error.message);
      setPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-grey-200 rounded-xl shadow-sm border border-gray-200 mx-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">Performance Summary</div>
          
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading performance data...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error loading data</div>
              <div className="text-sm text-gray-500">{error}</div>
              <button 
                onClick={fetchCompaniesData}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : performanceData.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No performance data available</div>
              <div className="text-sm">No companies found or no data to display</div>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs Picked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.partner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.jobsPicked}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.candidates}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.selected}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.rejected}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.placementRate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'High' 
                        ? 'bg-green-100 text-green-800' 
                        : row.status === 'Low'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {row.status} {row.trend === 'up' ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PerformanceTable;
