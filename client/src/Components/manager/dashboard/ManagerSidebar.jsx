import React, { useState } from "react";
import {
  ChevronLeft,
} from "lucide-react";

const ManagerSidebar = ({ activeComponent, setActiveComponent, isCollapsed, setIsCollapsed }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Sidebar icons (SVGs) - keeping the same as original manager dashboard
  const icons = [
    // Dashboard
    <svg key="dashboard" width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.55556 15.5556H10.8889C11.7444 15.5556 12.4444 14.8556 12.4444 14V1.55556C12.4444 0.7 11.7444 0 10.8889 0H1.55556C0.7 0 0 0.7 0 1.55556V14C0 14.8556 0.7 15.5556 1.55556 15.5556ZM1.55556 28H10.8889C11.7444 28 12.4444 27.3 12.4444 26.4444V20.2222C12.4444 19.3667 11.7444 18.6667 10.8889 18.6667H1.55556C0.7 18.6667 0 19.3667 0 20.2222V26.4444C0 27.3 0.7 28 1.55556 28ZM17.1111 28H26.4444C27.3 28 28 27.3 28 26.4444V14C28 13.1444 27.3 12.4444 26.4444 12.4444H17.1111C16.2556 12.4444 15.5556 13.1444 15.5556 14V26.4444C15.5556 27.3 16.2556 28 17.1111 28ZM15.5556 1.55556V7.77778C15.5556 8.63333 16.2556 9.33333 17.1111 9.33333H26.4444C27.3 9.33333 28 8.63333 28 7.77778V1.55556C28 0.7 27.3 0 26.4444 0H17.1111C16.2556 0 15.5556 0.7 15.5556 1.55556Z" fill="currentColor"/>
    </svg>,
    // Recruiter
    <svg key="recruiter" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke="currentColor" />
      <path d="M2 20c0-4 8-4 8 0" stroke="currentColor" />
      <path d="M14 20c0-4 8-4 8 0" stroke="currentColor" />
    </svg>,
    // Jobs
    <svg key="jobs" width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.4997 19.8327H22.1663M10.4997 13.9993H22.1663M10.4997 8.16602H22.1663M5.83529 19.8327V19.835L5.83301 19.835V19.8327H5.83529ZM5.83529 13.9993V14.0017L5.83301 14.0016V13.9993H5.83529ZM5.83529 8.16602V8.16835L5.83301 8.16829V8.16602H5.83529Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ];

  const navItems = [
    { name: "Dashboard", icon: icons[0] },
    { name: "Recruiter", icon: icons[1] },
    { name: "Jobs", icon: icons[2] },
  ];

  const handleMouseEnter = (itemName, event) => {
    if (!isCollapsed) return; // show tooltip only when collapsed
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    });
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => setHoveredItem(null);

  return (
    <>
      <div
        className={`bg-white h-screen fixed top-0 left-0 z-10 hidden lg:flex flex-col justify-between transition-all duration-300 border-r border-gray-200 ease-in-out ${
          isCollapsed ? "w-20 items-center" : "w-52"
        }`}
      >
        {/* Header / Logo + Toggle */}
        <div className="flex items-center justify-between px-4 py-2 relative w-full">
          {isCollapsed ? (
            <img
              src="/assets/favicon.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          ) : (
            <img
              src="/zepul_trademark.jpg"
              alt="Zepul Logo"
              className="h-10 w-28 object-contain"
            />
          )}
          <button
            style={{borderRadius:25}}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 border shadow-sm"
          >
            <ChevronLeft
              size={14}
              className={`text-gray-600 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex-col gap-2 px-2 py-4 w-full">
          {navItems.map((item) => (
            <div
              key={item.name}
              className={`flex items-center w-full px-3 py-2.5 text-sm transition-colors duration-200 mb-1 cursor-pointer ${
                activeComponent === item.name
                  ? "bg-blue-600 text-white font-medium rounded-lg"
                  : "hover:bg-gray-100 font-medium text-gray-700 rounded-lg"
              } ${isCollapsed ? "justify-center" : ""}`}
              onClick={() => setActiveComponent(item.name)}
              onMouseEnter={(e) => handleMouseEnter(item.name, e)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </div>
          ))}
        </nav>

        {/* Bottom Profile Section */}
        <div
          className={`flex items-center px-3 py-3 border-gray-200 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User avatar"
            className="w-10 h-10 rounded-full border object-cover cursor-pointer"
            onClick={() => setActiveComponent("Profile")}
            onMouseEnter={(e) => handleMouseEnter("Profile", e)}
            onMouseLeave={handleMouseLeave}
          />
          {!isCollapsed && (
            <div className="ml-3">
              <div className="text-sm hover:font-blue-600 font-semibold cursor-pointer"              
              onClick={() => setActiveComponent("Profile")}     
              onMouseEnter={(e) => handleMouseEnter("Profile", e)}
              onMouseLeave={handleMouseLeave}                
              >
                Profile
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredItem && (
        <div
          className="fixed bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-[99999] pointer-events-none"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            transform: "translateY(-50%)",
          }}
        >
          {hoveredItem}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
        </div>
      )}
    </>
  );
};

export default ManagerSidebar;
