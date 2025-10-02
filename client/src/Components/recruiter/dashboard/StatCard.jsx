import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, percentage, since }) => {
  return (
    <div className="bg-white p-2 md:p-3 rounded-lg border hover:shadow-sm h-full">
      <div className="flex justify-between items-end h-full">
        <div>
          <p className="text-[10px] md:text-xs text-gray-500 truncate mb-1">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-black m-0 mb-1">{value}</p>
          <p className="text-xs text-gray-400 m-0 mb-1">{since}</p>
        </div>
       
      </div>
    </div>
  );
};

export default StatCard; 