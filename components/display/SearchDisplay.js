import React from "react";
import HomeCards from "./HomeCard";

const SearchDisplay = ({ movies = [] }) => {
  return (
    <div className="flex flex-wrap justify-center py-10 px-5 min-h-screen">
      {movies.length > 0 ? (
        movies.map((movie) => <HomeCards key={movie.id} MovieCard={movie} />)
      ) : (
        <p>No movies found.</p>
      )}
    </div>
  );
};

export default SearchDisplay;
