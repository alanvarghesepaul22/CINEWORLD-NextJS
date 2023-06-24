import MovieDisplay from "@/components/display/MovieDisplay";
import HomeFilter from "@/components/filter/HomeFilter";
import SearchBar from "@/components/searchbar/SearchBar";
import MoviesTitle from "@/components/title/MoviesTitle";
import React from "react";

async function getData() {
  const apikey = process.env.API_KEY;
  const resp = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=en-US&page=1`
  );

  if (!resp.ok) {
    throw new Error("Failed to fetch data");
  }
  const data = await resp.json();
  let res = data.results;
  return res;
}

const Movies = async () => {
  const data = await getData();
  return (
    <div className="w-100 h-auto">
      <MoviesTitle />
      <SearchBar />
      <HomeFilter />
      <MovieDisplay movies={data} />
    </div>
  );
};

export default Movies;
