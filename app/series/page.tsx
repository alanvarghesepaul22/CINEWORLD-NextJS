"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TvDisplay from "@/components/display/TvDisplay";
import PageTitle from "@/components/title/PageTitle";
import SeriesFilters from "@/components/filter/SeriesFilters";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

interface SeriesFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

const SeriesPageContent = () => {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<SeriesFiltersData>({
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

  // Fetch series when filters or page changes
  const fetchSeries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const seriesData = await api.getMedia('tv', {
        category: filters.category as "popular" | "top_rated" | "on_the_air" | "trending",
        page: currentPage,
        genre: filters.genre || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        sortBy: filters.sortBy !== 'popularity.desc' ? filters.sortBy : undefined
      });

      setSeries(seriesData.results);
      setTotalPages(Math.min(seriesData.total_pages, 500)); // TMDB limit
    } catch (error) {
      console.error('Failed to fetch series:', error);
      setError('Failed to load TV shows. Please try again.');
      setSeries([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const updateURL = (newFilters: Partial<SeriesFiltersData>, newPage?: number) => {
    const params = new URLSearchParams();
    const page = newPage || currentPage;
    const updatedFilters = { ...filters, ...newFilters };

    if (page > 1) params.set('page', page.toString());
    if (updatedFilters.category !== 'popular') params.set('category', updatedFilters.category);
    if (updatedFilters.genre) params.set('genre', updatedFilters.genre);
    if (updatedFilters.year) params.set('year', updatedFilters.year);
    if (updatedFilters.sortBy !== 'popularity.desc') params.set('sort', updatedFilters.sortBy);

    const newURL = params.toString() ? `/series?${params.toString()}` : '/series';
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: SeriesFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  return (
    <div className="app-bg-enhanced mt-24">
      <PageTitle segments={[
        { text: "TV Shows &" },
        { text: " Series", isPrimary: true }
      ]} />

      {/* Filters */}
      <SeriesFilters
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading TV shows...</span>
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

      {/* Series Display */}
      {!isLoading && !error && series.length > 0 && (
        <TvDisplay series={series} pageid={currentPage.toString()} totalPages={totalPages} />
      )}

      {/* Empty State */}
      {!isLoading && !error && series.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-gray-400 text-lg mb-2">No TV shows found</div>
          <div className="text-gray-500 text-sm">Try adjusting your filters</div>
        </div>
      )}


    </div>
  );
};

const SeriesPage = () => {
  return (
    <Suspense fallback={<div className="app-bg-enhanced min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <SeriesPageContent />
    </Suspense>
  );
};

export default SeriesPage;
