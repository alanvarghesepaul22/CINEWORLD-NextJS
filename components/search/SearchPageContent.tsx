/**
 * Search Page Content - Handles search functionality with URL parameters
 * Wrapped component to handle useSearchParams safely
 */

"use client";
import SearchDisplay from "@/components/display/SearchDisplay";
import FilterWrapper from "@/components/filter/FilterWrapper";
import SearchBar from "@/components/searchbar/SearchBar";
import PageTitle from "@/components/title/PageTitle";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

type ContentSource = 'search' | 'filter' | 'none';

/**
 * Loading spinner component for async sections
 */
const AsyncContentLoader: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center py-8">
    <div className="flex items-center gap-3 text-gray-400">
      <div className="w-5 h-5 border-2 border-theme-primary border-t-transparent rounded-full animate-spin"></div>
      <span>{message}</span>
    </div>
  </div>
);

/**
 * Async Results Component - wrapped in its own Suspense boundary
 */
const AsyncResultsSection: React.FC<{
  isLoading: boolean;
  displayResults: (TMDBMovie | TMDBTVShow)[];
  activeSource: ContentSource;
  currentError: string | null;
  statusMessage: string | null;
}> = ({ isLoading, displayResults, activeSource, currentError, statusMessage }) => {
  return (
    <>
      {/* Status Message */}
      {statusMessage && (
        <div className="flex justify-center mb-6">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentError 
              ? 'bg-red-900/50 text-red-300 border border-red-700' 
              : 'bg-theme-primary/20 text-theme-primary border border-theme-primary/30'
          }`}>
            {statusMessage}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <AsyncContentLoader 
          message={activeSource === 'search' ? 'Searching...' : 'Discovering content...'}
        />
      )}

      {/* Results Display */}
      {!isLoading && displayResults.length > 0 && (
        <Suspense fallback={<AsyncContentLoader message="Loading results..." />}>
          <SearchDisplay movies={displayResults} />
        </Suspense>
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
    </>
  );
};

const SearchPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
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
   * Initialize search from URL parameters
   */
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && query.trim() !== "") {
      setTypedValue(query);
    }
  }, [searchParams]);

  /**
   * Update URL when search value changes
   */
  const updateSearchURL = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim() === "") {
      params.delete('q');
    } else {
      params.set('q', query);
    }
    
    const newURL = params.toString() ? `/search?${params.toString()}` : '/search';
    router.push(newURL, { scroll: false });
  };

  /**
   * Handle search functionality - completely independent of filters
   */
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchValue.trim() === "") {
        setSearchResults([]);
        setSearchError(null);
        setActiveSource(prev => prev === 'search' ? 'none' : prev);
        setDisplayResults([]);
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
        setActiveSource(prev => prev === 'search' ? 'none' : prev);
        setDisplayResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchValue]);

  /**
   * Handle search input changes
   */
  const handleSearchInput = (value: string) => {
    setTypedValue(value);
    updateSearchURL(value);
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
   * Compute status message once in parent
   */
  const statusMessage: string | null = (() => {
    if (currentError) return currentError;
    
    if (activeSource === 'search' && searchResults.length > 0) {
      return `Found ${searchResults.length} result(s) for "${debouncedSearchValue}"`;
    }
    
    if (activeSource === 'filter' && filterResults.length > 0) {
      return `Discovered ${filterResults.length} content item(s)`;
    }
    
    return null;
  })();

  return (
    <div className="app-bg-enhanced mt-24">
      <div className="container mx-auto px-4 pb-12">
        {/* Static content renders immediately */}
        <PageTitle segments={[
          { text: "Explore, Discover, and" },
          { text: " Watch", isPrimary: true }
        ]} />
        
        {/* Search Bar Section - Static */}
        <SearchBar 
          onTyping={handleSearchInput}
          initialValue={typedValue}
        />
        
        {/* Filter Section - Static wrapper, async content inside */}
        <FilterWrapper 
          onResultsChange={handleFilterResults}
          onLoadingChange={handleFilterLoading}
          onErrorChange={handleFilterError}
        />

        {/* Async content section with its own Suspense boundary */}
        <Suspense fallback={<AsyncContentLoader message="Loading content..." />}>
          <AsyncResultsSection
            isLoading={isLoading}
            displayResults={displayResults}
            activeSource={activeSource}
            currentError={currentError}
            statusMessage={statusMessage}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default SearchPageContent;