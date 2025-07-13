// components/display/HorizontalSection.js
"use client";
import React from "react";
import MovieCards from "./MovieCards";

const HorizontalSection = ({ title, movies }) => {
  return (
    <div className="mb-8 px-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">
        {title}
      </h2>
      <div className="flex overflow-x-scroll scrollbar-hide space-x-4">
        {movies.map((movie) => (
          <MovieCards key={movie.id} MovieCard={movie} />
        ))}
      </div>
    </div>
  );
};

export default HorizontalSection;
