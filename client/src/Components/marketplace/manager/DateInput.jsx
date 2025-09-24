import React from 'react';

const DateInput = ({ 
  label, 
  deadlineValue, 
  tatValue, 
  onDeadlineChange, 
  onTatChange, 
  tatOptions, 
  deadlineError, 
  tatError 
}) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Deadline */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          Deadline
        </label>
        <div className="relative">
          <input
            type="date"
            value={deadlineValue}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              deadlineError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
          />
          {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div> */}
        </div>
        {deadlineError && (
          <p className="text-sm text-red-500">{deadlineError}</p>
        )}
      </div>
      
      {/* TAT */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-600">
          TAT (Turnaround Time)
        </label>
        <div className="relative">
          <select
            value={tatValue}
            onChange={(e) => onTatChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
              tatError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>Select TAT</option>
            {tatOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        {tatError && (
          <p className="text-sm text-red-500">{tatError}</p>
        )}
      </div>
    </div>
  );
};

export default DateInput;
