"use client";

import MovieDisplay from "@/components/display/MovieDisplay";
import MoviesTitle from "@/components/title/MoviesTitle";
import React, { useEffect, useState } from "react";

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  useEffect(() => {
    const getData = async () => {
      try {
        const resp = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=1`
        );
        if (!resp.ok) throw new Error("Failed to fetch data");
        const data = await resp.json();
        setMovies(data.results);
      } catch (err) {
        setError(err.message);
      }
    };

    getData();
  }, [apiKey]);

  return (
    <div className="h-auto">
      <MoviesTitle />
      {error ? (
        <p className="text-red-500 text-center mt-4">{error}</p>
      ) : (
        <MovieDisplay movies={movies} />
      )}
    </div>
  );
};

export default Movies;
