import React from "react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";

const HomeDisplay = (props) => {
  let { movies, pageid } = props;
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5">
        {movies.map((movie) => {
          return <HomeCards key={movie.id} MovieCard={movie} />;
        })}
      </div>
      <HomePagination pageid={pageid} />
    </>
  );
};

export default HomeDisplay;
