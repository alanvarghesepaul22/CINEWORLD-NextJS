import Image from "next/image";
import Link from "next/link";
import React from "react";

const TvCards = (props) => {
  let { TvCard } = props;
  let poster_path = `https://image.tmdb.org/t/p/w342/${TvCard.poster_path}`;
  if (TvCard.poster_path == null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }
  return (
    <div className="w-64 h-96 sm:w-52 sm:h-72 bg-grey m-3 hover:opacity-75 shadow-md">
      <Link
        key={TvCard.id}
        href="/series/[id]"
        as={`/series/${TvCard.id}`}
        title={TvCard.name}
      >
        <Image
          src={poster_path}
          alt={TvCard.name}
          className="rounded w-full h-full"
          width={208}
          height={288}
          unoptimized
        />
      </Link>
    </div>
  );
};

export default TvCards;
