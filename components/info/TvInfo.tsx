"use client";
import React from "react";
import MediaDetailLayout from "../layout/MediaDetailLayout";
import MediaPoster from "../display/MediaPoster";
import MediaMeta from "./MediaMeta";
import SeasonDisplay from "../display/SeasonDisplay";
import DidYouKnowSection from "./DidYouKnowSection";
import { useResume } from "@/lib/useResume";
import { TMDBTVDetail } from "@/lib/types";

interface TvInfoProps {
  tvDetail: TMDBTVDetail;
  genreArr: string[];
}

const TvInfo: React.FC<TvInfoProps> = ({ tvDetail, genreArr }) => {
  const { getProgress, markAsWatched, startOver, isWatched } = useResume();
  const progress = getProgress(Number(tvDetail.id), "tv");
  const watched = isWatched(Number(tvDetail.id), "tv");

  // Defensive extraction with safe defaults
  const seasons = tvDetail?.seasons ?? [];
  const seasonCount = tvDetail?.number_of_seasons ?? 0;
  const episodeCount = tvDetail?.number_of_episodes ?? 0;

  const title = tvDetail.name || tvDetail.original_name || "Unknown Title";
  const firstAirYear = tvDetail.first_air_date
    ? tvDetail.first_air_date.slice(0, 4)
    : undefined;

  return (
    <MediaDetailLayout className="pt-16">
      <div className="space-y-8 lg:space-y-12">
        {/* Hero Section - Poster and Metadata */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Poster */}
          <div className="lg:col-span-1">
            <MediaPoster
              posterPath={tvDetail.poster_path}
              title={title}
              className="mx-auto lg:mx-0"
            />
          </div>

          {/* Metadata */}
          <div className="lg:col-span-3">
            <MediaMeta
              type="tv"
              title={title}
              year={firstAirYear}
              rating={tvDetail.vote_average}
              ratingCount={tvDetail.vote_count}
              seasons={seasonCount}
              episodes={episodeCount}
              genres={genreArr}
              overview={tvDetail.overview}
              watchControls={{
                isWatched: watched,
                hasProgress: progress > 0,
                onMarkWatched: () => markAsWatched(Number(tvDetail.id), "tv"),
                onStartOver: () => startOver(Number(tvDetail.id), "tv"),
              }}
            />
          </div>
        </div>

        {/* Seasons Section */}
        {seasons.length > 0 && (
          <div className="glass-container">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Seasons & Episodes
                </h2>
                <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
              </div>

              <SeasonDisplay
                key={tvDetail?.id}
                SeasonCards={seasons}
                TvDetails={tvDetail}
              />
            </div>
          </div>
        )}

        {/* Did You Know Section - Full Width */}
        <div className="max-w-6xl mx-auto">
          <DidYouKnowSection
            title={title}
            movieData={{
              name: title,
              first_air_date: tvDetail.first_air_date,
              overview: tvDetail.overview,
              vote_average: tvDetail.vote_average
            }}
          />
        </div>
      </div>
    </MediaDetailLayout>
  );
};

export default TvInfo;
