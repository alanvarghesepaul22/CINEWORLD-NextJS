"use client"
import React from "react";
import MediaCard from "./MediaCard";
import ResponsiveGrid from "../layout/ResponsiveGrid";
import PaginationWrapper from "../layout/PaginationWrapper";
import { TMDBMovie } from "@/lib/types";

interface MovieDisplayProps {
  movies?: TMDBMovie[];
  pageid?: string;
  totalPages?: number;
}

const MovieDisplay: React.FC<MovieDisplayProps> = ({ movies, pageid, totalPages = 500 }) => {
  // Use base URL with query params for pagination
  const baseUrl = `/movie`;
  
  return (
    <>
      <ResponsiveGrid>
        {movies?.map((movie) => (
          <MediaCard 
            key={movie.id} 
            media={movie} 
            variant="grid"
          />
        ))}
      </ResponsiveGrid>
      
      <PaginationWrapper 
        pageid={pageid}
        baseUrl={baseUrl}
        maxPage={totalPages}
      />
    </>
  );
};

export default MovieDisplay;
