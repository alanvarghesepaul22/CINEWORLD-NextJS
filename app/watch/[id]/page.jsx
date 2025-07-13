// app/watch/[id]/page.jsx

import React from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

async function getData(id) {
  const apiKey = process.env.TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`);
  if (!res.ok) throw new Error("Failed to fetch movie details");
  return res.json();
}

export default async function WatchPage({ params }) {
  const { id } = params;
  const movie = await getData(id);

  const playerSrc = `https://vidsrc.to/embed/movie/${id}`;

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>
      <div className="aspect-w-16 aspect-h-9 mb-6">
        <iframe
          src={playerSrc}
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </div>
      <p className="text-gray-300">{movie.overview}</p>
    </div>
  );
}
