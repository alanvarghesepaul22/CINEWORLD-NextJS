import React from "react";
import HomeCards from "./HomeCard";

import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface SearchDisplayProps {
  movies: (TMDBMovie | TMDBTVShow)[];
}

const SearchDisplay: React.FC<SearchDisplayProps> = ({ movies }) => {
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5 min-h-screen">
        {movies?.map((movie) => {
          return <HomeCards key={movie.id} MovieCard={movie} />;
        })}
      </div>
    </>
  );
};

export default SearchDisplay;
