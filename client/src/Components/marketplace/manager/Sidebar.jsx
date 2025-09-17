import React from 'react';

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen py-6 fixed top-0 left-0 overflow-y-auto z-10 hidden lg:block">
      <div className="flex flex-col px-6">
        {/* ZEPUL Logo */}
        <div className="flex items-center space-x-3 mb-12">
        
        <img src="/zepul_trademark.jpg" alt="" className="w-30 h-15" />
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {/* Home */}
          <div
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer ${activeTab === 'home'
                ? 'bg-blue-600'
                : 'hover:bg-gray-50'
              }`}
            onClick={() => onTabChange('home')}
          >
            <svg className={`w-5 h-5 ${activeTab === 'home' ? 'text-white fill-current' : 'text-gray-600'
              }`} fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`${activeTab === 'home'
                ? 'text-white font-bold'
                : 'text-gray-700 font-medium'
              }`}>Home</span>
          </div>

          {/* Jobs */}
          <div
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer ${activeTab === 'jobs'
                ? 'bg-blue-600'
                : 'hover:bg-gray-50'
              }`}
            onClick={() => onTabChange('jobs')}
          >
            <svg className={`w-5 h-5 ${activeTab === 'jobs' ? 'text-white fill-current' : 'text-gray-600'
              }`} fill={activeTab === 'jobs' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 6h-3V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2H4a1 1 0 000 2h1v10a2 2 0 002 2h10a2 2 0 002-2V8h1a1 1 0 000-2zM9 4h6v2H9V4zm7 14H8V8h8v10z" />
            </svg>
            <span className={`${activeTab === 'jobs'
                ? 'text-white font-bold'
                : 'text-gray-700 font-medium'
              }`}>Jobs</span>
          </div>

          {/* Payments */}
          <div
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer ${activeTab === 'payments'
                ? 'bg-blue-600'
                : 'hover:bg-gray-50'
              }`}
            onClick={() => onTabChange('payments')}
          >
            <svg className={`w-5 h-5 ${activeTab === 'payments' ? 'text-white fill-current' : 'text-gray-600'
              }`} fill={activeTab === 'payments' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className={`${activeTab === 'payments'
                ? 'text-white font-bold'
                : 'text-gray-700 font-medium'
              }`}>Payments</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
