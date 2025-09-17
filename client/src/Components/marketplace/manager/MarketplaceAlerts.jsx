import React from 'react';

const MarketplaceAlerts = () => {
  const alerts = [
    { message: "Job Frontend Developer was picked up by TechHire LLP", time: "12 hr ago" },
    { message: "Job Frontend Developer was picked up by TechHire LLP", time: "12 hr ago" },
    { message: "Job Frontend Developer was picked up by TechHire LLP", time: "12 hr ago" },
    { message: "Job Frontend Developer was picked up by TechHire LLP", time: "12 hr ago" },
    { message: "Job Frontend Developer was picked up by TechHire LLP", time: "12 hr ago" }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Marketplace Alerts</h3>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceAlerts;
