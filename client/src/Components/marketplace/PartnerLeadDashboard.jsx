import React, { useState, useMemo, useEffect } from 'react';
import { Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TalentScoutDashboardView from './TalentScoutDashboardView';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';

// Dynamic candidate status data will be calculated from user data

// Company Performance data removed as requested

const MetricsCard = ({ title, value, icon: Icon, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500">{title}</div>
  </div>
);

const PartnerLeadDashboard = ({ user: initialUser }) => {
  const [showTalentScoutDashboard, setShowTalentScoutDashboard] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchUserProfile } = useMarketplaceAuth();

  // Refresh user profile on mount to get populated pickedJobs
  useEffect(() => {
    const refreshUserData = async () => {
      setIsRefreshing(true);
      try {
        const updatedUser = await fetchUserProfile();
        if (updatedUser) {
          console.log('PartnerLeadDashboard - Refreshed user data:', updatedUser);
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('PartnerLeadDashboard - Error refreshing user data:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Only refresh if user data exists
    if (initialUser) {
      refreshUserData();
    } else {
      setUser(initialUser);
    }
  }, [initialUser?._id, fetchUserProfile]); // Depend on user ID to avoid unnecessary refreshes

  const handleTalentScoutDashboard = () => {
    setShowTalentScoutDashboard(true);
  };

  // Debug logging
  console.log('PartnerLeadDashboard - User data:', user);
  console.log('PartnerLeadDashboard - PickedJobs:', user?.pickedJobs);

  // Calculate jobs picked count from user data
  const jobsPickedCount = user?.pickedJobs?.length || 0;
  
  // Get total earnings from user data
  const totalEarnings = user?.totalEarnings || 0;
  const formattedEarnings = `₹${totalEarnings.toLocaleString()}`;

  // Fast calculation of most picked job roles using useMemo for optimization
  const jobRolesData = useMemo(() => {
    if (!user?.pickedJobs || user.pickedJobs.length === 0) {
      console.log('PartnerLeadDashboard - No picked jobs found');
      return [];
    }

    console.log('PartnerLeadDashboard - Calculating job roles from:', user.pickedJobs.length, 'jobs');

    // Use Map for O(n) performance
    const roleCountMap = new Map();
    
    // Count occurrences of each job title
    user.pickedJobs.forEach(job => {
      if (job && job.jobTitle) {
        const count = roleCountMap.get(job.jobTitle) || 0;
        roleCountMap.set(job.jobTitle, count + 1);
      }
    });

    // Convert Map to array and sort by count (descending)
    const sortedRoles = Array.from(roleCountMap.entries())
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Take top 5

    console.log('PartnerLeadDashboard - Job roles data:', sortedRoles);
    return sortedRoles;
  }, [user?.pickedJobs]);

  // Dynamic calculation of candidate status data from user's candidate_data
  const candidateStatusData = useMemo(() => {
    if (!user?.candidate_data) {
      console.log('PartnerLeadDashboard - No candidate_data found');
      return [
        { name: 'Applied', value: 0, color: '#3B82F6' },
        { name: 'Shortlisted', value: 0, color: '#10B981' },
        { name: 'Interviewed', value: 0, color: '#F59E0B' },
        { name: 'Hired', value: 0, color: '#8B5CF6' }
      ];
    }

    console.log('PartnerLeadDashboard - Calculating candidate status from:', user.candidate_data);

    const statusData = [
      { name: 'Applied', value: user.candidate_data.applied || 0, color: '#3B82F6' },
      { name: 'Shortlisted', value: user.candidate_data.shortlisted || 0, color: '#10B981' },
      { name: 'Interviewed', value: user.candidate_data.interviewed || 0, color: '#F59E0B' },
      { name: 'Hired', value: user.candidate_data.hired || 0, color: '#8B5CF6' }
    ];

    console.log('PartnerLeadDashboard - Candidate status data:', statusData);
    return statusData;
  }, [user?.candidate_data]);

  // If Talent Scout Dashboard is shown, render it
  if (showTalentScoutDashboard) {
    return <TalentScoutDashboardView onBack={() => setShowTalentScoutDashboard(false)} />;
  }

  // Show loading indicator while refreshing initial data
  if (isRefreshing && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">Partner Lead Overview</div>
          <div className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</div>
        </div>
        <button
          onClick={handleTalentScoutDashboard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Talent Scout Dashboard
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricsCard 
          title="Jobs Picked" 
          value={jobsPickedCount} 
          icon={Briefcase}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricsCard 
          title="Performance" 
          value="85%" 
          icon={TrendingUp}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <MetricsCard 
          title="Earnings" 
          value={formattedEarnings} 
          icon={DollarSign}
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Picked Job Roles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-lg font-bold text-gray-900 mb-6">Most Picked Job Roles</div>
          {jobRolesData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500">No jobs picked yet</div>
                <div className="text-sm text-gray-400 mt-1">Start picking jobs to see statistics</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobRolesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" />
                <YAxis dataKey="role" type="category" stroke="#6B7280" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Candidate Status Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-lg font-bold text-gray-900 mb-6">Candidate Status Breakdown</div>
          {candidateStatusData.every(item => item.value === 0) ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="text-gray-500">No candidate activity yet</div>
                <div className="text-sm text-gray-400 mt-1">Start submitting resumes and evaluating candidates</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={candidateStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {candidateStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
};

export default PartnerLeadDashboard;

