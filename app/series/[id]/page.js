// app/series/page.jsx
import React from "react";
import MovieCards from "@/components/display/MovieCards";

async function getPopularSeries() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US`);
  const data = await res.json();
  return data.results;
}

export default async function SeriesPage() {
  const series = await getPopularSeries();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Popular Series</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {series.map((item) => (
          <MovieCards key={item.id} MovieCard={item} />
        ))}
      </div>
    </div>
  );
}
