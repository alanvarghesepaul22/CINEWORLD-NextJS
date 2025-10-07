import Image from "next/image";
import Link from "next/link";
import React from "react";

interface EpisodeCardProps {
  episodeinfo: {
    still_path: string | null;
    season_number: number;
    episode_number: number;
    name: string;
    overview: string;
    air_date: string;
  };
  seriesId: string;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episodeinfo, seriesId }) => {
  const still_path = episodeinfo.still_path
    ? `https://image.tmdb.org/t/p/w342/${episodeinfo.still_path}`
    : "https://i.imgur.com/HIYYPtZ.png";  return (
    <div className="flex flex-col w-72 h-auto bg-grey m-3 ">
      <div className="hover:opacity-75">
        <Link
          href="/series/[id]/season/[seasonid]/[epid]"
          as={`/series/${seriesId}/season/${episodeinfo.season_number}/${episodeinfo.episode_number}`}
          title={episodeinfo.name}
        >
          <Image
            src={still_path}
            alt={`${episodeinfo.name} episode still image`}
            className="rounded w-full h-full"
            width={288}
            height={176}
            unoptimized
          />
        </Link>
      </div>
      <p className="my-2 text-center text-white text-sm font-light">
        <span className="text-primary font-semibold">
          S{episodeinfo.season_number} E{episodeinfo.episode_number}:
        </span>{" "}
        {episodeinfo.name}
      </p>
    </div>
  );
};

export default EpisodeCard;
