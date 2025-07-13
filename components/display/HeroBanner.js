// components/display/HeroBanner.js
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroBanner = ({ movie }) => {
  if (!movie) return null;

  const backdrop = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const title = movie.title || movie.name || "Untitled";
  const description = movie.overview?.slice(0, 160) + "...";

  return (
    <div className="relative w-full h-[55vh] sm:h-[70vh] mb-10">
      <Image
        src={backdrop}
        alt={title}
        fill
        className="object-cover brightness-50"
        unoptimized
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 text-white bg-gradient-to-t from-black via-transparent">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-sm sm:text-base mb-6 max-w-2xl">{description}</p>
        <Link href={`/watch/${movie.id}`}>
          <button className="bg-primary text-black px-6 py-2 rounded font-semibold hover:bg-yellow-400 transition">
            ▶ Watch Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;
