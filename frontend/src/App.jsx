import React, { useState } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import DisclaimerBanner from './components/DisclaimerBanner';
import { SearchProvider } from './context/SearchContext';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gradient-dark text-dark-text-primary">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Disclaimer Banner */}
        <DisclaimerBanner />
        
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
          {activeTab === 'search' && (
            <div className="space-y-4 sm:space-y-8">
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
