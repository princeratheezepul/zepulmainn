import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  UploadCloud,
  UserCheck,
  BarChart3,
  Database,
  Settings as SettingsIcon,
  Search,
  Menu,
} from 'lucide-react';
import RecruiterOverview from '../Components/recruiter/dashboard/RecruiterOverview';
import RecruiterCandidates from '../Components/recruiter/dashboard/RecruiterCandidates';
import RecruiterUpload from '../Components/recruiter/dashboard/RecruiterUpload';
import RecruiterJobs from '../Components/recruiter/dashboard/RecruiterJobs';
import RecruiterAnalytics from '../Components/recruiter/dashboard/RecruiterAnalytics';
import Settings from '../Components/recruiter/dashboard/Settings';
import ZepDB from '../Components/recruiter/dashboard/ZepDB';
import { useRecruiterPlatformData } from '../Components/recruiter/dashboard/useRecruiterPlatformData';
import { initialsOf, readAuth } from '../Components/dashboard/dashboardUtils';

/**
 * Recruiter console sections. `fullBleed` screens ship their own page padding, so
 * the shell hands them the content area untouched.
 */
const RECRUITER_NAV = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Assigned Jobs', icon: Briefcase, fullBleed: true },
  { name: 'Upload Candidates', icon: UploadCloud, fullBleed: true },
  { name: 'Candidate Pipeline', icon: UserCheck },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'ZepDB', icon: Database, fullBleed: true },
  { name: 'Profile', icon: SettingsIcon, fullBleed: true },
];

// Other screens navigate here with state.activeComponent; keep the old tab names
// working so those links still land somewhere sensible.
const LEGACY_TAB_ALIASES = {
  Jobs: 'Assigned Jobs',
  Candidates: 'Candidate Pipeline',
};

const RecruiterDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const [navOpen, setNavOpen] = useState(false);
  const [jump, setJump] = useState('');
  const location = useLocation();
  const platform = useRecruiterPlatformData();

  const recruiterName = readAuth().user?.fullname || 'Zepul Recruiter';

  useEffect(() => {
    const requested = location.state?.activeComponent;
    if (!requested) return;
    const resolved = LEGACY_TAB_ALIASES[requested] || requested;
    if (RECRUITER_NAV.some((n) => n.name === resolved)) setActiveComponent(resolved);
  }, [location.state]);

  const go = (name) => {
    setActiveComponent(name);
    setNavOpen(false);
    setJump('');
  };

  const section = RECRUITER_NAV.find((n) => n.name === activeComponent) || RECRUITER_NAV[0];
  const query = jump.trim().toLowerCase();
  const matches = query ? RECRUITER_NAV.filter((n) => n.name.toLowerCase().includes(query)) : [];

  const renderSection = () => {
    switch (activeComponent) {
      case 'Assigned Jobs':
        return <RecruiterJobs />;
      case 'Upload Candidates':
        return <RecruiterUpload platform={platform} />;
      case 'Candidate Pipeline':
        return <RecruiterCandidates platform={platform} />;
      case 'Analytics':
        return <RecruiterAnalytics />;
      case 'ZepDB':
        return <ZepDB />;
      case 'Profile':
        return <Settings />;
      default:
        return <RecruiterOverview platform={platform} onNavigate={go} />;
    }
  };

  return (
    <div className="dashboard-shell-recruiter min-h-screen bg-[#f6f8fb] text-[#1d2430]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[245px] bg-[#0e1728] text-white px-[15px] py-[22px] z-30 overflow-y-auto transition-transform duration-200 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="text-[25px] font-extrabold px-2.5 pb-[26px] cursor-pointer" onClick={() => go('Dashboard')}>
          zepul<span className="text-[#9ab2ff]">™</span>
        </div>

        <div className="bg-[#182238] border border-[#293750] rounded-[10px] px-3 py-2.5 mb-[18px]">
          <small className="block text-[#8794aa] text-[9px] uppercase tracking-wide">Signed in as</small>
          <b className="text-xs">{recruiterName}</b>
        </div>

        <nav>
          {RECRUITER_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => go(item.name)}
                className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg my-[3px] text-xs cursor-pointer transition-colors ${
                  activeComponent === item.name
                    ? 'bg-[#202d45] text-white'
                    : 'text-[#aab5c7] hover:bg-[#202d45] hover:text-white'
                }`}
              >
                <Icon size={15} strokeWidth={2} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {navOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setNavOpen(false)} />
      )}

      <div className="lg:ml-[245px]">
        {/* Top bar */}
        <header className="h-[68px] bg-white border-b border-[#e7ebf2] flex items-center justify-between px-4 md:px-7 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-[#778092] cursor-pointer"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a1b0]" />
              <input
                className="w-[260px] md:w-[330px] pl-8 pr-3 py-[9px] border border-[#e7ebf2] rounded-lg bg-[#f8f9fb] text-xs outline-none focus:border-[#c7d5ff]"
                placeholder="Jump to a section…"
                value={jump}
                onChange={(e) => setJump(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && matches[0]) go(matches[0].name);
                  if (e.key === 'Escape') setJump('');
                }}
              />
              {matches.length > 0 && (
                <div className="absolute left-0 top-[46px] w-[260px] md:w-[330px] bg-white border border-[#e7ebf2] rounded-lg shadow-[0_8px_25px_#0001] overflow-hidden">
                  {matches.map((m) => (
                    <button
                      key={m.name}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-[#f6f8fb] cursor-pointer"
                      onClick={() => go(m.name)}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#778092] hidden sm:block">Employer Recruiter</span>
            <div
              className="w-[34px] h-[34px] rounded-full bg-[#e5ebff] text-[#024bff] grid place-items-center font-extrabold text-[11px] cursor-pointer"
              onClick={() => go('Profile')}
              title="Profile & settings"
            >
              {initialsOf(recruiterName, 'Zepul Recruiter')}
            </div>
          </div>
        </header>

        <main>
          {section.fullBleed ? (
            renderSection()
          ) : (
            <div className="p-5 md:p-7 max-w-[1500px]">{renderSection()}</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
