import React from 'react';
import { Search, Upload, MapPin } from 'lucide-react';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-dark-surface/80 backdrop-blur-md shadow-2xl border-b border-dark-border sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Lost & Found
              </h1>
              <p className="text-sm text-dark-text-muted -mt-1">AI-Powered Search</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-2 bg-dark-card/50 p-1 rounded-2xl border border-dark-border">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'search'
                  ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30 transform scale-105'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === 'upload'
                  ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30 transform scale-105'
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
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
