import React from 'react';
import { Home, Briefcase, Wallet, X } from 'lucide-react';

const Sidebar = ({ 
  activeSidebarItem, 
  setActiveSidebarItem, 
  isSidebarOpen, 
  setIsSidebarOpen 
}) => {
  const sidebarItems = [
    { id: 'Home', label: 'Home', icon: Home },
    { id: 'Jobs', label: 'Jobs', icon: Briefcase },
    { id: 'Wallet', label: 'Wallet', icon: Wallet }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`w-64 bg-gray-50 shadow-lg border-r border-gray-200 flex flex-col fixed lg:fixed lg:top-0 lg:left-0 z-50 h-screen transform transition-transform duration-300 ease-in-out overflow-hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <img src="/zepul_trademark.jpg" alt="" className="w-30 h-15" />
              
              
            </div>
            {/* Close button for mobile */}
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 pt-2 pb-4 overflow-hidden">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSidebarItem === item.id;
              return (
                <li key={item.id}>
                  <div
                    onClick={() => setActiveSidebarItem(item.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
