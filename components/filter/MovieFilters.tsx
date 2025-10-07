"use client";
import React, { useState, useEffect } from "react";
import Filter from "./Filter";
import { Label } from "@/components/ui/label";
import { TMDBGenre } from "@/lib/types";
import { api } from "@/lib/api";

interface MovieFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

interface MovieFiltersProps {
  initialFilters: MovieFiltersData;
  onFiltersChange: (filters: MovieFiltersData) => void;
}

const MovieFilters: React.FC<MovieFiltersProps> = ({
  initialFilters,
  onFiltersChange
}) => {
  const [filters, setFilters] = useState<MovieFiltersData>(initialFilters);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await api.getGenres('movie');
        setGenres(genresData.genres);
      } catch (error) {
        console.error('Failed to fetch movie genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Update local state when initial filters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (filterKey: keyof MovieFiltersData, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Filter options
  const categoryOptions = [
    { value: "popular", label: "Popular" },
    { value: "top_rated", label: "Top Rated" },
    { value: "now_playing", label: "Now Playing" },
    { value: "upcoming", label: "Upcoming" }
  ];

  const genreOptions = genres.map(genre => ({ 
    value: genre.id.toString(), 
    label: genre.name 
  }));

  const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "release_date.desc", label: "Newest First" },
    { value: "release_date.asc", label: "Oldest First" },
    { value: "title.asc", label: "A-Z" },
    { value: "title.desc", label: "Z-A" }
  ];

  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <Label className="text-xs font-medium text-gray-300 mb-1">Category</Label>
              <Filter
                label="Category"
                options={categoryOptions}
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                includeReset={false}
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-300 mb-1">Genre</Label>
              <Filter
                label="Genre"
                options={genreOptions}
                value={filters.genre}
                onChange={(value) => handleFilterChange('genre', value)}
                includeReset={true}
                resetLabel="All"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-300 mb-1">Year</Label>
              <Filter
                label="Year"
                options={yearOptions}
                value={filters.year}
                onChange={(value) => handleFilterChange('year', value)}
                includeReset={true}
                resetLabel="Any"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-300 mb-1">Sort</Label>
              <Filter
                label="Sort"
                options={sortOptions}
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                includeReset={false}
              />
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-300 whitespace-nowrap">Category:</Label>
            <Filter
              label="Category"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              includeReset={false}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-300 whitespace-nowrap">Genre:</Label>
            <Filter
              label="Genre"
              options={genreOptions}
              value={filters.genre}
              onChange={(value) => handleFilterChange('genre', value)}
              includeReset={true}
              resetLabel="All"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-gray-300 whitespace-nowrap">Year:</Label>
            <Filter
              label="Year"
              options={yearOptions}
              value={filters.year}
              onChange={(value) => handleFilterChange('year', value)}
              includeReset={true}
              resetLabel="Any"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Label className="text-sm font-medium text-gray-300 whitespace-nowrap">Sort by:</Label>
            <Filter
              label="Sort"
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              includeReset={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieFilters;