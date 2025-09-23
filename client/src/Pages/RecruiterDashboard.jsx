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
  const location = useLocation();

  // Handle navigation state to set active component
  useEffect(() => {
    if (location.state?.activeComponent) {
      setActiveComponent(location.state.activeComponent);
    }
  }, [location.state]);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
      {activeComponent === 'Settings' ? (
        <div className="flex-1">
          <Settings />
        </div>
      ) : activeComponent === 'ZepDB' ? (
        <div className="flex-1">
          <ZepDB />
        </div>
      ) : (
        <main className="flex-1 p-4 md:p-6 pt-2 md:pt-4">
          {activeComponent === 'Dashboard' && (
            <div className="flex flex-col space-y-4 md:space-y-8 md:h-[calc(100vh-16px)]">
              <div className="md:h-[5vh]">
                <Header />
              </div>
              <div className="md:h-[16vh]">
                <StatsGroup />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 md:gap-8 md:h-[38vh]">
                <div className="h-[300px] md:h-full">
                  <CandidateSubmissionChart />
                </div>
                <div className="h-[300px] md:h-full">
                  <TotalApplications />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8 md:h-[35vh]">
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
  );
};

export default RecruiterDashboard;