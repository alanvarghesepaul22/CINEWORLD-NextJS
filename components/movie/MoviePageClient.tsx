"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieDisplay from "@/components/display/MovieDisplay";
import MediaFilter from "@/components/filter/MediaFilter";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";
import PageLoading, { PageEmpty } from "@/components/loading/PageLoading";
interface MovieFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

export default function MoviePageClient() {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<MovieFiltersData>({
    category: "popular",
    genre: "",
    year: "",
    sortBy: "popularity.desc",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || "popular";
    const genre = searchParams.get("genre") || "";
    const year = searchParams.get("year") || "";
    const sortBy = searchParams.get("sort") || "popularity.desc";

    setCurrentPage(page);
    setFilters({ category, genre, year, sortBy });
  }, [searchParams]);

  // Fetch movies when filters or page changes
  const fetchMovies = useCallback(async () => {
    setIsLoading(true);

    try {
      console.log("[MoviePage] Fetching movies with filters:", {
        filters,
        currentPage,
      });

      const movieData = await api.getMedia("movie", {
        category: filters.category as
          | "popular"
          | "top_rated"
          | "now_playing"
          | "upcoming",
        page: currentPage,
        genre: filters.genre || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        sortBy:
          filters.sortBy !== "popularity.desc" ? filters.sortBy : undefined,
      });

      setMovies(movieData.results);
      setTotalPages(Math.min(movieData.total_pages, 500)); // TMDB limit
      setIsLoading(false);
      console.log(
        `[MoviePage] Successfully loaded ${movieData.results.length} movies`
      );
    } catch (error) {
      console.error("[MoviePage] Failed to fetch movies:", error);
      setMovies([]);
      setTotalPages(1);
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const updateURL = (
    newFilters: Partial<MovieFiltersData>,
    newPage?: number
  ) => {
    const params = new URLSearchParams();
    const page = newPage || currentPage;
    const updatedFilters = { ...filters, ...newFilters };

    if (page > 1) params.set("page", page.toString());
    if (updatedFilters.category !== "popular")
      params.set("category", updatedFilters.category);
    if (updatedFilters.genre) params.set("genre", updatedFilters.genre);
    if (updatedFilters.year) params.set("year", updatedFilters.year);
    if (updatedFilters.sortBy !== "popularity.desc")
      params.set("sort", updatedFilters.sortBy);

    const newURL = params.toString() ? `/movie?${params.toString()}` : "/movie";
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: MovieFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };

  return (
    <>
      {/* Filters */}
      <MediaFilter
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
        type="movie"
      />

      {/* Loading State */}
      {isLoading && <PageLoading>Loading movies, please wait...</PageLoading>}

      {/* Movies Display */}
      {!isLoading && movies.length > 0 && (
        <MovieDisplay
          movies={movies}
          pageid={currentPage.toString()}
          totalPages={totalPages}
        />
      )}

      {/* Empty State */}
      {!isLoading && movies.length === 0 && (
        <PageEmpty>No movies found</PageEmpty>
      )}
    </>
  );
}
