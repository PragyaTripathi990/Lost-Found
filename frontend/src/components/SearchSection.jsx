import React, { useState } from 'react';
import { Search, Camera, Filter, X } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { searchItems } from '../services/api';

const SearchSection = () => {
  const {
    searchQuery,
    searchType,
    filters,
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
      const response = await searchItems({
        type: 'text',
        query: searchQuery,
        filters
      });
      setResults(response.data || []);
    } catch (error) {
      setError('Search failed. Please try again.');
    }
  };

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    try {
      const response = await searchItems({
        type: 'image',
        imageFile,
        filters
      });
      setResults(response.data || []);
    } catch (error) {
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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Find Your Items
        </h2>
        <p className="text-gray-600 text-lg">
          Search by text description or upload an image to find similar items using AI
        </p>
      </div>

      {/* Search Type Tabs */}
      <div className="flex space-x-2 mb-8 bg-gray-100/50 p-2 rounded-2xl">
        <button
          onClick={() => setSearchType('text')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl transition-all duration-200 font-medium ${
            searchType === 'text'
              ? 'bg-white text-blue-700 shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Search className="w-5 h-5" />
          <span>Text Search</span>
        </button>
        
        <button
          onClick={() => setSearchType('image')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl transition-all duration-200 font-medium ${
            searchType === 'image'
              ? 'bg-white text-blue-700 shadow-lg transform scale-105'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>Image Search</span>
        </button>
      </div>

      {/* Search Forms */}
      {searchType === 'text' && (
        <form onSubmit={handleTextSearch} className="space-y-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you're looking for... (e.g., 'black water bottle near library')"
                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-lg shadow-sm transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <Search className="w-5 h-5" />
              <span>{isLoading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </form>
      )}

      {searchType === 'image' && (
        <form onSubmit={handleImageSearch} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white/50 backdrop-blur-sm hover:border-blue-400 transition-colors duration-200">
            {imagePreview ? (
              <div className="space-y-6">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto max-h-64 rounded-2xl shadow-lg"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-red-600 hover:text-red-700 flex items-center space-x-2 mx-auto px-4 py-2 rounded-xl hover:bg-red-50 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Remove Image</span>
                </button>
              </div>
            ) : (
              <div>
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-600 mb-6 text-lg">Upload an image to search for similar items</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Choose Image
                </label>
              </div>
            )}
          </div>
          
          {imageFile && (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <Search className="w-5 h-5" />
              <span>{isLoading ? 'Searching...' : 'Search by Image'}</span>
            </button>
          )}
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-white/50 transition-colors duration-200"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Advanced Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="mt-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl space-y-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Item Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
              >
                <option value="">All Items</option>
                <option value="lost">Lost Items</option>
                <option value="found">Found Items</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ location: e.target.value })}
                placeholder="e.g., Library, Cafeteria, Uniworld 1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
