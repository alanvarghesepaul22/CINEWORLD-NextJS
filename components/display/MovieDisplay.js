import React from "react";
import MovieCards from "./MovieCards";
import MoviePagination from "../pagination/MoviePagination";

const MovieDisplay = (props) => {
  let { movies,pageid } = props;
  
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5">
        { movies.map((movie) => {
          return <MovieCards key={movie.id} MovieCard={movie} />;
        })}
      </div>
      <MoviePagination pageid={pageid} />
    </>
  );
};

export default MovieDisplay;
