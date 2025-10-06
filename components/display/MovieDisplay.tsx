"use client"
import React from "react";
import MovieCards from "./MovieCards";
import GenericPagination from "../pagination/GenericPagination";
import { TMDBMovie } from "@/lib/types";

interface MovieDisplayProps {
  movies?: TMDBMovie[];
  pageid?: string;
  category?: string; // e.g., "popular", "top-rated", "now-playing"
}

const MovieDisplay: React.FC<MovieDisplayProps> = ({ movies, pageid, category = "popular" }) => {
  // Construct the base URL for pagination
  const baseUrl = `/movie/${category}`;
  
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5">
        {movies?.map((movie) => {
          return <MovieCards key={movie.id} MovieCard={movie} />;
        })}
      </div>
      {pageid && (
        <GenericPagination 
          currentPage={pageid} 
          baseUrl={baseUrl}
          maxPage={500} // TMDB API limit
        />
      )}
    </>
  );
};

export default MovieDisplay;
