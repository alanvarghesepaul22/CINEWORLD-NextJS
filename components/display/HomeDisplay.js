import React from "react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";

const HomeDisplay = (props) => {
  let { movies, pageid } = props;
  return (
    <>
      <div className="flex overflow-x-auto space-x-4 snap-x snap-mandatory px-5 pb-6 scrollbar-hide">
        {movies.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0">
            <HomeCards MovieCard={movie} />
          </div>
        ))}
      </div>
      <HomePagination pageid={pageid} />
    </>
  );
};

export default HomeDisplay;
