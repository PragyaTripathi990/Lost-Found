import React, { useState } from 'react';
import { Search, Camera, Filter, X, Building2 } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { searchItems, CAMPUS_OPTIONS } from '../services/api';

const SearchSection = () => {
  const {
    searchQuery,
    searchType,
    filters,
    selectedCampus,
    isLoading,
    setQuery,
    setSearchType,
    setFilters,
    setLoading,
    setResults,
    setError
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleTextSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Include campus filter from selected campus tab
      const searchFilters = {
        ...filters,
        campus: selectedCampus || filters.campus || undefined
      };
      
      const response = await searchItems({
        type: 'text',
        query: searchQuery,
        filters: searchFilters
      });
      console.log('Search response:', response);
      setResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
    }
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    try {
      // Include campus filter from selected campus tab
      const searchFilters = {
        ...filters,
        campus: selectedCampus || filters.campus || undefined
      };
      
      const response = await searchItems({
        type: 'image',
        imageFile,
        filters: searchFilters
      });
      console.log('Image search response:', response);
      setResults(response.data || []);
    } catch (error) {
      console.error('Image search error:', error);
      setError('Image search failed. Please try again.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="bg-gradient-card backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-dark-border p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 sm:mb-3">
          Find Your Items
        </h2>
        <p className="text-dark-text-secondary text-sm sm:text-base md:text-lg">
          Search by text description or upload an image to find similar items using AI
        </p>
        {selectedCampus && (
          <div className="mt-3 flex items-center gap-2 text-amber-400">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">Searching in: {selectedCampus}</span>
          </div>
        )}
      </div>

      {/* Search Type Tabs */}
      <div className="flex space-x-2 mb-4 sm:mb-6 md:mb-8 bg-dark-surface/50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-dark-border">
        <button
          onClick={() => setSearchType('text')}
          className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
            searchType === 'text'
              ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30'
              : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
          }`}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Text Search</span>
          <span className="xs:hidden">Text</span>
        </button>
        
        <button
          onClick={() => setSearchType('image')}
          className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 py-2.5 sm:py-3 px-3 sm:px-4 md:px-6 rounded-lg sm:rounded-xl transition-all duration-200 font-medium text-sm sm:text-base ${
            searchType === 'image'
              ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30'
              : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-card/50'
          }`}
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Image Search</span>
          <span className="xs:hidden">Image</span>
        </button>
      </div>

      {/* Search Forms */}
      {searchType === 'text' && (
        <form onSubmit={handleTextSearch} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're looking for..."
                className="w-full px-4 sm:px-6 py-3 sm:py-4 border border-dark-border rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary placeholder-dark-text-muted text-base sm:text-lg shadow-lg transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 font-medium text-sm sm:text-base min-h-[44px]"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isLoading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </form>
      )}

      {searchType === 'image' && (
        <form onSubmit={handleImageSearch} className="space-y-4 sm:space-y-6">
          <div className="border-2 border-dashed border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center bg-dark-surface/50 backdrop-blur-sm hover:border-primary-500 transition-colors duration-200">
            {imagePreview ? (
              <div className="space-y-4 sm:space-y-6">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-48 sm:max-h-64 rounded-xl sm:rounded-2xl shadow-lg border border-dark-border w-full object-contain"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-red-400 hover:text-red-300 flex items-center space-x-2 mx-auto px-4 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors duration-200 min-h-[44px]"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Remove Image</span>
                </button>
              </div>
            ) : (
              <div>
                <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-dark-text-muted mx-auto mb-4 sm:mb-6" />
                <p className="text-dark-text-secondary mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">Upload an image to search for similar items</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-primary-500/30 cursor-pointer shadow-lg transition-all duration-200 font-medium text-sm sm:text-base min-h-[44px]"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Choose Image
                </label>
              </div>
            )}
          </div>
          
          {imageFile && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-primary text-white rounded-xl sm:rounded-2xl hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg transition-all duration-200 font-medium text-sm sm:text-base min-h-[44px]"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isLoading ? 'Searching...' : 'Search by Image'}</span>
            </button>
          )}
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 md:mt-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-dark-text-secondary hover:text-dark-text-primary px-3 sm:px-4 py-2 rounded-xl hover:bg-dark-card/50 transition-colors duration-200 min-h-[44px]"
        >
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">Advanced Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-dark-surface/50 backdrop-blur-sm rounded-xl sm:rounded-2xl space-y-4 sm:space-y-6 border border-dark-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
                Item Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value })}
                className="w-full px-4 py-3 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary shadow-sm transition-all duration-200 text-sm sm:text-base min-h-[44px]"
              >
                <option value="">All Items</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ location: e.target.value })}
                placeholder="e.g., Library, Cafeteria"
                className="w-full px-4 py-3 border border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-dark-surface text-dark-text-primary placeholder-dark-text-muted shadow-sm transition-all duration-200 text-sm sm:text-base min-h-[44px]"
              />
            </div>
          </div>

          {/* Minimum Match Percentage */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-dark-text-primary mb-2 sm:mb-3">
              Minimum Match: {Math.round((filters.minSimilarity || 0.2) * 100)}%
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={(filters.minSimilarity || 0.2) * 100}
                onChange={(e) => setFilters({ minSimilarity: parseFloat(e.target.value) / 100 })}
                className="w-full h-2 bg-dark-surface rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-dark-text-muted">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-dark-text-muted mt-1">
                Only show results with match percentage above {Math.round((filters.minSimilarity || 0.2) * 100)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
