"use client";
import React from "react";
import Link from "next/link";
import MovieCards from "./MovieCards";

const SectionRow = ({ title, movies, link }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-white">
          {link ? (
            <Link href={link} className="hover:text-primary transition">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {link && (
          <Link
            href={link}
            className="text-sm text-primary hover:underline hover:text-yellow-300"
          >
            See all →
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto gap-4 scrollbar-hide">
        {movies.map((movie) => (
          <MovieCards key={movie.id} MovieCard={movie} />
        ))}
      </div>
    </div>
  );
};

export default SectionRow;
