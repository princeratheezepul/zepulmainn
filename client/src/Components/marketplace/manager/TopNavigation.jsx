import React, { useState } from 'react';
import { Search, Bell, Grid, Plus } from 'lucide-react';

const TopNavigation = ({ onSearch, onCreateJob, onProfileClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 hover:bg-gray-700 text-white p-1 rounded"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <div 
            onClick={onCreateJob}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="mb-0.5">Create Job</span>
          </div>

          <div className="flex items-center space-x-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.66602 13.3334H9.33268C11.9993 13.3334 13.3327 12.0001 13.3327 9.33341V6.66675C13.3327 4.00008 11.9993 2.66675 9.33268 2.66675H6.66602C3.99935 2.66675 2.66602 4.00008 2.66602 6.66675V9.33341C2.66602 12.0001 3.99935 13.3334 6.66602 13.3334Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22.666 13.3334H25.3327C27.9993 13.3334 29.3327 12.0001 29.3327 9.33341V6.66675C29.3327 4.00008 27.9993 2.66675 25.3327 2.66675H22.666C19.9993 2.66675 18.666 4.00008 18.666 6.66675V9.33341C18.666 12.0001 19.9993 13.3334 22.666 13.3334Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22.666 29.3334H25.3327C27.9993 29.3334 29.3327 28.0001 29.3327 25.3334V22.6667C29.3327 20.0001 27.9993 18.6667 25.3327 18.6667H22.666C19.9993 18.6667 18.666 20.0001 18.666 22.6667V25.3334C18.666 28.0001 19.9993 29.3334 22.666 29.3334Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.66602 29.3334H9.33268C11.9993 29.3334 13.3327 28.0001 13.3327 25.3334V22.6667C13.3327 20.0001 11.9993 18.6667 9.33268 18.6667H6.66602C3.99935 18.6667 2.66602 20.0001 2.66602 22.6667V25.3334C2.66602 28.0001 3.99935 29.3334 6.66602 29.3334Z" stroke="black" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
            </svg> 
          </div>
          
          <div className="flex items-center space-x-3">
            <svg width="28" height="28" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.0268 4.11865C11.6135 4.11865 8.02678 7.70532 8.02678 12.1187V15.972C8.02678 16.7853 7.68012 18.0253 7.26678 18.7187L5.73345 21.2653C4.78678 22.8387 5.44012 24.5853 7.17345 25.172C12.9201 27.092 19.1201 27.092 24.8668 25.172C26.4801 24.6387 27.1868 22.732 26.3068 21.2653L24.7734 18.7187C24.3734 18.0253 24.0268 16.7853 24.0268 15.972V12.1187C24.0268 7.71865 20.4268 4.11865 16.0268 4.11865Z" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
              <path d="M18.4939 4.50495C18.0805 4.38495 17.6539 4.29162 17.2139 4.23828C15.9339 4.07828 14.7072 4.17162 13.5605 4.50495C13.9472 3.51828 14.9072 2.82495 16.0272 2.82495C17.1472 2.82495 18.1072 3.51828 18.4939 4.50495Z" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.0273 25.6516C20.0273 27.8516 18.2273 29.6516 16.0273 29.6516C14.934 29.6516 13.9207 29.1983 13.2007 28.4783C12.4807 27.7583 12.0273 26.7449 12.0273 25.6516" stroke="black" stroke-opacity="0.7" stroke-width="1.5" stroke-miterlimit="10"/>
              <circle cx="25" cy="7.23828" r="6" fill="#F24F4F"/>
              <path d="M25.528 10.2383V8.88828H22.333V8.30328L25.393 3.93828H26.275V8.22228H27.211V8.88828H26.275V10.2383H25.528ZM23.17 8.22228H25.564V4.77528L23.17 8.22228Z" fill="white"/>
            </svg> 
          </div>

          <div className="flex items-center space-x-3">           
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Profile"
              className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onProfileClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
