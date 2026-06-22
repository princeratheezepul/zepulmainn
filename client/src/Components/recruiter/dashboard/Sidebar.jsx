// import React, { useState, useEffect } from 'react';
// import { LayoutGrid, Briefcase, BarChart3, ChevronRight, Database } from 'lucide-react';

// const Sidebar = ({ activeComponent, setActiveComponent }) => {
//   const [hoveredItem, setHoveredItem] = useState(null);
//   const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
//   const navItems = [
//     { name: 'Dashboard', icon: <LayoutGrid /> },
//     { name: 'Jobs', icon: <Briefcase /> },
//     { name: 'ZepDB', icon: <Database /> },
//   ];

//   const handleMouseEnter = (itemName, event) => {
//     const rect = event.currentTarget.getBoundingClientRect();
//     setTooltipPosition({
//       x: rect.right + 8, // 8px gap from the icon
//       y: rect.top + rect.height / 2
//     });
//     setHoveredItem(itemName);
//   };

//   const handleMouseLeave = () => {
//     setHoveredItem(null);
//   };

//   return (
//     <>
//       <div className="bg-white text-black flex flex-col justify-between items-center sticky top-0 left-0 h-screen w-20 py-5">
//         <div>
//           <div className="mb-30 flex justify-center">
//             <img src="/zepul_sidebar_logo.png" alt="Logo" className="h-6 w-6 filter brightness-0" />
//           </div>
//           <nav className="flex flex-col gap-8">
//             {navItems.map((item) => (
//               <div key={item.name} className="relative">
//                 <a
//                   href="#"
//                   className={`flex items-center justify-center w-12 h-12 rounded-xl text-black transition-colors duration-200 ${activeComponent === item.name ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 hover:text-black'
//                     }`}
//                   onClick={() => setActiveComponent(item.name)}
//                   onMouseEnter={(e) => handleMouseEnter(item.name, e)}
//                   onMouseLeave={handleMouseLeave}
//                 >
//                   {item.icon}
//                 </a>
//               </div>
//             ))}
//           </nav>
//         </div>
//         <div className="relative">
//           <button
//             onClick={() => setActiveComponent('Settings')}
//             className={`w-12 h-12 flex items-center justify-center rounded-xl focus:outline-none transition-colors duration-200 cursor-pointer ${activeComponent === 'Settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
//               }`}
//             onMouseEnter={(e) => handleMouseEnter('Settings', e)}
//             onMouseLeave={handleMouseLeave}
//           >
//             <img
//               src="https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
//               alt="User avatar"
//               className="w-8 h-8 rounded-full"
//             />
//           </button>
//         </div>
//       </div>
      
//       {/* Tooltip rendered outside sidebar */}
//       {hoveredItem && (
//         <div
//           className="fixed bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-[99999] pointer-events-none"
//           style={{
//             left: tooltipPosition.x,
//             top: tooltipPosition.y,
//             transform: 'translateY(-50%)'
//           }}
//         >
//           {hoveredItem}
//           <div
//             className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent"
//           ></div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  Briefcase,
  Database,
  ChevronLeft,
} from "lucide-react";

const Sidebar = ({ activeComponent, setActiveComponent, isCollapsed, setIsCollapsed }) => {
  // const [isCollapsed, setIsCollapsed] = useState(true);
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

  const navItems = [
    { name: "Dashboard", icon: <LayoutGrid size={20} /> },
    { name: "Jobs", icon: <Briefcase size={20} /> },
    { name: "ZepDB", icon: <Database size={20} /> },
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
      {/* {hoveredItem && (
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
      )} */}
    </>
  );
};

export default Sidebar;
