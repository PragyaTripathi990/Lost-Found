import React from 'react';
import { AlertCircle, Building2 } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import ResultCard from './ResultCard';

const ResultsSection = () => {
  const { searchResults, isLoading, error, searchQuery, hasSearched, selectedCampus } = useSearch();
  
  // Ensure searchResults is always an array
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  if (isLoading) {
    return (
      <div className="bg-gradient-card backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border p-6 sm:p-8 md:p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-500"></div>
          <span className="ml-3 sm:ml-4 text-dark-text-secondary text-sm sm:text-base md:text-lg font-medium">Searching with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-card backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border p-6 sm:p-8 md:p-12">
        <div className="flex items-center justify-center text-red-400">
          <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
          <span className="text-sm sm:text-base md:text-lg font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // Only show "No Results" if we have actually performed a search
  if (safeSearchResults.length === 0 && hasSearched && !isLoading) {
    return (
      <div className="bg-gradient-card backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border p-6 sm:p-8 md:p-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-dark-text-muted mx-auto mb-4 sm:mb-6" />
          <h3 className="text-xl sm:text-2xl font-semibold text-dark-text-primary mb-2 sm:mb-3">No items found</h3>
          <p className="text-dark-text-secondary text-sm sm:text-base md:text-lg mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          {selectedCampus && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-amber-300 text-sm">
                <Building2 className="w-4 h-4 inline mr-2" />
                Currently searching in <strong>{selectedCampus}</strong> only. 
                Try selecting "All Campuses" for broader results.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Don't show anything if no search has been performed yet
  if (safeSearchResults.length === 0 && !hasSearched) {
    return null;
  }

  return (
    <div className="bg-gradient-card backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8 border-b border-dark-border bg-gradient-to-r from-primary-900/20 to-primary-800/20">
        <h3 className="text-xl sm:text-2xl font-bold text-dark-text-primary mb-1 sm:mb-2">
          Search Results
          {searchQuery && (
            <span className="text-dark-text-muted font-normal ml-2 sm:ml-3 text-sm sm:text-base">
              for "{searchQuery}"
            </span>
          )}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-dark-text-secondary text-sm sm:text-base md:text-lg">
          <span>{safeSearchResults.length} item{safeSearchResults.length !== 1 ? 's' : ''} found using AI similarity search</span>
          {selectedCampus && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs sm:text-sm">
              <Building2 className="w-3 h-3" />
              {selectedCampus}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {safeSearchResults.map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
