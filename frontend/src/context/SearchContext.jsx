import React, { createContext, useContext, useReducer } from 'react';

const SearchContext = createContext();

const initialState = {
  searchResults: [],
  isLoading: false,
  searchQuery: '',
  searchType: 'text', // 'text', 'image', 'hybrid'
  hasSearched: false, // Track if a search has been performed
  selectedCampus: '', // 'Uniworld 1', 'Uniworld 2', 'SST Campus', or '' for all
  filters: {
    type: '', // 'lost', 'found', or ''
    location: '',
    campus: '', // Campus filter for search
    minSimilarity: 0.2 // Minimum match percentage (0.2 = 20%)
  },
  error: null
};

const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_RESULTS':
      return { 
        ...state, 
        searchResults: action.payload, 
        isLoading: false,
        hasSearched: true,
        error: null 
      };
    
    case 'SET_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SEARCH_TYPE':
      return { ...state, searchType: action.payload };
    
    case 'SET_SELECTED_CAMPUS':
      return { 
        ...state, 
        selectedCampus: action.payload,
        filters: { ...state.filters, campus: action.payload }
      };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        isLoading: false 
      };
    
    case 'CLEAR_RESULTS':
      return { 
        ...state, 
        searchResults: [], 
        searchQuery: '',
        hasSearched: false,
        error: null 
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        searchResults: state.searchResults.filter(item => item.id !== action.payload)
      };
    
    default:
      return state;
  }
};

export const SearchProvider = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setResults = (results) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  };

  const setQuery = (query) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  };

  const setSearchType = (type) => {
    dispatch({ type: 'SET_SEARCH_TYPE', payload: type });
  };

  const setSelectedCampus = (campus) => {
    dispatch({ type: 'SET_SELECTED_CAMPUS', payload: campus });
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearResults = () => {
    dispatch({ type: 'CLEAR_RESULTS' });
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const value = {
    ...state,
    setLoading,
    setResults,
    setQuery,
    setSearchType,
    setSelectedCampus,
    setFilters,
    setError,
    clearResults,
    removeItem
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
