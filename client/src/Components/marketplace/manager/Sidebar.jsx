// import React from 'react';
// import { ChevronLeft, Menu } from 'lucide-react';

// const Sidebar = ({ activeTab, onTabChange, isCollapsed, onToggle }) => {
//   return (
//     <div className={`bg-white h-screen fixed top-0 left-0 z-10 hidden lg:block transition-all duration-300 ease-in-out ${
//       isCollapsed
//         ? 'w-16 border-none shadow-none'
//         : 'w-64 py-6 border-r border-gray-200 overflow-y-auto'
//     }`}>
//       {isCollapsed ? (
//         /* Collapsed State - Only Hamburger Button */
//         <div className="flex justify-center pt-4">
//           <button
//             onClick={onToggle}
//             className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200 border-2 border-blue-700 flex items-center justify-center"
//             title="Expand sidebar"
//           >
//             <Menu className="h-5 w-5 text-white" />
//           </button>
//         </div>
//       ) : (
//         /* Expanded State - Full Sidebar */
//         <div className="flex flex-col px-6">
//           {/* ZEPUL Logo and Toggle Button */}
//           <div className="flex items-center justify-between mb-3">
//             <img src="/zepul_trademark.jpg" alt="" className="w-30 h-15" />
//             <button
//               onClick={onToggle}
//               className="p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
//               title="Collapse sidebar"
//             >
//               <ChevronLeft className="h-5 w-5 text-gray-600" />
//             </button>
//           </div>

//           {/* Navigation Items */}
//           <div className="space-y-2">
//             {/* Home */}
//             <div
//               className="flex items-center space-x-3 px-2.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
//               onClick={() => onTabChange('home')}
//               style={{
//                 backgroundColor: activeTab === 'home' ? '#2563eb' : 'transparent'
//               }}
//             >
//             <svg  viewBox="0 0 28 28" className={`w-5 h-5 ${activeTab === 'home' ? 'text-white fill-current' : 'text-gray-600'
//               }`} fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
//               <path d="M10.524 3.31344L4.23565 8.21344C3.18565 9.03011 2.33398 10.7684 2.33398 12.0868V20.7318C2.33398 23.4384 4.53898 25.6551 7.24565 25.6551H20.7557C23.4623 25.6551 25.6673 23.4384 25.6673 20.7434V12.2501C25.6673 10.8384 24.7223 9.03011 23.5673 8.22511L16.3573 3.17344C14.724 2.03011 12.099 2.08844 10.524 3.31344Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
//               <path d="M14 20.9883V17.4883" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
//             </svg>

//               <span className={`${activeTab === 'home'
//                   ? 'text-white font-bold'
//                   : 'text-gray-700 font-medium'
//                 }`}>Home</span>
//           </div>

//             {/* Jobs */}
//             <div
//               className="flex items-center space-x-3 px-2.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
//               onClick={() => onTabChange('jobs')}
//               style={{
//                 backgroundColor: activeTab === 'jobs' ? '#2563eb' : 'transparent'
//               }}
//             >
//               <svg  viewBox="0 0 28 28" className={`w-5 h-5 ${activeTab === 'jobs' ? 'text-white fill-current' : 'text-gray-600'
//               }`} fill={activeTab === 'jobs' ? 'currentColor' : 'none'} stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M9.33329 25.6667H18.6666C23.3566 25.6667 24.1966 23.7883 24.4416 21.5017L25.3166 12.1683C25.6316 9.32167 24.815 7 19.8333 7H8.16663C3.18496 7 2.36829 9.32167 2.68329 12.1683L3.55829 21.5017C3.80329 23.7883 4.64329 25.6667 9.33329 25.6667Z" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//                 <path d="M9.33301 6.99992V6.06659C9.33301 4.00159 9.33301 2.33325 13.0663 2.33325H14.933C18.6663 2.33325 18.6663 4.00159 18.6663 6.06659V6.99992" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//                 <path d="M16.3337 15.1667V16.3333C16.3337 16.345 16.3337 16.345 16.3337 16.3567C16.3337 17.6283 16.322 18.6667 14.0003 18.6667C11.6903 18.6667 11.667 17.64 11.667 16.3683V15.1667C11.667 14 11.667 14 12.8337 14H15.167C16.3337 14 16.3337 14 16.3337 15.1667Z" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//                 <path d="M25.258 12.8333C22.563 14.7933 19.483 15.9599 16.333 16.3566" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//                 <path d="M3.05664 13.1484C5.68164 14.9451 8.64497 16.0301 11.6666 16.3684" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//               </svg>

//               <span className={`${activeTab === 'jobs'
//                   ? 'text-white font-bold'
//                   : 'text-gray-700 font-medium'
//                 }`}>Jobs</span>
//           </div>

//             {/* Payments */}
//             <div
//               className="flex items-center space-x-3 px-2.5 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50"
//               onClick={() => onTabChange('payments')}
//               style={{
//                 backgroundColor: activeTab === 'payments' ? '#2563eb' : 'transparent'
//               }}
//             >
//             <svg className={`w-5 h-5 ${activeTab === 'payments' ? 'text-white fill-current' : 'text-gray-600'
//               }`} fill={activeTab === 'payments' ? 'currentColor' : 'none'}  viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
//               <path d="M4.58496 18.5257L18.5266 4.58398" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//               <path d="M12.9512 21.3255L14.3512 19.9255" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//               <path d="M16.0918 18.1868L18.8801 15.3984" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
//               <path d="M4.20116 11.9454L11.9478 4.19875C14.4212 1.72542 15.6578 1.71375 18.1078 4.16375L23.8362 9.89209C26.2862 12.3421 26.2745 13.5788 23.8012 16.0521L16.0545 23.7988C13.5812 26.2721 12.3445 26.2838 9.89449 23.8338L4.16616 18.1054C1.71616 15.6554 1.71616 14.4304 4.20116 11.9454Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
//               <path d="M2.33301 25.665H25.6663" stroke="black" strokeWidth="1.5" strokeLinecap="round" stroke-LineJoin="round"/>
//             </svg>

//               <span className={`${activeTab === 'payments'
//                   ? 'text-white font-bold'
//                   : 'text-gray-700 font-medium'
//                 }`}>Payments</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;
// previous code sidebar by prince

// new code sidebar start 24/09/2025
import React, { memo } from "react";
import { ChevronLeft, Menu } from "lucide-react";

// Reusable Menu Item
const MenuItem = memo(({ icon, text, isActive, isCollapsed, onClick }) => (
  <div
    className={`flex items-center cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200
      ${isActive ? "bg-blue-600 text-white font-bold" : "hover:bg-gray-50 text-gray-700 font-medium"}
      ${isCollapsed ? "justify-center" : ""}
    `}
    onClick={onClick}
  >
    <div
      className={`w-6 h-6 flex-shrink-0 ${
        isActive ? "text-white [&_path]:stroke-white [&_path]:stroke-[2.2]" : "text-gray-600"
      }`}
    >
      {icon}
    </div>
    {!isCollapsed && <span className="ml-3">{text}</span>}
  </div>
));

const Sidebar = ({ activeTab, onTabChange, isCollapsed, onToggle }) => {
  const menuItems = [
    {
      key: "home",
      text: "Home",
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
      key: "jobs",
      text: "Jobs",
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
    {
      key: "payments",
      text: "Payments",
      icon: (
        <svg
          viewBox="0 0 28 28"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.58496 18.5257L18.5266 4.58398"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.9512 21.3255L14.3512 19.9255"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.0918 18.1868L18.8801 15.3984"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.20116 11.9454L11.9478 4.19875C14.4212 1.72542 15.6578 1.71375 18.1078 4.16375L23.8362 9.89209C26.2862 12.3421 26.2745 13.5788 23.8012 16.0521L16.0545 23.7988C13.5812 26.2721 12.3445 26.2838 9.89449 23.8338L4.16616 18.1054C1.71616 15.6554 1.71616 14.4304 4.20116 11.9454Z"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.33301 25.665H25.6663"
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
    <div
      className={`bg-white h-screen fixed top-0 left-0 z-10 hidden lg:flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } border-r border-gray-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 relative">
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
            className="w-28 h-10 object-contain"
          />
        )}

      {/* Toggle Button */}
        <button
          onClick={onToggle} 
          style={{borderRadius:25}}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-0.5 rounded-full bg-gray-100 hover:bg-gray-200 hover:shadow-md transition-colors border"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-4 w-4 text-gray-600 transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            icon={item.icon}
            text={item.text}
            isActive={activeTab === item.key}
            isCollapsed={isCollapsed}
            onClick={() => onTabChange(item.key)}
          />
        ))}
      </nav>
      {/* Bottom Profile + Logout */}
      <div className=" px-3 py-2">
        <div
          className={`flex items-center ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border"
          />
          {!isCollapsed && (
            <div className="ml-3 ">
              <p className="text-sm font-medium text-gray-800 mb-0">Zepul</p>
              <button className="text-sm font-semibold text-gray-600 mb-0">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default Sidebar;

