"use client";
import SearchDisplay from "@/components/display/SearchDisplay";
import Filter from "@/components/filter/Filter";
import SearchBar from "@/components/searchbar/SearchBar";
import SearchTitle from "@/components/title/SearchTitle";
import React, { useEffect, useState, useMemo } from "react";
import { useDebounce } from "use-debounce";
import { TMDBMovie, TMDBTVShow, TMDBGenre } from "@/lib/types";
import { api } from "@/lib/api";

const Search: React.FC = () => {
  const [data, setData] = useState<(TMDBMovie | TMDBTVShow)[]>([]);
  const [typedValue, setTypedValue] = useState<string>("");
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [filters, setFilters] = useState({
    genre: "",
    mediaType: "",
    year: "",
    minRating: "",
  });

  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const movieGenres = await api.getGenres('movie');
        const tvGenres = await api.getGenres('tv');
        // Combine and deduplicate
        const allGenres = [...movieGenres.genres, ...tvGenres.genres];
        const uniqueGenres = allGenres.filter((genre, index, self) =>
          index === self.findIndex(g => g.id === genre.id)
        );
        setGenres(uniqueGenres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // This is triggered when user starts typing in search bar
  const handleTyping = (typedValue: string) => {
    setTypedValue(typedValue);
  };

  const [value] = useDebounce(typedValue, 1000);

  useEffect(() => {
    const performSearch = async () => {
      if (value !== "") {
        try {
          const result = await api.search(value);
          setData(result.results);
        } catch (error) {
          console.error('Search failed:', error);
          setData([]);
        }
      } else {
        setData([]);
      }
    };
    performSearch();
  }, [value]);

  // Filter the data based on filters
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filters.genre && !item.genre_ids?.includes(parseInt(filters.genre))) {
        return false;
      }
      const mediaType = 'title' in item ? 'movie' : 'tv';
      if (filters.mediaType && mediaType !== filters.mediaType) {
        return false;
      }
      const year = 'release_date' in item ? item.release_date : item.first_air_date;
      if (filters.year && year && !year.startsWith(filters.year)) {
        return false;
      }
      if (filters.minRating && (item.vote_average || 0) < parseFloat(filters.minRating)) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const genreOptions = genres.map(genre => ({ value: genre.id.toString(), label: genre.name }));
  const mediaTypeOptions = [
    { value: "movie", label: "Movie" },
    { value: "tv", label: "TV Show" },
  ];
  const yearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });
  const ratingOptions = [
    { value: "7", label: "7+" },
    { value: "8", label: "8+" },
    { value: "9", label: "9+" },
  ];

  return (
    <div className="h-full">
      <SearchTitle />
      <SearchBar onTyping={handleTyping} />
      <div className="flex justify-center mt-5">
        <div className="flex flex-wrap gap-3">
          <Filter
            label="Genre"
            options={genreOptions}
            value={filters.genre}
            onChange={(value) => handleFilterChange('genre', value)}
          />
          <Filter
            label="Type"
            options={mediaTypeOptions}
            value={filters.mediaType}
            onChange={(value) => handleFilterChange('mediaType', value)}
          />
          <Filter
            label="Year"
            options={yearOptions}
            value={filters.year}
            onChange={(value) => handleFilterChange('year', value)}
          />
          <Filter
            label="Min Rating"
            options={ratingOptions}
            value={filters.minRating}
            onChange={(value) => handleFilterChange('minRating', value)}
          />
        </div>
      </div>
      <SearchDisplay movies={filteredData} />
    </div>
  );
};

export default Search;
