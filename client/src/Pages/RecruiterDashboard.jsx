import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Components/recruiter/dashboard/Header';
import StatsGroup from '../Components/recruiter/dashboard/StatsGroup';
import CandidateSubmissionChart from '../Components/recruiter/dashboard/CandidateSubmissionChart';
import TotalApplications from '../Components/recruiter/dashboard/TotalApplications';
import AverageScore from '../Components/recruiter/dashboard/AverageScore';
import ShortlistChart from '../Components/recruiter/dashboard/ShortlistChart';
import Sidebar from '../Components/recruiter/dashboard/Sidebar';
import RecruiterJobs from '../Components/recruiter/dashboard/RecruiterJobs';
import Settings from '../Components/recruiter/dashboard/Settings';
import ZepDB from '../Components/recruiter/dashboard/ZepDB';


const RecruiterDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('Dashboard');
  const [isCollapsed, setIsCollapsed] = useState(true); // Lifted state
  const location = useLocation();

  // Handle navigation state to set active component
  useEffect(() => {
    if (location.state?.activeComponent) {
      setActiveComponent(location.state.activeComponent);
    }
  }, [location.state]);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed} />
      
      <div
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-52"
        }`}
      >
      {activeComponent === 'Profile' ? (
        <div className="flex-1">
          <Settings />
        </div>
      ) : activeComponent === 'ZepDB' ? (
        <div className="flex-1">
          <ZepDB />
        </div>
      ) : (
        <main className="bg-white flex-1 p-4 md:p-6 pt-3 md:pt-4 ">
          {activeComponent === 'Dashboard' && (
            <div className="flex flex-col space-y-2 md:space-y-3">
              <div className="">
                <Header />
              </div>
              <div className="md:h-[16vh]">
                <StatsGroup />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr] gap-1 md:gap-8 md:h-[50vh]">
                <div className="h-[500px] md:h-full">
                  <CandidateSubmissionChart />
                </div>
                <div className="h-[300px] md:h-full">
                  <TotalApplications />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-2 md:gap-8 md:h-[50vh]">
                <div className="h-[250px] md:h-full lg:w-2/5">
                  <AverageScore />
                </div>
                <div className="h-[250px] md:h-full lg:w-3/5">
                  <ShortlistChart />
                </div>
              </div>
            </div>
          )}
          {activeComponent === 'Jobs' && <RecruiterJobs />}
        </main>
      )}
    </div>
    </div>
  );
};

export default RecruiterDashboard;