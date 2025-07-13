// components/display/HorizontalSection.js
"use client";
import React from "react";
import Link from "next/link";
import MovieCards from "./MovieCards";

const HorizontalSection = ({ title, movies, type, link }) => {
  return (
    <div className="mb-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          {title}
        </h2>
        {link && (
          <Link
            href={link}
            className="text-sm text-primary hover:underline font-medium"
          >
            See All
          </Link>
        )}
      </div>
      <div className="flex overflow-x-scroll scrollbar-hide space-x-4">
        {movies.map((movie) => (
          <MovieCards key={movie.id} MovieCard={movie} />
        ))}
      </div>
    </div>
  );
};

export default HorizontalSection;
