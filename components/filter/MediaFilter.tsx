"use client";
import React, { useState, useEffect } from "react";
import Filter from "./Filter";
import { Label } from "@/components/ui/label";
import { TMDBGenre } from "@/lib/types";

interface MediaFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface MediaFilterProps {
  initialFilters: MediaFiltersData;
  onFiltersChange: (filters: MediaFiltersData) => void;
  type?: "movie" | "tv";
}

const MediaFilter = ({
  initialFilters,
  onFiltersChange,
  type = "movie",
}: MediaFilterProps) => {
  const [filters, setFilters] = useState<MediaFiltersData>(initialFilters);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const sortOptions: SortOption[] = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "release_date.desc", label: "Newest First" },
    { value: "release_date.asc", label: "Oldest First" },
    { value: "title.asc", label: "A-Z" },
    { value: "title.desc", label: "Z-A" },
  ];
  let categoryOptions: CategoryOption[];

  if (type === "movie") {
    categoryOptions = [
      { value: "popular", label: "Popular" },
      { value: "top_rated", label: "Top Rated" },
      { value: "now_playing", label: "Now Playing" },
      { value: "upcoming", label: "Upcoming" },
    ];
  } else {
    categoryOptions = [
      { value: "popular", label: "Popular" },
      { value: "top_rated", label: "Top Rated" },
      { value: "on_the_air", label: "On The Air" },
      { value: "trending", label: "Trending" },
    ];
  }
  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("/api/genres");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const genresData = await response.json();
        setGenres(genresData.genres || []);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
        setGenres([]); // Ensure genres is always an array
      }
    };
    fetchGenres();
  }, []);

  // Update local state when initial filters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (
    filterKey: keyof MediaFiltersData,
    value: string
  ) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const genreOptions = genres.map((genre) => ({
    value: genre.id.toString(),
    label: genre.name,
  }));

  const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="glass-container">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <>
              <Label className="filter-label-xs mb-1">Category</Label>
              <Filter
                label="Category"
                options={categoryOptions}
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
                includeReset={false}
              />
            </>
            <>
              <Label className="filter-label-xs mb-1">Genre</Label>
              <Filter
                label="Genre"
                options={genreOptions}
                value={filters.genre}
                onChange={(value) => handleFilterChange("genre", value)}
                includeReset={true}
                resetLabel="All"
              />
            </>
            <>
              <Label className="filter-label-xs mb-1">Year</Label>
              <Filter
                label="Year"
                options={yearOptions}
                value={filters.year}
                onChange={(value) => handleFilterChange("year", value)}
                includeReset={true}
                resetLabel="Any"
              />
            </>
            <>
              <Label className="filter-label-xs mb-1">Sort</Label>
              <Filter
                label="Sort"
                options={sortOptions}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value)}
                includeReset={false}
              />
            </>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="filter-label-sm whitespace-nowrap">
              Category:
            </Label>
            <Filter
              label="Category"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
              includeReset={false}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="filter-label-sm whitespace-nowrap">Genre:</Label>
            <Filter
              label="Genre"
              options={genreOptions}
              value={filters.genre}
              onChange={(value) => handleFilterChange("genre", value)}
              includeReset={true}
              resetLabel="All"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="filter-label-sm whitespace-nowrap">Year:</Label>
            <Filter
              label="Year"
              options={yearOptions}
              value={filters.year}
              onChange={(value) => handleFilterChange("year", value)}
              includeReset={true}
              resetLabel="Any"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Label className="filter-label-sm whitespace-nowrap">
              Sort by:
            </Label>
            <Filter
              label="Sort"
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => handleFilterChange("sortBy", value)}
              includeReset={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaFilter;
