// import React from 'react';
// import { Home, Briefcase, Wallet, X, ChevronLeft, Menu } from 'lucide-react';

// const Sidebar = ({
//   activeSidebarItem,
//   setActiveSidebarItem,
//   isSidebarOpen,
//   setIsSidebarOpen,
//   isCollapsed,
//   onToggle
// }) => {
//   const sidebarItems = [
//     { id: 'Home', label: 'Home', icon: Home },
//     { id: 'Jobs', label: 'Jobs', icon: Briefcase },
//     { id: 'Wallet', label: 'Wallet', icon: Wallet }
//   ];

//   return (
//     <>
//       {/* Mobile Sidebar Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Left Sidebar */}
//       <div className={`bg-gray-50 flex flex-col fixed lg:fixed lg:top-0 lg:left-0 z-50 h-screen transform transition-all duration-300 ease-in-out ${
//         isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
//       } ${isCollapsed ? 'lg:w-16 border-none shadow-none' : 'lg:w-64 shadow-lg border-r border-gray-200 overflow-hidden'}`}>
//         {isCollapsed ? (
//           /* Collapsed State - Only Hamburger Button */
//           <div className="flex justify-center pt-4">
//             <button
//               onClick={onToggle}
//               className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200 border-2 border-blue-700 flex items-center justify-center"
//               title="Expand sidebar"
//             >
//               <Menu className="h-5 w-5 text-white" />
//             </button>
//           </div>
//         ) : (
//           /* Expanded State - Full Sidebar */
//           <>
//             {/* Logo Section */}
//             <div className="px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <img src="/zepul_trademark.jpg" alt="" className="w-30 h-15" />
//                 </div>
                
//                 {/* Toggle button for desktop */}
//                 <button
//                   onClick={onToggle}
//                   className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
//                   title="Collapse sidebar"
//                 >
//                   <ChevronLeft className="h-5 w-5 text-gray-600" />
//                 </button>
                
//                 {/* Close button for mobile */}
//                 <div
//                   onClick={() => setIsSidebarOpen(false)}
//                   className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   <X className="h-5 w-5 text-gray-600" />
//                 </div>
//               </div>
//             </div>

//             {/* Navigation Items */}
//             <nav className="flex-1 px-2 pt-2 pb-4 overflow-hidden">
//               <ul className="space-y-2">
//                 {sidebarItems.map((item) => {
//                   const IconComponent = item.icon;
//                   const isActive = activeSidebarItem === item.id;
//                   return (
//                     <li key={item.id}>
//                       <div
//                         onClick={() => setActiveSidebarItem(item.id)}
//                         className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
//                           isActive
//                             ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]'
//                             : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                         }`}
//                       >
//                         <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
//                         <span className={`font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </nav>
//           </>
//         )}
//       </div>
//     </>
//   );
// };

// export default Sidebar;



import React, { memo } from "react";
import { X, ChevronLeft, Menu } from "lucide-react";

// Reusable Menu Item
const MenuItem = memo(({ icon, text, isActive, isCollapsed, onClick }) => (
  <div
    className={`flex items-center cursor-pointer px-2 py-2 rounded-lg transition-all duration-200
      ${isActive ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-50 text-gray-700 font-medium"}
      ${isCollapsed ? "justify-center" : ""}
    `}
    onClick={onClick}
  >
    <div
      className={`w-5 h-5 flex-shrink-0 ${
        isActive ? "text-white [&_path]:stroke-white [&_path]:stroke-[2.2]" : "text-gray-600"
      }`}
    >
      {icon}
    </div>
    {!isCollapsed && <span className="ml-2 text-base">{text}</span>}
  </div>
));

const Sidebar = ({
  activeSidebarItem,
  setActiveSidebarItem,
  isSidebarOpen,
  setIsSidebarOpen,
  isCollapsed,
  onToggle,
}) => {
  const sidebarItems = [
    {
      id: "Home",
      label: "Home",
      icon: (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.524 3.31344L4.23565 8.21344C3.18565 9.03011 2.33398 10.7684 2.33398 12.0868V20.7318C2.33398 23.4384 4.53898 25.6551 7.24565 25.6551H20.7557C23.4623 25.6551 25.6673 23.4384 25.6673 20.7434V12.2501C25.6673 10.8384 24.7223 9.03011 23.5673 8.22511L16.3573 3.17344C14.724 2.03011 12.099 2.08844 10.524 3.31344Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 20.9883V17.4883"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "Jobs",
      label: "Jobs",
      icon: (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.33329 25.6667H18.6666C23.3566 25.6667 24.1966 23.7883 24.4416 21.5017L25.3166 12.1683C25.6316 9.32167 24.815 7 19.8333 7H8.16663C3.18496 7 2.36829 9.32167 2.68329 12.1683L3.55829 21.5017C3.80329 23.7883 4.64329 25.6667 9.33329 25.6667Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.33301 6.99992V6.06659C9.33301 4.00159 9.33301 2.33325 13.0663 2.33325H14.933C18.6663 2.33325 18.6663 4.00159 18.6663 6.06659V6.99992"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.3337 15.1667V16.3333C16.3337 16.345 16.3337 16.345 16.3337 16.3567C16.3337 17.6283 16.322 18.6667 14.0003 18.6667C11.6903 18.6667 11.667 17.64 11.667 16.3683V15.1667C11.667 14 11.667 14 12.8337 14H15.167C16.3337 14 16.3337 14 16.3337 15.1667Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25.258 12.8333C22.563 14.7933 19.483 15.9599 16.333 16.3566"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.05664 13.1484C5.68164 14.9451 8.64497 16.0301 11.6666 16.3684"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white h-screen fixed top-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-14" : "w-40"} ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } border-r border-gray-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2 relative">
          {isCollapsed ? (
            <img src="/assets/favicon.png" alt="Logo" className="w-7 h-7 object-contain" />
          ) : (
            <img src="/zepul_trademark.jpg" alt="Logo" className="w-20 h-8 object-contain" />
          )}

          {/* Toggle Button */}
          <button
            onClick={onToggle}
            style={{ borderRadius: 25 }}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-0.5 rounded-full bg-gray-100 hover:bg-gray-200 hover:shadow-md transition-colors border"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Close button for mobile */}
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors absolute right-0 top-2"
          >
            <X className="h-5 w-5 text-gray-600" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-1.5 py-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              text={item.label}
              isActive={activeSidebarItem === item.id}
              isCollapsed={isCollapsed}
              onClick={() => setActiveSidebarItem(item.id)}
            />
          ))}
        </nav>

        {/* Bottom Profile + Logout */}
        <div className="px-2 py-2">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border"
            />
            {!isCollapsed && (
              <div className="ml-1.5">
                <button className="text-sm font-semibold text-gray-600 mb-0">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

