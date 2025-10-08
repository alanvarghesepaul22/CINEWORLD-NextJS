"use client";
import React from "react";
import MediaDetailLayout from "../layout/MediaDetailLayout";
import MediaPoster from "../display/MediaPoster";
import MediaMeta from "./MediaMeta";
import MediaPlayer from "../display/MediaPlayer";
import DidYouKnowSection from "./DidYouKnowSection";
import { useResume } from "@/lib/useResume";
import { TMDBMovieDetail } from "@/lib/types";

interface MovieInfoProps {
  MovieDetail: TMDBMovieDetail;
  genreArr: string[];
  id: string | number;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ MovieDetail, genreArr, id }) => {
  const { getProgress, markAsWatched, startOver, isWatched } = useResume();
  const progress = getProgress(Number(MovieDetail.id), "movie");
  const watched = isWatched(Number(MovieDetail.id), "movie");

  const title =
    MovieDetail.title || MovieDetail.original_title || "Unknown Title";
  const releaseYear = MovieDetail.release_date
    ? MovieDetail.release_date.slice(0, 4)
    : undefined;

  return (
    <MediaDetailLayout className="pt-16">
      <div className="space-y-8 lg:space-y-12">
        {/* Hero Section - Poster and Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Poster */}
          <div className="lg:col-span-1">
            <MediaPoster
              posterPath={MovieDetail.poster_path}
              title={title}
              className="mx-auto lg:mx-0"
            />
          </div>

          {/* Metadata */}
          <div className="lg:col-span-3">
            <MediaMeta
              type="movie"
              title={title}
              year={releaseYear}
              rating={MovieDetail.vote_average}
              ratingCount={MovieDetail.vote_count}
              runtime={MovieDetail.runtime}
              genres={genreArr}
              overview={MovieDetail.overview}
              watchControls={{
                isWatched: watched,
                hasProgress: progress > 0,
                onMarkWatched: () =>
                  markAsWatched(Number(MovieDetail.id), "movie"),
                onStartOver: () => startOver(Number(MovieDetail.id), "movie"),
              }}
            />
          </div>
        </div>

        {/* Video Player Section */}
        <MediaPlayer mediaId={id} title={title} type="movie" />

        {/* Controls and Additional Info Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Did You Know Section - Full Width */}
          <DidYouKnowSection
            title={title}
            movieData={{
              title: title,
              release_date: MovieDetail.release_date,
              overview: MovieDetail.overview,
              vote_average: MovieDetail.vote_average
            }}
          />
        </div>
      </div>
    </MediaDetailLayout>
  );
};

export default MovieInfo;
