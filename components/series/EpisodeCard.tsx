import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatDate } from "@/lib/utils";

interface EpisodeCardProps {
  episodeinfo: {
    still_path: string | null;
    season_number: number;
    episode_number: number;
    name: string;
    overview: string;
    air_date: string | null;
  };
  seriesId: string;
}

const EpisodeCard = ({ episodeinfo, seriesId }: EpisodeCardProps) => {
  const still_path = episodeinfo.still_path
    ? `https://image.tmdb.org/t/p/w342/${episodeinfo.still_path}`
    : "https://i.imgur.com/HIYYPtZ.png";

  // Format the air date safely with user's locale
  const formattedDate = formatDate(episodeinfo.air_date);

  return (
    <div className="glass-container group hover:scale-105 smooth-transition cursor-pointer w-full max-w-sm mx-auto">
      <Link
        href="/series/[id]/season/[seasonid]/[epid]"
        as={`/series/${seriesId}/season/${episodeinfo.season_number}/${episodeinfo.episode_number}`}
        title={episodeinfo.name}
        className="block"
      >
        {/* Episode Image */}
        <div className="relative overflow-hidden rounded-lg mb-3">
          <Image
            src={still_path}
            alt={`${episodeinfo.name} episode still image`}
            className="w-full h-32 sm:h-40 object-cover group-hover:scale-110 smooth-transition"
            width={288}
            height={160}
            unoptimized
          />

          {/* Episode Badge */}
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-primary text-xs font-semibold">
              S{episodeinfo.season_number}E{episodeinfo.episode_number}
            </span>
          </div>
        </div>

        {/* Episode Info */}
        <div className="space-y-2">
          <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 group-hover:text-primary smooth-transition">
            {episodeinfo.name}
          </h3>

          <p className="text-gray-400 text-xs sm:text-sm">
            {formattedDate || "TBD"}
          </p>

          {episodeinfo.overview && (
            <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {episodeinfo.overview}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default EpisodeCard;
