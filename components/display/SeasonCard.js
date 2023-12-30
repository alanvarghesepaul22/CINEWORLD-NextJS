import Image from "next/image";
import Link from "next/link";
import React from "react";

const SeasonCard = (props) => {
  let { SeasonDetails, SeriesId } = props;
  let poster_path = `https://image.tmdb.org/t/p/w342/${SeasonDetails.poster_path}`;
  if (SeasonDetails.poster_path == null) {
    poster_path = "https://i.imgur.com/wjVuAGb.png";
  }
  return (
    <div className="flex flex-col items-center ">
      <div className="w-56 h-80 sm:w-52 sm:h-72 bg-grey m-3 hover:opacity-75 shadow-md">
        <Link href="/series/[id]/season/[seasonid]" as={`/series/${SeriesId}/season/${SeasonDetails.season_number}`} title={SeasonDetails.name}>
          <Image
            src={poster_path}
            alt={SeasonDetails.name}
            className="rounded w-full h-full"
            width={208}
            height={288}
            unoptimized
          />
        </Link>
      </div>
      <p className="text-center text-white text-lg font-semibold mb-5">
        {SeasonDetails.name}
      </p>
    </div>
  );
};

export default SeasonCard;
