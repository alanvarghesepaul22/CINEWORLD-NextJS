"use client";
import React from "react";
import MovieCards from "./MovieCards";

const SectionRow = ({ title, movies }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="flex overflow-x-auto gap-4 scrollbar-hide">
        {movies.map((movie) => (
          <MovieCards key={movie.id} MovieCard={movie} />
        ))}
      </div>
    </div>
  );
};

export default SectionRow;
