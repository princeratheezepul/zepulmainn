import React from 'react';
import { User, Bell, LogOut } from 'lucide-react';

const SettingsSidebar = ({ 
  activeTab, 
  onNavigateToProfile, 
  onNavigateToNotification, 
  onLogout 
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Settings Section */}
      <nav className="flex-1 px-4 py-6">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Settings
        </div>
        <div className="space-y-2 mt-2">
          <div 
            onClick={onNavigateToProfile}
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'profile' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            <span className="font-medium">Profile</span>
          </div>
          <div 
            onClick={onNavigateToNotification}
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeTab === 'notification' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-5 h-5 mr-3" />
            <span className="font-medium">Notification</span>
          </div>
          <div 
            onClick={onLogout}
            className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Logout</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SettingsSidebar;
