import React from "react";
import MovieCards from "./MovieCards";
import MoviePagination from "../pagination/MoviePagination";

const MovieDisplay = (props) => {
  let { movies, pageid } = props;

  return (
    <>
      <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory px-5 pb-6 scrollbar-hide">
        {movies.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0">
            <MovieCards MovieCard={movie} />
          </div>
        ))}
      </div>
      <MoviePagination pageid={pageid} />
    </>
  );
};

export default MovieDisplay;
