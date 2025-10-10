"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TvDisplay from "@/components/series/TvDisplay";
import MediaFilter from "@/components/filter/MediaFilter";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";
import { PageLoading, PageEmpty } from "@/components/loading/PageLoading";

interface SeriesFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}
const SeriesPageClient = () => {
  const [series, setSeries] = useState<TMDBTVShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<SeriesFiltersData>({
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

  // Fetch series when filters or page changes
  const fetchSeries = useCallback(async () => {
    setIsLoading(true);

    try {
      console.log("[SeriesPage] Fetching series with filters:", {
        filters,
        currentPage,
      });

      const seriesData = await api.getMedia("tv", {
        category: filters.category as
          | "popular"
          | "top_rated"
          | "on_the_air"
          | "trending",
        page: currentPage,
        genre: filters.genre || undefined,
        year: filters.year ? parseInt(filters.year) : undefined,
        sortBy:
          filters.sortBy !== "popularity.desc" ? filters.sortBy : undefined,
      });

      setSeries(seriesData.results);
      setTotalPages(Math.min(seriesData.total_pages, 500)); // TMDB limit
      setIsLoading(false);
      console.log(
        `[SeriesPage] Successfully loaded ${seriesData.results.length} series`
      );
    } catch (error) {
      console.error("[SeriesPage] Failed to fetch series:", error);
      setSeries([]);
      setTotalPages(1);
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const updateURL = (
    newFilters: Partial<SeriesFiltersData>,
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

    const newURL = params.toString()
      ? `/series?${params.toString()}`
      : "/series";
    router.push(newURL, { scroll: false });
  };

  const handleFiltersChange = (newFilters: SeriesFiltersData) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(newFilters, 1);
  };
  return (
    <>
      {" "}
      {/* Filters */}
      <MediaFilter
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
        type="tv"
      />
      {/* Loading State */}
      {isLoading && <PageLoading>Loading TV shows, please wait...</PageLoading>}
      {/* Series Display */}
      {!isLoading && series.length > 0 && (
        <TvDisplay
          series={series}
          pageid={currentPage.toString()}
          totalPages={totalPages}
        />
      )}
      {/* Empty State */}
      {!isLoading && series.length === 0 && (
        <PageEmpty>No TV shows found</PageEmpty>
      )}
    </>
  );
};
export default SeriesPageClient;
