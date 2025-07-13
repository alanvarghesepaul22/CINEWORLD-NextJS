// app/watch/[id]/page.jsx
import React from "react";

async function getData(id) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Try movie
  let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=en-US`);
  if (res.ok) {
    const data = await res.json();
    return { ...data, type: "movie" };
  }

  // Try TV show
  res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&language=en-US`);
  if (res.ok) {
    const data = await res.json();
    return { ...data, type: "tv" };
  }

  throw new Error("Media not found");
}

export default async function WatchPage({ params }) {
  const { id } = params;
  const media = await getData(id);

  // Embed URL from vidsrc.to
  const embedSrc =
    media.type === "movie"
      ? `https://vidsrc.to/embed/movie/${id}`
      : `https://vidsrc.to/embed/tv/${id}`;

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">{media.title || media.name}</h1>

      <div className="aspect-w-16 aspect-h-9 mb-6">
        <iframe
          src={embedSrc}
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </div>

      <div className="text-light-white mb-4">{media.overview}</div>

      <div className="text-sm text-gray-400">
        <p>Release Date: {media.release_date || media.first_air_date}</p>
        <p>Rating: ⭐ {media.vote_average}</p>
        <p>Language: {media.original_language?.toUpperCase()}</p>
        <p>Type: {media.type}</p>
      </div>
    </div>
  );
}
