import React from "react";
import MediaCard from "../display/MediaCard";
import ResponsiveGrid from "../layout/ResponsiveGrid";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface SearchDisplayProps {
  movies: (TMDBMovie | TMDBTVShow)[];
}

const SearchDisplay = ({ movies }: SearchDisplayProps) => {
  return (
    <ResponsiveGrid minHeight={true}>
      {movies?.map((movie) => (
        <MediaCard 
          key={movie.id} 
          media={movie} 
          variant="grid"
        />
      ))}
    </ResponsiveGrid>
  );
};

export default SearchDisplay;
