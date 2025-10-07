import React from "react";
import ResponsiveGrid from "../layout/ResponsiveGrid";
import PaginationWrapper from "../layout/PaginationWrapper";
import MediaCard from "./MediaCard";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface HomeDisplayProps {
  movies: (TMDBMovie | TMDBTVShow)[];
  pageid?: string;
  category?: string; // e.g., "trending"
  baseUrl?: string; // e.g., "/all/trending" - for full control when needed
}

const HomeDisplay: React.FC<HomeDisplayProps> = ({ 
  movies, 
  pageid, 
  category = "trending",
  baseUrl 
}) => {
  // Construct the base URL for pagination - use explicit baseUrl or build from category
  const paginationBaseUrl = baseUrl || `/all/${category}`;
  
  return (
    <>
      <ResponsiveGrid>
        {movies.map((movie) => (
          <MediaCard 
            key={movie.id} 
            media={movie} 
            variant="grid"
          />
        ))}
      </ResponsiveGrid>
      
      <PaginationWrapper 
        pageid={pageid}
        baseUrl={paginationBaseUrl}
        maxPage={500}
      />
    </>
  );
};

export default HomeDisplay;
