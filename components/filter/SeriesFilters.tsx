"use client";
import React, { useState, useEffect } from "react";
import Filter from "./Filter";
import { Label } from "@/components/ui/label";
import { TMDBGenre } from "@/lib/types";
import { api } from "@/lib/api";

interface SeriesFiltersData {
  category: string;
  genre: string;
  year: string;
  sortBy: string;
}

interface SeriesFiltersProps {
  initialFilters: SeriesFiltersData;
  onFiltersChange: (filters: SeriesFiltersData) => void;
}

const SeriesFilters: React.FC<SeriesFiltersProps> = ({
  initialFilters,
  onFiltersChange
}) => {
  const [filters, setFilters] = useState<SeriesFiltersData>(initialFilters);
  const [genres, setGenres] = useState<TMDBGenre[]>([]);

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresData = await api.getGenres('tv');
        setGenres(genresData.genres);
      } catch (error) {
        console.error('Failed to fetch TV genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Update local state when initial filters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleFilterChange = (filterKey: keyof SeriesFiltersData, value: string) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Filter options
  const categoryOptions = [
    { value: "popular", label: "Popular" },
    { value: "top_rated", label: "Top Rated" },
    { value: "on_the_air", label: "On The Air" },
    { value: "trending", label: "Trending" }
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
    { value: "first_air_date.desc", label: "Newest First" },
    { value: "first_air_date.asc", label: "Oldest First" },
    { value: "name.asc", label: "A-Z" },
    { value: "name.desc", label: "Z-A" }
  ];

  return (
    <div className="container mx-auto px-4 mb-8">
      <div className="glass-container">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <Label className="filter-label-xs">Category</Label>
              <Filter
                label="Category"
                options={categoryOptions}
                value={filters.category}
                onChange={(value) => handleFilterChange('category', value)}
                includeReset={false}
              />
            </div>
            <div>
              <Label className="filter-label-xs">Genre</Label>
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
              <Label className="filter-label-xs">Year</Label>
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
              <Label className="filter-label-xs">Sort</Label>
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
            <Label className="filter-label-sm">Category:</Label>
            <Filter
              label="Category"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              includeReset={false}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="filter-label-sm">Genre:</Label>
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
            <Label className="filter-label-sm">Year:</Label>
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
            <Label className="filter-label-sm">Sort by:</Label>
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

export default SeriesFilters;