import React from 'react';
import { Search, Upload, MapPin } from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Lost & Found
              </h1>
              <p className="text-sm text-gray-500 -mt-1">AI-Powered Search</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2 bg-gray-100/50 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'search'
                  ? 'bg-white text-blue-700 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-700 shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
