import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
} from "lucide-react";

const ManagerSidebar = ({ activeComponent, setActiveComponent, isCollapsed, setIsCollapsed }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Publish the fixed sidebar's current width so layout siblings (e.g. the global
  // footer) can offset themselves and not get covered. Matches the w-20/w-52 widths
  // (5rem collapsed / 13rem expanded). Cleared on unmount so other pages are unaffected.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--zep-sidebar-width", isCollapsed ? "5rem" : "13rem");
    return () => {
      root.style.removeProperty("--zep-sidebar-width");
    };
  }, [isCollapsed]);

  // Logged-in user's display name + initial for the profile avatar.
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const userName = userInfo?.data?.user?.fullname || userInfo?.data?.user?.username || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  // Sidebar icons (SVGs) - keeping the same as original manager dashboard
  const icons = [
    // Dashboard
    <svg key="dashboard" width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.55556 15.5556H10.8889C11.7444 15.5556 12.4444 14.8556 12.4444 14V1.55556C12.4444 0.7 11.7444 0 10.8889 0H1.55556C0.7 0 0 0.7 0 1.55556V14C0 14.8556 0.7 15.5556 1.55556 15.5556ZM1.55556 28H10.8889C11.7444 28 12.4444 27.3 12.4444 26.4444V20.2222C12.4444 19.3667 11.7444 18.6667 10.8889 18.6667H1.55556C0.7 18.6667 0 19.3667 0 20.2222V26.4444C0 27.3 0.7 28 1.55556 28ZM17.1111 28H26.4444C27.3 28 28 27.3 28 26.4444V14C28 13.1444 27.3 12.4444 26.4444 12.4444H17.1111C16.2556 12.4444 15.5556 13.1444 15.5556 14V26.4444C15.5556 27.3 16.2556 28 17.1111 28ZM15.5556 1.55556V7.77778C15.5556 8.63333 16.2556 9.33333 17.1111 9.33333H26.4444C27.3 9.33333 28 8.63333 28 7.77778V1.55556C28 0.7 27.3 0 26.4444 0H17.1111C16.2556 0 15.5556 0.7 15.5556 1.55556Z" fill="currentColor"/>
    </svg>,
    // Recruiter
    <svg key="recruiter" width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.9998 8.35106C20.9298 8.33939 20.8481 8.33939 20.7781 8.35106C19.1681 8.29273 17.8848 6.97439 17.8848 5.34106C17.8848 3.67272 19.2264 2.33105 20.8948 2.33105C22.5631 2.33105 23.9048 3.68439 23.9048 5.34106C23.8931 6.97439 22.6098 8.29273 20.9998 8.35106Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.7967 16.8446C21.3951 17.1129 23.1567 16.8329 24.3934 16.0046C26.0384 14.9079 26.0384 13.1112 24.3934 12.0146C23.1451 11.1862 21.3601 10.9062 19.7617 11.1862" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.9636 8.35106C7.0336 8.33939 7.11526 8.33939 7.18526 8.35106C8.79526 8.29273 10.0786 6.97439 10.0786 5.34106C10.0786 3.67272 8.73693 2.33105 7.0686 2.33105C5.40026 2.33105 4.05859 3.68439 4.05859 5.34106C4.07026 6.97439 5.3536 8.29273 6.9636 8.35106Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.16635 16.8446C6.56802 17.1129 4.80635 16.8329 3.56969 16.0046C1.92469 14.9079 1.92469 13.1112 3.56969 12.0146C4.81802 11.1862 6.60302 10.9062 8.20135 11.1862" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.9988 17.0669C13.9288 17.0552 13.8471 17.0552 13.7771 17.0669C12.1671 17.0085 10.8838 15.6902 10.8838 14.0569C10.8838 12.3885 12.2255 11.0469 13.8938 11.0469C15.5621 11.0469 16.9038 12.4002 16.9038 14.0569C16.8921 15.6902 15.6088 17.0202 13.9988 17.0669Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.6048 20.7429C8.95984 21.8396 8.95984 23.6363 10.6048 24.7329C12.4715 25.9813 15.5282 25.9813 17.3948 24.7329C19.0398 23.6363 19.0398 21.8396 17.3948 20.7429C15.5398 19.5063 12.4715 19.5063 10.6048 20.7429Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
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
              src="/assets/logo-mark.png"
              alt="Logo"
              className="w-8 h-8 object-contain"
            />
          ) : (
            <img
              src="/assets/logo.png"
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
          <div
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer select-none flex-shrink-0"
            onClick={() => setActiveComponent("Profile")}
            onMouseEnter={(e) => handleMouseEnter("Profile", e)}
            onMouseLeave={handleMouseLeave}
          >
            {userInitial}
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <div className="text-sm hover:font-blue-600 font-semibold cursor-pointer"              
              onClick={() => setActiveComponent("Profile")}     
              onMouseEnter={(e) => handleMouseEnter("Profile", e)}
              onMouseLeave={handleMouseLeave}                
              >
                <span className="block truncate max-w-[120px]" title={userName}>{userName}</span>
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
