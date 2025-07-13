"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const SearchDisplay = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return <p className="text-center text-light-white py-6">No results found</p>;
  }

  return (
    <div className="grid gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {movies.map((movie) => {
        const title = movie.title || movie.name;
        const poster = movie.poster_path
          ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
          : "https://i.imgur.com/wjVuAGb.png";
        const overview = movie.overview?.length > 100
          ? movie.overview.slice(0, 100) + "..."
          : movie.overview;

        return (
          <Link href={`/watch/${movie.id}`} key={movie.id}>
            <div className="bg-[#1c1c1c] rounded-lg shadow hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer">
              <Image
                src={poster}
                alt={title}
                width={300}
                height={450}
                className="w-full h-auto rounded-t-md object-cover"
                unoptimized
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
                <p className="text-sm text-light-white">{overview}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SearchDisplay;
