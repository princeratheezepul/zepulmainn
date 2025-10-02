import React from 'react';

const Header = () => {
  return (
    <div className="bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-1">DASHBOARD</p>
        <div className="text-md md:text-xl lg:text-xl font-bold text-gray-800 -mt-1">Recruiter Overview</div>
      </div>

    </div>
  );
};

export default Header; 