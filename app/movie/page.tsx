"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieDisplay from "@/components/display/MovieDisplay";
import PageTitle from "@/components/title/PageTitle";
import MovieFilters from "@/components/filter/MovieFilters";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

interface MovieFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

const MoviePageContent = () => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<MovieFiltersData>({
    category: "popular",
    genre: "",
    year: "",
    sortBy: "popularity.desc"
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || 'popular';
    const genre = searchParams.get('genre') || '';
    const year = searchParams.get('year') || '';
    const sortBy = searchParams.get('sort') || 'popularity.desc';

    setCurrentPage(page);
    setFilters({ category, genre, year, sortBy });
  }, [searchParams]);

  // Fetch movies when filters or page changes
  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const movieData = await api.getMedia('movie', {
        category: filters.category as "popular" | "top_rated" | "now_playing" | "upcoming",
        page: currentPage,
        genre: filters.genre || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        sortBy: filters.sortBy !== 'popularity.desc' ? filters.sortBy : undefined
      });

      setMovies(movieData.results);
      setTotalPages(Math.min(movieData.total_pages, 500)); // TMDB limit
    } catch (error) {
      console.error('Failed to fetch movies:', error);
      setError('Failed to load movies. Please try again.');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const updateURL = (newFilters: Partial<MovieFiltersData>, newPage?: number) => {
    const params = new URLSearchParams();
    const page = newPage || currentPage;
    const updatedFilters = { ...filters, ...newFilters };

    if (page > 1) params.set('page', page.toString());
    if (updatedFilters.category !== 'popular') params.set('category', updatedFilters.category);
    if (updatedFilters.genre) params.set('genre', updatedFilters.genre);
    if (updatedFilters.year) params.set('year', updatedFilters.year);
    if (updatedFilters.sortBy !== 'popularity.desc') params.set('sort', updatedFilters.sortBy);

    const newURL = params.toString() ? `/movie?${params.toString()}` : '/movie';
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: MovieFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle segments={[
        { text: "All" },
        { text: " Movies", isPrimary: true }
      ]} />

      {/* Filters */}
      <MovieFilters
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading movies...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center mb-6">
          <div className="px-4 py-2 rounded-lg text-sm font-medium bg-red-900/50 text-red-300 border border-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Movies Display */}
      {!isLoading && !error && movies.length > 0 && (
        <MovieDisplay movies={movies} pageid={currentPage.toString()} totalPages={totalPages} />
      )}

      {/* Empty State */}
      {!isLoading && !error && movies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-400 text-lg mb-2">No movies found</div>
          <div className="text-gray-500 text-sm">Try adjusting your filters</div>
        </div>
      )}


    </div>
  );
};

const MoviesPage = () => {
  return (
    <Suspense fallback={<div className="app-bg-enhanced min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <MoviePageContent />
    </Suspense>
  );
};

export default MoviesPage;
