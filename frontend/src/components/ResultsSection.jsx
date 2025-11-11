import React from 'react';
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import ResultCard from './ResultCard';

const ResultsSection = () => {
  const { searchResults, isLoading, error, searchQuery, hasSearched } = useSearch();
  
  // Ensure searchResults is always an array
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600 text-lg font-medium">Searching with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-8 h-8 mr-3" />
          <span className="text-lg font-medium">{error}</span>
        </div>
      </div>
    );
  }

  // Only show "No Results" if we have actually performed a search (not loading and hasSearched is true)
  if (safeSearchResults.length === 0 && hasSearched && !isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No items found</h3>
          <p className="text-gray-600 text-lg">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </div>
      </div>
    );
  }

  // Don't show anything if no search has been performed yet
  if (safeSearchResults.length === 0 && !hasSearched) {
    return null;
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="p-8 border-b border-white/20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results
          {searchQuery && (
            <span className="text-gray-500 font-normal ml-3">
              for "{searchQuery}"
            </span>
          )}
        </h3>
        <p className="text-gray-600 text-lg">
          {safeSearchResults.length} item{safeSearchResults.length !== 1 ? 's' : ''} found using AI similarity search
        </p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeSearchResults.map((item) => (
            <ResultCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
