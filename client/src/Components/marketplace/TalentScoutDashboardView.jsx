import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Award,
  FileText,
  Loader2
} from 'lucide-react';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';
import { config } from '../../config/config';

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon: Icon, bgGradient, iconColor, trend, children }) => (
  <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border border-gray-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${bgGradient}`}>
    {/* Background decoration */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>

    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${iconColor} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>

    <div className="space-y-1">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>

    {children}
  </div>
);





const TalentScoutDashboardView = ({ onBack }) => {
  const [animateNumbers, setAnimateNumbers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { apiCall } = useMarketplaceAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`${config.backendUrl}/api/marketplace/dashboard-stats`);
        const data = await response.json();

        if (response.ok && data.success) {
          setDashboardData(data.data);
        } else {
          console.error("Failed to fetch dashboard data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
        // Trigger number animation after data load
        setTimeout(() => setAnimateNumbers(true), 100);
      }
    };

    fetchDashboardData();
  }, [apiCall]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
          <button
            onClick={onBack}
            className="text-blue-600 hover:underline font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { kpis, candidatePipeline, rejectionReasons, scoutQualityScore } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="w-full px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Dashboard</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                  Talent Scout
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Quality Performance Overview
              </h1>
              <p className="text-gray-600 mt-2">
                Submit better profiles faster, not more profiles
              </p>
            </div>
            <button
              onClick={onBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all duration-200"
            >
              Talent Scout Dashboard
            </button>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Profiles Submitted */}
          <KPICard
            title="Profiles Submitted"
            value={kpis.profilesSubmitted}
            subtitle="Total submitted"
            icon={Users}
            bgGradient="bg-gradient-to-br from-blue-50 to-white"
            iconColor="text-blue-600"
          // trend={12} // Trend requires historical data
          />

          {/* Avg CV Strength */}
          <KPICard
            title="Avg CV Strength"
            value={`${kpis.avgCVStrength}/100`}
            subtitle="Quality indicator"
            icon={Award}
            bgGradient="bg-gradient-to-br from-green-50 to-white"
            iconColor="text-green-600"
          // trend={5}
          >
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${kpis.avgCVStrength >= 80 ? 'bg-green-500' :
                  kpis.avgCVStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: animateNumbers ? `${kpis.avgCVStrength}%` : '0%' }}
              ></div>
            </div>
          </KPICard>

          {/* Qualification Rate */}
          <KPICard
            title="Qualification Rate"
            value={`${kpis.qualificationRate}%`}
            subtitle="Profiles ≥75% CV strength"
            icon={CheckCircle}
            bgGradient="bg-gradient-to-br from-purple-50 to-white"
            iconColor="text-purple-600"
          // trend={8}
          >
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: animateNumbers ? `${kpis.qualificationRate}%` : '0%' }}
              ></div>
            </div>
          </KPICard>

          {/* Time to First Submission */}
          <KPICard
            title="Time to First Submission"
            value={`${kpis.timeToFirstSubmission} hrs`}
            subtitle={`Target: ${kpis.targetTime} hrs`}
            icon={Clock}
            bgGradient="bg-gradient-to-br from-orange-50 to-white"
            iconColor="text-orange-600"
          // trend={-15}
          >
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className={`px-2 py-1 rounded-full font-semibold ${kpis.timeToFirstSubmission < kpis.targetTime
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {kpis.timeToFirstSubmission < kpis.targetTime
                  ? '✓ On Track'
                  : '⚠ Delayed'}
              </div>
            </div>
          </KPICard>
        </div>



        {/* Rejection Feedback Loop & Scout Quality Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Rejection Feedback Loop */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Rejection Feedback Loop</h2>
                <span className="ml-auto px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  Learning Opportunities
                </span>
              </div>
              <p className="text-sm text-gray-500">Understand and improve from rejections</p>
            </div>

            <div className="space-y-4">
              {rejectionReasons.length > 0 ? (
                rejectionReasons.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.count} rejections</span>
                        <span className="text-sm font-bold text-gray-900">{item.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80"
                        style={{
                          backgroundColor: item.color,
                          width: animateNumbers ? `${item.percentage}%` : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No rejections recorded yet. Great job! 🎉</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">💡 Pro Tip</h3>
                  <p className="text-xs text-blue-700">
                    Focus on improving CV strength and JD alignment to reduce rejections by up to 60%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scout Quality Score */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Scout Quality Score</h2>
              </div>
              <p className="text-sm text-gray-500">Your overall performance index</p>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="20"
                    strokeDasharray={`${(scoutQualityScore.overall / 100) * 502.65} 502.65`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl font-bold ${getScoreColor(scoutQualityScore.overall)}`}>
                    {scoutQualityScore.overall}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">out of 100</div>
                </div>
              </div>

              <div className={`mt-4 px-4 py-2 rounded-full font-semibold text-sm ${getScoreBgColor(scoutQualityScore.overall)} ${getScoreColor(scoutQualityScore.overall)}`}>
                {scoutQualityScore.overall >= 80 ? '🌟 Excellent Performance' :
                  scoutQualityScore.overall >= 60 ? '✓ Good Performance' :
                    '⚠ Needs Improvement'}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              {scoutQualityScore.components.map((component, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: component.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-700">{component.name}</div>
                      <div className="text-xs text-gray-500">{component.weight}% weight</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{component.value}</div>
                    <div className="text-xs text-gray-500">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decision Readiness Indicator */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Decision Readiness: Your North Star ⭐</h3>
              <p className="text-blue-100 text-sm">
                Focus on getting candidates to "Decision Ready" status - this is what matters most
              </p>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {/* Calculate totals from pipeline */}
              {(() => {
                const totalDecisionReady = candidatePipeline.reduce((sum, item) => sum + item.stages[4], 0);
                const totalPartiallyReady = candidatePipeline.reduce((sum, item) => sum + item.stages[1] + item.stages[2] + item.stages[3], 0);
                const totalNotReady = candidatePipeline.reduce((sum, item) => sum + item.stages[0], 0);

                return (
                  <>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{totalDecisionReady}</div>
                      <div className="text-xs text-blue-100 mt-1">✅ Decision Ready</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold opacity-60">{totalPartiallyReady}</div>
                      <div className="text-xs text-blue-100 mt-1">⚠️ Partially Ready</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold opacity-40">{totalNotReady}</div>
                      <div className="text-xs text-blue-100 mt-1">❌ Not Ready</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

      </div>


    </div>
  );
};

export default TalentScoutDashboardView;
