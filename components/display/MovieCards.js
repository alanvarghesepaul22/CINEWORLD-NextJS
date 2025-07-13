import React from "react";
import Image from "next/image";
import Link from "next/link";

const MovieCards = ({ MovieCard }) => {
  let poster_path = `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
  if (MovieCard.poster_path == null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }

  return (
    <div className="w-40 sm:w-48 md:w-52 lg:w-56 h-auto bg-grey m-2 hover:opacity-75 shadow-md transition-all duration-200">
      <Link href={`/watch/${MovieCard.id}`}>
        <Image
          src={poster_path}
          alt={MovieCard.title || MovieCard.name}
          className="rounded w-full h-full object-cover"
          width={300}
          height={450}
          unoptimized
        />
      </Link>
    </div>
  );
};

export default MovieCards;
