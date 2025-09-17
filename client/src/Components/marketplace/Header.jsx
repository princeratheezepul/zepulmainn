import React from 'react';
import { Search, Bell, Menu, Grid3X3 } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, setIsSidebarOpen, setIsNotificationsOpen, setIsProfileOpen, user, logout }) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery && searchQuery.trim() !== '') {
      setSearchQuery(searchQuery.trim());
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Mobile Menu Button */}
          <div 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-50 mr-4"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-4 pr-10 py-2 bg-gray-100 border-0 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-0 focus:bg-gray-100 text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-1.5 rounded-md hover:bg-gray-900 transition-colors"
              >
                <Search className="h-3 w-3" />
              </button>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4 ml-6">
            <Grid3X3 className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
                      <div className="relative">
            <Bell 
              className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors" 
              onClick={() => setIsNotificationsOpen(true)}
            />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
                      <div 
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
            onClick={() => setIsProfileOpen(true)}
          >
            <img 
              src="/api/placeholder/32/32" 
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {user ? user.firstName?.charAt(0)?.toUpperCase() || 'U' : 'U'}
            </div>
          </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
