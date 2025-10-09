"use client";
import React, { useEffect, useState } from "react";
import MediaPoster from "../display/MediaPoster";
import MediaMeta from "./MediaMeta";
import MediaPlayer from "../display/MediaPlayer";
import DidYouKnowSection from "./DidYouKnowSection";
import { useResume } from "@/lib/useResume";
import { Genre, TMDBMovieDetail } from "@/lib/types";
import { api } from "@/lib/api";
import { InfoLoading } from "../loading/PageLoading";
import InfoNotFound from "../not-found/InfoNotFound";
import MediaDetailLayout from "../layout/MediaDetailLayout";

interface MovieData {
  data: TMDBMovieDetail | null;
  genreArr: string[];
  id: number;
}

interface MovieInfoProps {
  id: number;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ id }) => {
  const [movieData, setMovieData] = useState<MovieData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { getProgress, markAsWatched, startOver, isWatched } = useResume();

  useEffect(() => {
    let isMounted = true;

    const fetchMovieDetails = async () => {
      // Validate ID format
      const parsedId = parseInt(id.toString(), 10);
      if (
        isNaN(parsedId) ||
        parsedId <= 0 ||
        !/^\d+$/.test(id?.toString().trim() || "")
      ) {
        console.error("[MovieDetail] Invalid movie ID format:", id);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        console.log(`[MovieDetail] Fetching movie details for ID: ${parsedId}`);
        const data = (await api.getDetails(
          "movie",
          parsedId
        )) as TMDBMovieDetail;

        if (!isMounted) return;

        const genreArr = data.genres?.map((genre: Genre) => genre.name) || [];
        setMovieData({ data, genreArr, id: parsedId });
        console.log(`[MovieDetail] Successfully loaded movie: ${data.title}`);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;

        const error_ = error as Error & { status?: number; code?: string };

        // Check if it's a 404 not found error
        if (error_.status === 404 || error_.code === "NOT_FOUND") {
          console.log(`[MovieDetail] Movie not found for ID: ${parsedId}`);
          setNotFound(true);
          setIsLoading(false);
        } else {
          // For other errors, show error state
          console.error("[MovieDetail] Failed to fetch movie details:", error_);
          setNotFound(true); // Show not found for any error for now
          setIsLoading(false);
        }
      }
    };

    fetchMovieDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const progress = getProgress(movieData?.id, "movie");
  const watched = isWatched(movieData?.id, "movie");
  const MovieDetail = movieData?.data;
  const title =
    MovieDetail?.title || MovieDetail?.original_title || "Unknown Title";
  const releaseYear = MovieDetail?.release_date
    ? MovieDetail.release_date.slice(0, 4)
    : undefined;

  // Not Found State
  if (notFound) {
    return <InfoNotFound />;
  }

  // Loading State - will show until data is successfully loaded
  if (isLoading || !movieData?.data) {
    return <InfoLoading>Loading Movie Details</InfoLoading>;
  }

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
              genres={movieData.genreArr}
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
            movieData={MovieDetail}
          />
        </div>
      </div>
    </MediaDetailLayout>
  );
};

export default MovieInfo;
