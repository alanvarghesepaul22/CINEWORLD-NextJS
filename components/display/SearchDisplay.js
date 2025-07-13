import React from "react";
import HomeCards from "./HomeCard";

const SearchDisplay = (props) => {
  let { movies } = props;
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5 min-h-screen">
        {movies.map((movie) => {
          return <HomeCards key={movie.id} MovieCard={movie} />;
        })}
      </div>
    </>
  );
};

export default SearchDisplay;
