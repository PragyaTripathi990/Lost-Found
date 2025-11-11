import React, { useState } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import { SearchProvider } from './context/SearchContext';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {activeTab === 'search' && (
            <div className="space-y-8">
              <SearchSection />
              <ResultsSection />
            </div>
          )}
          
          {activeTab === 'upload' && (
            <UploadSection />
          )}
        </main>
      </div>
    </SearchProvider>
  );
}

export default App;