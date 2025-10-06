import React from "react";
import GenericPagination from "../pagination/GenericPagination";
import HomeCards from "./HomeCard";
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 py-10 px-5">
        {movies.map((movie) => {
          return <HomeCards key={movie.id} MovieCard={movie} />;
        })}
      </div>
      {pageid && (
        <GenericPagination 
          currentPage={pageid} 
          baseUrl={paginationBaseUrl}
          maxPage={500} // TMDB API limit
        />
      )}
    </>
  );
};

export default HomeDisplay;
