import React from "react";
import { AiTwotoneStar } from "react-icons/ai";

interface MovieDetailsProps {
  MovieDetail?: {
    id?: number;
    title?: string;
    overview?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    release_date?: string;
    vote_average?: number;
    vote_count?: number;
    runtime?: number | null;
    genre_ids?: number[];
    adult?: boolean;
    original_language?: string;
    original_title?: string;
    popularity?: number;
    video?: boolean;
  };
  genreArr?: string[];
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ MovieDetail, genreArr }) => {
  return (
    <div>
      <div className="text-white flex flex-col items-center sm:items-start w-full sm:w-3/5 ml-0 sm:ml-4 px-7 sm:px-5">
        <span>{typeof MovieDetail?.release_date === 'string' && MovieDetail.release_date.trim().length >= 4 ? MovieDetail.release_date.trim().slice(0, 4) : 'N/A'}</span>
        <span>{MovieDetail?.runtime != null ? `${MovieDetail.runtime} mins.` : 'Runtime N/A'}</span>
        <div className="flex items-center">
          <AiTwotoneStar className="text-primary mr-1" />
          <span>{MovieDetail?.vote_average?.toFixed(1) ?? 'N/A'}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center sm:justify-start w-fit my-3 space-x-3 text-sm sm:text-base">
        {genreArr?.map((item) => {
          return (
            <p
              key={item}
              className="text-light-primary border border-light-primary px-3 rounded-full w-fit my-1"
            >
              {item}
            </p>
          );
        }) ?? null}
      </div>
      <p className="text-light-white mt-5 text-justify text-base sm:text-lg">{MovieDetail?.overview?.trim() ? MovieDetail.overview : 'No overview available.'}</p>
    </div>
  );
};

export default MovieDetails;
