import React from 'react';
import { Search, Upload, MapPin } from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-dark-surface/80 backdrop-blur-md shadow-2xl border-b border-dark-border sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 py-3 sm:py-0 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Lost & Found
              </h1>
              <p className="text-xs sm:text-sm text-dark-text-muted -mt-1">AI-Powered Search</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1 sm:space-x-2 bg-dark-card/50 p-1 rounded-2xl border border-dark-border w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                activeTab === 'search'
                  ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden xs:inline">Search</span>
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
                activeTab === 'upload'
                  ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden xs:inline">Upload</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
