import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Award,
  BarChart3,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';

// Dummy data for all metrics
const DUMMY_DATA = {
  kpis: {
    profilesSubmitted: 27,
    avgCVStrength: 78,
    qualificationRate: 68,
    timeToFirstSubmission: 4.2,
    targetTime: 6.0
  },
  candidatePipeline: [
    { role: 'Software Engineer', stages: [45, 32, 24, 18, 12] },
    { role: 'Product Manager', stages: [38, 28, 20, 15, 9] },
    { role: 'Data Analyst', stages: [29, 22, 16, 11, 7] },
    { role: 'UI/UX Designer', stages: [24, 18, 13, 9, 5] }
  ],
  rejectionReasons: [
    { reason: 'Low CV Strength', count: 36, percentage: 40, color: '#EF4444' },
    { reason: 'Coding Below Benchmark', count: 22, percentage: 25, color: '#F59E0B' },
    { reason: 'Interview Mismatch', count: 18, percentage: 20, color: '#8B5CF6' },
    { reason: 'JD Misalignment', count: 13, percentage: 15, color: '#6B7280' }
  ],
  scoutQualityScore: {
    overall: 74,
    components: [
      { name: 'CV Strength', value: 78, weight: 40, color: '#10B981' },
      { name: 'Coding Pass Rate', value: 64, weight: 30, color: '#3B82F6' },
      { name: 'Interview Success', value: 72, weight: 20, color: '#8B5CF6' },
      { name: 'SLA Adherence', value: 95, weight: 10, color: '#F59E0B' }
    ]
  }
};

const stageLabels = ['Submitted', 'CV Qualified', 'Coding Passed', 'Interview Completed', 'Decision Ready'];
const stageColors = ['#0057FF', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

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

// Arrow Segment for Pipeline
const ArrowSegment = ({ value, color, isFirst, isLast, empty, index }) => {
  let shapeClass = "middle";
  if (isFirst) shapeClass = "first";
  else if (isLast) shapeClass = "last";

  let marginLeft = 0;
  if (!isFirst) {
    marginLeft = -12 * index;
  }

  return (
    <div
      className={`pipeline-segment ${shapeClass} ${empty ? 'empty' : ''} text-xs font-semibold`}
      style={{
        background: empty ? undefined : color,
        marginLeft: marginLeft,
        minWidth: 'clamp(60px, 12vw, 90px)',
        width: 'clamp(60px, 12vw, 90px)',
        fontSize: 'clamp(10px, 2vw, 13px)'
      }}
    >
      {value}
    </div>
  );
};

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{label || payload[0].name}</p>
        <p className="text-sm text-gray-600">
          {payload[0].name}: <span className="font-bold text-blue-600">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const TalentScoutDashboardView = ({ onBack }) => {
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    // Trigger number animation on mount
    setTimeout(() => setAnimateNumbers(true), 100);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

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
              className="group flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-semibold shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="hidden md:inline">Back to Partner Dashboard</span>
              <span className="md:hidden">Back</span>
            </button>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Profiles Submitted */}
          <KPICard
            title="Profiles Submitted"
            value={DUMMY_DATA.kpis.profilesSubmitted}
            subtitle="This period"
            icon={Users}
            bgGradient="bg-gradient-to-br from-blue-50 to-white"
            iconColor="text-blue-600"
            trend={12}
          />

          {/* Avg CV Strength */}
          <KPICard
            title="Avg CV Strength"
            value={`${DUMMY_DATA.kpis.avgCVStrength}/100`}
            subtitle="Quality indicator"
            icon={Award}
            bgGradient="bg-gradient-to-br from-green-50 to-white"
            iconColor="text-green-600"
            trend={5}
          >
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${DUMMY_DATA.kpis.avgCVStrength >= 80 ? 'bg-green-500' :
                  DUMMY_DATA.kpis.avgCVStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: animateNumbers ? `${DUMMY_DATA.kpis.avgCVStrength}%` : '0%' }}
              ></div>
            </div>
          </KPICard>

          {/* Qualification Rate */}
          <KPICard
            title="Qualification Rate"
            value={`${DUMMY_DATA.kpis.qualificationRate}%`}
            subtitle="Profiles ≥75% CV strength"
            icon={CheckCircle}
            bgGradient="bg-gradient-to-br from-purple-50 to-white"
            iconColor="text-purple-600"
            trend={8}
          >
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                style={{ width: animateNumbers ? `${DUMMY_DATA.kpis.qualificationRate}%` : '0%' }}
              ></div>
            </div>
          </KPICard>

          {/* Time to First Submission */}
          <KPICard
            title="Time to First Submission"
            value={`${DUMMY_DATA.kpis.timeToFirstSubmission} hrs`}
            subtitle={`Target: ${DUMMY_DATA.kpis.targetTime} hrs`}
            icon={Clock}
            bgGradient="bg-gradient-to-br from-orange-50 to-white"
            iconColor="text-orange-600"
            trend={-15}
          >
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className={`px-2 py-1 rounded-full font-semibold ${DUMMY_DATA.kpis.timeToFirstSubmission < DUMMY_DATA.kpis.targetTime
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {DUMMY_DATA.kpis.timeToFirstSubmission < DUMMY_DATA.kpis.targetTime
                  ? '✓ On Track'
                  : '⚠ Delayed'}
              </div>
            </div>
          </KPICard>
        </div>

        {/* Candidate Pipeline */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Candidate Pipeline
              </h2>
              <p className="text-sm text-gray-500 mt-1">Track candidates through each stage</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-4 pr-4">
                    Role
                  </th>
                  {stageLabels.map((label, idx) => {
                    let transformClass = '';
                    if (idx === 1) transformClass = 'transform -translate-x-3';
                    else if (idx === 2) transformClass = 'transform -translate-x-6';
                    else if (idx === 3) transformClass = 'transform -translate-x-9';
                    else if (idx === 4) transformClass = 'transform -translate-x-12';

                    return (
                      <th key={label} className={`text-xs font-semibold text-gray-600 uppercase tracking-wider pb-4 text-left ${transformClass}`}>
                        {label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {DUMMY_DATA.candidatePipeline.map((item, idx) => (
                  <tr key={item.role} className={idx !== DUMMY_DATA.candidatePipeline.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="text-sm font-semibold text-gray-800 py-3 pr-4">
                      {item.role}
                    </td>
                    {item.stages.map((val, i) => (
                      <td key={i} className="py-3">
                        <ArrowSegment
                          value={val}
                          color={stageColors[i]}
                          isFirst={i === 0}
                          isLast={i === item.stages.length - 1}
                          empty={false}
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
              {DUMMY_DATA.rejectionReasons.map((item, idx) => (
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
              ))}
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
                    strokeDasharray={`${(DUMMY_DATA.scoutQualityScore.overall / 100) * 502.65} 502.65`}
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
                  <div className={`text-5xl font-bold ${getScoreColor(DUMMY_DATA.scoutQualityScore.overall)}`}>
                    {DUMMY_DATA.scoutQualityScore.overall}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">out of 100</div>
                </div>
              </div>

              <div className={`mt-4 px-4 py-2 rounded-full font-semibold text-sm ${getScoreBgColor(DUMMY_DATA.scoutQualityScore.overall)} ${getScoreColor(DUMMY_DATA.scoutQualityScore.overall)}`}>
                {DUMMY_DATA.scoutQualityScore.overall >= 80 ? '🌟 Excellent Performance' :
                  DUMMY_DATA.scoutQualityScore.overall >= 60 ? '✓ Good Performance' :
                    '⚠ Needs Improvement'}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              {DUMMY_DATA.scoutQualityScore.components.map((component, idx) => (
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
              <div className="text-center">
                <div className="text-4xl font-bold">12</div>
                <div className="text-xs text-blue-100 mt-1">✅ Decision Ready</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold opacity-60">23</div>
                <div className="text-xs text-blue-100 mt-1">⚠️ Partially Ready</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold opacity-40">15</div>
                <div className="text-xs text-blue-100 mt-1">❌ Not Ready</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Pipeline segment styles */}
      <style jsx>{`
        .pipeline-segment {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          position: relative;
          color: white;
          font-weight: 600;
          text-align: center;
          transition: all 0.2s ease;
        }
        
        .pipeline-segment:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
        
        .pipeline-segment.first {
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%);
        }
        
        .pipeline-segment.middle {
          clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%);
        }
        
        .pipeline-segment.last {
          clip-path: polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%);
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
