import React, { useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";

/**
 * The navigation rail shared by the admin, manager, employer-manager and
 * recruiter consoles.
 *
 * It collapses to an icon rail on large screens — with tooltips, since the
 * labels are gone — and becomes a slide-over drawer below `lg`, where there is
 * no room for either width. `items` are `{ name, icon, fullBleed? }`; only
 * `name` and `icon` matter here.
 */
const COLLAPSED_REM = "5rem"; // w-20
const EXPANDED_REM = "13rem"; // w-52

const DashboardSidebar = ({
  items,
  active,
  onSelect,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  userName = "",
  roleLabel = "",
  onProfile,
}) => {
  const [hovered, setHovered] = useState(null);
  const [tooltipAt, setTooltipAt] = useState({ x: 0, y: 0 });

  // Publish the fixed rail's width so layout siblings can offset themselves and
  // not sit underneath it. Cleared on unmount so other pages are unaffected.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--zep-sidebar-width", isCollapsed ? COLLAPSED_REM : EXPANDED_REM);
    return () => root.style.removeProperty("--zep-sidebar-width");
  }, [isCollapsed]);

  const initial = (userName || "U").charAt(0).toUpperCase();

  const showTooltip = (name, event) => {
    if (!isCollapsed) return; // labels are visible when expanded
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipAt({ x: rect.right + 8, y: rect.top + rect.height / 2 });
    setHovered(name);
  };

  const navList = (collapsed) => (
    <nav className="flex-1 flex flex-col gap-1 px-2 py-4 w-full overflow-y-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.name;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(item.name)}
            onMouseEnter={(e) => showTooltip(item.name, e)}
            onMouseLeave={() => setHovered(null)}
            title={item.name}
            className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white font-medium"
                : "text-gray-700 font-medium hover:bg-gray-100"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <span className="shrink-0">
              <Icon size={20} strokeWidth={2} />
            </span>
            {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
          </button>
        );
      })}
    </nav>
  );

  const profileRow = (collapsed) => (
    <div
      className={`flex items-center px-3 py-3 border-t border-gray-100 ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <button
        type="button"
        onClick={onProfile}
        onMouseEnter={(e) => showTooltip(userName || "Profile", e)}
        onMouseLeave={() => setHovered(null)}
        title={userName || "Profile"}
        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer select-none shrink-0"
      >
        {initial}
      </button>
      {!collapsed && (
        <button
          type="button"
          onClick={onProfile}
          className="ml-3 min-w-0 text-left cursor-pointer"
        >
          <span className="block text-sm font-semibold truncate max-w-[120px]" title={userName}>
            {userName || "Profile"}
          </span>
          {roleLabel && <span className="block text-xs text-gray-500 truncate">{roleLabel}</span>}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <div
        className={`bg-white h-screen fixed top-0 left-0 z-20 hidden lg:flex flex-col justify-between transition-all duration-300 border-r border-gray-200 ease-in-out ${
          isCollapsed ? "w-20 items-center" : "w-52"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2 relative w-full">
          <img
            src={isCollapsed ? "/assets/logo-mark.png" : "/assets/logo.png"}
            alt="Zepul"
            className={isCollapsed ? "w-8 h-8 object-contain" : "h-10 w-28 object-contain"}
          />
          <button
            type="button"
            style={{ borderRadius: 25 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 border shadow-sm cursor-pointer z-10"
          >
            <ChevronLeft
              size={14}
              className={`text-gray-600 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {navList(isCollapsed)}
        {profileRow(isCollapsed)}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`bg-white h-screen fixed top-0 left-0 z-40 w-52 flex lg:hidden flex-col justify-between border-r border-gray-200 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2 w-full">
          <img src="/assets/logo.png" alt="Zepul" className="h-10 w-28 object-contain" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
            className="text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        {navList(false)}
        {profileRow(false)}
      </div>

      {/* Tooltip for the collapsed rail */}
      {hovered && isCollapsed && (
        <div
          className="fixed bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-[99999] pointer-events-none hidden lg:block"
          style={{ left: tooltipAt.x, top: tooltipAt.y, transform: "translateY(-50%)" }}
        >
          {hovered}
          <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
