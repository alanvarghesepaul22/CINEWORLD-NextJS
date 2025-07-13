// app/trending/[type]/page.jsx
import React from "react";
import MovieCards from "@/components/display/MovieCards";

async function getData(type) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const endpoint = type === "tv" ? "/trending/tv/week" : "/trending/movie/week";

  const res = await fetch(`https://api.themoviedb.org/3${endpoint}?api_key=${apiKey}&language=en-US`);
  if (!res.ok) throw new Error("Failed to fetch trending content");
  const data = await res.json();
  return data.results;
}

export default async function TrendingTypePage({ params }) {
  const { type } = params;
  const data = await getData(type);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">
        Trending {type === "tv" ? "Series" : "Movies"}
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data.map((item) => (
          <MovieCards key={item.id} MovieCard={item} />
        ))}
      </div>
    </div>
  );
}
