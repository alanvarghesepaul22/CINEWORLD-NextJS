// app/new-releases/page.jsx
import React from "react";
import MovieCards from "@/components/display/MovieCards";

async function getNewReleases() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US`);
  if (!res.ok) throw new Error("Failed to fetch new releases");
  const data = await res.json();
  return data.results;
}

export default async function NewReleasesPage() {
  const movies = await getNewReleases();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">New Releases</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {movies.map((movie) => (
          <MovieCards key={movie.id} MovieCard={movie} />
        ))}
      </div>
    </div>
  );
}
