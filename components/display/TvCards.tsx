import Image from "next/image";
import Link from "next/link";
import React from "react";
import { TMDBTVShow } from "@/lib/types";

interface TvCardsProps {
  seriesData: TMDBTVShow;
}

const TvCards: React.FC<TvCardsProps> = ({ seriesData }) => {
  let poster_path = `https://image.tmdb.org/t/p/w342/${seriesData.poster_path}`;
  if (seriesData.poster_path === null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }
  return (
    <div className="w-52 h-72 bg-grey m-3 hover:opacity-75 shadow-md">
      <Link
        href="/series/[id]"
        as={`/series/${seriesData.id}`}
        title={seriesData.name}
      >
        <Image
          src={poster_path}
          alt={`${seriesData.name} TV series poster`}
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
