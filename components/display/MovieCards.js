import React from "react";
import Image from "next/image";
import Link from "next/link";

const MovieCards = ({ MovieCard }) => {
  const poster_path = MovieCard.poster_path
    ? `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  return (
    <Link
      key={MovieCard.id}
      href={`/watch/${MovieCard.id}`}
      title={MovieCard.title || MovieCard.name}
      className="block w-[45%] sm:w-40 md:w-48 lg:w-52 xl:w-56 aspect-[2/3] rounded overflow-hidden bg-grey shadow-md hover:opacity-80 transition"
    >
      <Image
        src={poster_path}
        alt={MovieCard.title || MovieCard.name}
        className="object-cover w-full h-full"
        width={208}
        height={312}
        unoptimized
      />
    </Link>
  );
};

export default MovieCards;
