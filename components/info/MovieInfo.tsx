"use client";
import React from "react";
import ImageCard from "../display/ImageCard";
import MovieDetails from "./MovieDetails";
import { useResume } from "@/lib/useResume";
import { Button } from "@/components/ui/button";

interface MovieInfoProps {
  MovieDetail: {
    id: string | number;
    poster_path: string | null;
    title?: string;
    name?: string;
    // Add other MovieDetail properties used in ImageCard and MovieDetails
  };
  genreArr: string[] | number[];
  id: string | number;
}

const MovieInfo = (props: MovieInfoProps) => {
  let { MovieDetail, genreArr, id } = props;
  // …
  const { getProgress, markAsWatched, startOver, isWatched } = useResume();
  const progress = getProgress(Number(MovieDetail.id), 'movie');
  const watched = isWatched(Number(MovieDetail.id), 'movie');

  return (
    <div>
      <div className="flex flex-row flex-wrap place-content-center items-center mb-10 mt-5">
        <ImageCard mediaDetail={MovieDetail} />
        <MovieDetails MovieDetail={{ ...MovieDetail, id: Number(MovieDetail.id) }} genreArr={genreArr.map(String)} />
      </div>
      <div className="pt-2 pb-8 flex justify-center">
        <iframe
          className="w-4/5 aspect-video border-0"
          src={"https://v2.vidsrc.me/embed/" + id}
          title="Movie video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={true}
        ></iframe>
        {/* working */}
        {/* https://v2.vidsrc.me/embed/ */}
        {/* https://vidsrc.to/embed/movie/ */}

        {/* not working */}
        {/* https://olgply.xyz/ */}
        {/* src={"https://autoembed.to/movie/tmdb/" + id} */}
      </div>
      <div className="flex justify-center gap-4 mb-8">
        {watched ? (
          <Button onClick={() => startOver(Number(MovieDetail.id), 'movie')}>
            Start Over
          </Button>
        ) : progress > 0 ? (
          <>
            <Button onClick={() => markAsWatched(Number(MovieDetail.id), 'movie')}>
              Mark as Watched
            </Button>
            <Button variant="outline" onClick={() => startOver(Number(MovieDetail.id), 'movie')}>
              Start Over
            </Button>
          </>
        ) : (
          <Button onClick={() => markAsWatched(Number(MovieDetail.id), 'movie')}>
            Mark as Watched
          </Button>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;
