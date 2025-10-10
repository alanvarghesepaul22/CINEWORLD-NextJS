import Link from "next/link";
import React from "react";
import { BiSkipPrevious, BiSkipNext } from "react-icons/bi";

interface EpisodeDetails {
  episode_number: number | string;
  season_number: number | string;
}

interface NextEpisodeProps {
  episodeDetails: EpisodeDetails;
  totalEpisodes: number;
  seriesId: string | number;
  totalSeasons: number;
}

interface NextEpisodeBtnProps {
  episodeDetails: EpisodeDetails;
  totalEpisodes: number;
  seriesId: string | number;
  totalSeasons: number;
}

interface PrevEpisodeBtnProps {
  episodeDetails: EpisodeDetails;
  seriesId: string | number;
}

const NextEpisode = ({
  episodeDetails,
  totalEpisodes,
  seriesId,
  totalSeasons,
}: NextEpisodeProps) => {
  return (
    <div className="flex w-full md:w-2/3 items-center justify-between px-10">
      <PrevEpisodeBtn episodeDetails={episodeDetails} seriesId={seriesId} />
      <NextEpisodeBtn
        episodeDetails={episodeDetails}
        totalEpisodes={totalEpisodes}
        seriesId={seriesId}
        totalSeasons={totalSeasons}
      />
    </div>
  );
};

export default NextEpisode;

const NextEpisodeBtn = ({
  episodeDetails,
  totalEpisodes,
  seriesId,
  totalSeasons,
}: NextEpisodeBtnProps) => {
  return (
    <>
      {Number(episodeDetails.episode_number) === totalEpisodes ? (
        <Link
          href={`/series/[id]/season/[seasonid]`}
          as={`/series/${seriesId}/season/${
            Number(episodeDetails.season_number) + 1 <= totalSeasons
              ? Number(episodeDetails.season_number) + 1
              : Number(episodeDetails.season_number)
          }`}
          className={`${
            Number(episodeDetails.season_number) === totalSeasons
              ? `pointer-events-none bg-grey text-gray-400/25`
              : `bg-grey hover:bg-grey/75 text-primary/90`
          }  transition-all  px-3 py-1 flex items-center justify-center rounded font-semibold text-xs md:text-sm gap-1`}
        >
          <p>Next Season</p>
          <BiSkipNext className="text-lg md:text-2xl" />
        </Link>
      ) : (
        <Link
          href={`/series/[id]/season/[seasonid]/[epid]`}
          as={`/series/${seriesId}/season/${episodeDetails.season_number}/${
            Number(episodeDetails.episode_number) + 1 <= totalEpisodes
              ? Number(episodeDetails.episode_number) + 1
              : Number(episodeDetails.episode_number)
          }`}
          className="bg-grey hover:bg-grey/75 text-primary/90 transition-all px-3 py-1 flex items-center justify-center rounded font-semibold text-xs md:text-sm gap-1"
        >
          <p>Next Episode</p>
          <BiSkipNext className="text-lg md:text-2xl" />
        </Link>
      )}
    </>
  );
};

const PrevEpisodeBtn = ({ episodeDetails, seriesId }: PrevEpisodeBtnProps) => {
  return (
    <>
      {Number(episodeDetails.episode_number) === 1 ? (
        <Link
          href={`/series/[id]/season/[seasonid]`}
          as={`/series/${seriesId}/season/${
            Number(episodeDetails.season_number) - 1 < 1
              ? Number(episodeDetails.season_number)
              : Number(episodeDetails.season_number) - 1
          }`}
          className={`${
            Number(episodeDetails.season_number) === 1
              ? `pointer-events-none bg-grey text-gray-400/25`
              : `bg-grey hover:bg-grey/75 text-primary/90`
          }  transition-all px-3 py-1 flex items-center justify-center rounded font-semibold text-xs md:text-sm gap-1`}
        >
          <BiSkipPrevious className="text-lg md:text-2xl" />
          <p>Prev Season</p>
        </Link>
      ) : (
        <Link
          href={`/series/[id]/season/[seasonid]/[epid]`}
          as={`/series/${seriesId}/season/${episodeDetails.season_number}/${
            Number(episodeDetails.episode_number) - 1
          }`}
          className="bg-grey hover:bg-grey/75 text-primary/90 transition-all px-3 py-1 flex items-center justify-center rounded font-semibold text-xs md:text-sm gap-1"
        >
          <BiSkipPrevious className="text-lg md:text-2xl" />
          <p>Prev Episode</p>
        </Link>
      )}
    </>
  );
};
