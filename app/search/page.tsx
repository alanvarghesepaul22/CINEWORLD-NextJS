"use client";
import SearchDisplay from "@/components/display/SearchDisplay";
import FilterWrapper from "@/components/filter/FilterWrapper";
import SearchBar from "@/components/searchbar/SearchBar";
import PageTitle from "@/components/title/PageTitle";
import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

type ContentSource = 'search' | 'filter' | 'none';

const Search: React.FC = () => {
  // Search-related state
  const [searchResults, setSearchResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [typedValue, setTypedValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Filter-related state
  const [filterResults, setFilterResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  // Display state - determines which results to show
  const [activeSource, setActiveSource] = useState<ContentSource>('none');
  const [displayResults, setDisplayResults] = useState<(TMDBMovie | TMDBTVShow)[]>([]);

  // Debounced search value
  const [debouncedSearchValue] = useDebounce(typedValue, 1000);

  /**
   * Handle search functionality - completely independent of filters
   */
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchValue.trim() === "") {
        setSearchResults([]);
        setSearchError(null);
        if (activeSource === 'search') {
          setActiveSource('none');
          setDisplayResults([]);
        }
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const result = await api.search(debouncedSearchValue);
        setSearchResults(result.results);
        setActiveSource('search');
        setDisplayResults(result.results);
        
        if (result.results.length === 0) {
          setSearchError(`No results found for "${debouncedSearchValue}"`);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchError('Search failed. Please try again.');
        setSearchResults([]);
        if (activeSource === 'search') {
          setActiveSource('none');
          setDisplayResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchValue, activeSource]);

  /**
   * Handle search input changes
   */
  const handleSearchInput = (value: string) => {
    setTypedValue(value);
  };

  /**
   * Handle filter results from FilterWrapper
   */
  const handleFilterResults = (results: (TMDBMovie | TMDBTVShow)[]) => {
    setFilterResults(results);
    setActiveSource('filter');
    setDisplayResults(results);
  };

  /**
   * Handle filter loading state
   */
  const handleFilterLoading = (isLoading: boolean) => {
    setIsFiltering(isLoading);
  };

  /**
   * Handle filter errors
   */
  const handleFilterError = (error: string | null) => {
    setFilterError(error);
  };

  /**
   * Determine loading state based on active source
   */
  const isLoading = activeSource === 'search' ? isSearching : isFiltering;

  /**
   * Determine error message based on active source
   */
  const currentError = activeSource === 'search' ? searchError : filterError;

  /**
   * Get status message for display
   */
  const getStatusMessage = (): string | null => {
    if (currentError) return currentError;
    
    if (activeSource === 'search' && searchResults.length > 0) {
      return `Found ${searchResults.length} result(s) for "${debouncedSearchValue}"`;
    }
    
    if (activeSource === 'filter' && filterResults.length > 0) {
      return `Discovered ${filterResults.length} content item(s)`;
    }
    
    return null;
  };

  return (
    <div className="app-bg-enhanced mt-24">
      <div className="container mx-auto px-4 pb-12">
        <PageTitle segments={[
          { text: "Explore, Discover, and" },
          { text: " Watch", isPrimary: true }
        ]} />
        
        {/* Search Bar Section */}
        <SearchBar onTyping={handleSearchInput} />
        
        {/* Filter Section - Independent of search */}
        <FilterWrapper 
          onResultsChange={handleFilterResults}
          onLoadingChange={handleFilterLoading}
          onErrorChange={handleFilterError}
        />

        {/* Status Message */}
        {getStatusMessage() && (
          <div className="flex justify-center mb-6">
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              currentError 
                ? 'bg-red-900/50 text-red-300 border border-red-700' 
                : 'bg-primary/20 text-primary border border-primary/30'
            }`}>
              {getStatusMessage()}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>
                {activeSource === 'search' ? 'Searching...' : 'Discovering content...'}
              </span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {!isLoading && displayResults.length > 0 && (
          <SearchDisplay movies={displayResults} />
        )}

        {/* Empty State */}
        {!isLoading && activeSource === 'none' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-gray-400 text-lg mb-2">
              Ready to discover amazing content?
            </div>
            <div className="text-gray-500 text-sm">
              Use the search bar above or apply filters to find movies and TV shows
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
