import React from "react";
import Image from "next/image";
import Link from "next/link";

const MovieCards = (props) => {
  const { MovieCard } = props;
  let poster_path = `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
  if (MovieCard.poster_path == null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }
  return (
    <div className="w-64 h-96 sm:w-52 sm:h-72 bg-grey m-3 hover:opacity-75 shadow-md">
      <Link
        key={MovieCard.id}
        href="/movie/[id]"
        as={`/movie/${MovieCard.id}`}
        title={MovieCard.title}
      >
        <Image
          src={poster_path}
          alt={MovieCard.title}
          className="rounded w-full h-full"
          width={208}
          height={288}
          unoptimized
        />
      </Link>
    </div>
  );
};

export default MovieCards;
